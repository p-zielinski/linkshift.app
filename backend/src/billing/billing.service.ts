import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  OrganizationConfiguration,
  OrganizationPlan,
  OrganizationStatus,
  OrganizationSubscription,
} from '@shared/models/organization-config.model';
import { CacheManagerService, DataType } from '../cache/cache-manager.service';
import {
  CHECKOUT_PLANS,
  getPlanLimits,
  getVariantIdForPlan,
} from './billing.config';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { AppEntity, createCustomCuid } from '../utils';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { Logger } from 'nestjs-pino';

type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: Record<string, any>;
  };
  data?: {
    id?: string;
    attributes?: Record<string, any>;
  };
};

@Injectable()
export class BillingService {
  private readonly variantIds: {
    starter?: string | null;
    pro?: string | null;
  };
  private readonly defaultSuccessUrl: string;
  private readonly defaultCancelUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly lemon: LemonSqueezyService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {
    this.variantIds = {
      starter: this.configService.get<string>(
        'LEMON_SQUEEZY_VARIANT_STARTER_ID',
      ),
      pro: this.configService.get<string>('LEMON_SQUEEZY_VARIANT_PRO_ID'),
    };
    this.defaultSuccessUrl =
      this.configService.get<string>('LEMON_SQUEEZY_SUCCESS_URL') ?? '';
    this.defaultCancelUrl =
      this.configService.get<string>('LEMON_SQUEEZY_CANCEL_URL') ?? '';
  }

  async createCheckout(params: {
    organizationId: string;
    userId: string;
    plan: OrganizationPlan;
    successUrl?: string;
    cancelUrl?: string;
  }) {
    if (!CHECKOUT_PLANS.includes(params.plan)) {
      throw new Error(`Plan ${params.plan} is not purchasable via checkout.`);
    }

    const variantId = getVariantIdForPlan(params.plan, this.variantIds);
    if (!variantId) {
      throw new Error(`Missing Lemon Squeezy variant for ${params.plan}.`);
    }

    const [organization, user] = await Promise.all([
      this.prisma.organization.findUnique({
        where: { id: params.organizationId },
      }),
      this.prisma.user.findUnique({
        where: { id: params.userId },
      }),
    ]);

    if (!organization || !user) {
      throw new Error('Organization or user not found for checkout.');
    }

    const checkoutSessionId = createCustomCuid(AppEntity.CheckoutSession, 20);
    const baseSuccessUrl = params.successUrl ?? this.defaultSuccessUrl;
    const baseCancelUrl = params.cancelUrl ?? this.defaultCancelUrl;

    const successUrl = this.appendCheckoutSessionId(
      baseSuccessUrl,
      checkoutSessionId,
    );
    const cancelUrl = this.appendCheckoutSessionId(
      baseCancelUrl,
      checkoutSessionId,
    );

    await this.prisma.billingCheckoutSession.create({
      data: {
        id: checkoutSessionId,
        organizationId: organization.id,
        userId: user.id,
        plan: params.plan,
        status: 'PENDING',
        metadata: {
          organizationName: organization.name,
          email: user.email,
        },
      },
    });

    try {
      const checkout = await this.lemon.createCheckout({
        variantId,
        customerEmail: user.email,
        organizationName: organization.name,
        customData: {
          organizationId: organization.id,
          userId: user.id,
          plan: params.plan,
          organizationName: organization.name,
          email: user.email,
          checkoutSessionId,
        },
        successUrl: successUrl || undefined,
        cancelUrl: cancelUrl || undefined,
      });

      if (checkout.checkoutId) {
        await this.prisma.billingCheckoutSession.update({
          where: { id: checkoutSessionId },
          data: { providerCheckoutId: checkout.checkoutId },
        });
      }

      return {
        ...checkout,
        checkoutSessionId,
      };
    } catch (error) {
      await this.prisma.billingCheckoutSession.update({
        where: { id: checkoutSessionId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  async getCustomerPortalUrl(organizationId: string): Promise<string> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found.');
    }

    const config = OrganizationConfiguration.fromJson(
      organization.configuration,
    );

    const subscriptionId = config.activeSubscription.providerSubscriptionId;
    if (!subscriptionId) {
      throw new Error('No active Lemon Squeezy subscription found.');
    }

    const response = await this.lemon.getSubscription(subscriptionId);
    const portalUrl =
      response.data?.attributes?.urls?.customer_portal ??
      response.data?.attributes?.customer_portal;

    if (!portalUrl) {
      throw new Error('Missing customer portal URL from Lemon Squeezy.');
    }

    return portalUrl;
  }

  async handleWebhook(
    rawBody: Buffer,
    signature: string | undefined,
    payload: LemonWebhookPayload,
  ): Promise<void> {
    if (!this.lemon.verifySignature(rawBody, signature)) {
      throw new Error('Invalid Lemon Squeezy signature.');
    }

    const eventName = payload.meta?.event_name ?? 'unknown';
    const attributes = payload.data?.attributes ?? {};
    const subscriptionId = payload.data?.id ?? null;

    if (!eventName.includes('subscription')) {
      this.logger.debug('Ignoring Lemon Squeezy event', { eventName });
      return;
    }

    const customData = {
      ...(attributes.custom ?? {}),
      ...(attributes.custom_data ?? {}),
      ...(payload.meta?.custom_data ?? {}),
    } as Record<string, any>;

    const organizationId =
      customData.organizationId ?? customData.organization_id ?? null;
    const email =
      customData.email ??
      attributes.user_email ??
      attributes.customer_email ??
      null;

    const orgId =
      organizationId ?? (await this.findOrganizationIdByEmail(email));

    if (!orgId) {
      this.logger.warn('Webhook missing organization mapping', { eventName });
      return;
    }

    const plan = this.resolvePlan(customData.plan, attributes.variant_id);
    const status = this.resolveStatus(attributes.status, eventName);

    const subscriptionUpdate = await this.updateOrganizationSubscription(orgId, {
      plan,
      status,
      providerSubscriptionId: subscriptionId,
      providerCustomerId: attributes.customer_id ?? null,
      providerOrderId: attributes.order_id ?? null,
      providerVariantId: attributes.variant_id ?? null,
      activeFrom: this.parseDate(attributes.created_at),
      activeUntil: this.parseDate(attributes.ends_at),
      amount: this.parseAmount(
        attributes.price ?? attributes.unit_price ?? attributes.renewal_price,
      ),
      currency: attributes.currency ?? attributes.currency_code ?? 'EUR',
      interval: this.mapInterval(
        attributes.billing_interval ?? attributes.interval,
      ),
    });

    if (subscriptionUpdate) {
      const renewsAt = this.parseDate(attributes.renews_at);
      const notificationEmail =
        email ?? (await this.findOwnerEmailByOrganizationId(orgId));
      await this.notifyCustomer({
        email: notificationEmail,
        eventName,
        organizationName: subscriptionUpdate.organizationName,
        previous: subscriptionUpdate.previous,
        next: subscriptionUpdate.next,
        amount: subscriptionUpdate.next.amount,
        currency: subscriptionUpdate.next.currency,
        interval: subscriptionUpdate.next.interval,
        endsAt: subscriptionUpdate.next.activeUntil,
        renewsAt,
      });
    }

    const checkoutSessionId =
      customData.checkoutSessionId ??
      customData.checkout_session_id ??
      null;

    if (checkoutSessionId) {
      await this.updateCheckoutSessionFromWebhook({
        checkoutSessionId,
        eventName,
        rawStatus: attributes.status,
        resolvedStatus: status,
        providerSubscriptionId: subscriptionId,
        providerOrderId: attributes.order_id ?? null,
      });
    }
  }

  async getCheckoutSessionStatus(organizationId: string, sessionId: string) {
    const session = await this.prisma.billingCheckoutSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.organizationId !== organizationId) {
      throw new NotFoundException('Checkout session not found.');
    }

    return {
      id: session.id,
      plan: session.plan,
      status: session.status,
      updatedAt: session.updatedAt,
      completedAt: session.completedAt,
    };
  }

  private async updateOrganizationSubscription(
    organizationId: string,
    details: {
      plan: OrganizationPlan;
      status: OrganizationStatus;
      providerSubscriptionId: string | null;
      providerCustomerId: string | null;
      providerOrderId: string | null;
      providerVariantId: string | null;
      activeFrom: Date | null;
      activeUntil: Date | null;
      amount: number;
      currency: string;
      interval: OrganizationSubscription['interval'];
    },
  ): Promise<{
    previous: OrganizationSubscription;
    next: OrganizationSubscription;
    organizationName: string;
  } | null> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      this.logger.warn('Organization not found for billing', {
        organizationId,
      });
      return null;
    }

    const config = OrganizationConfiguration.fromJson(
      organization.configuration,
    );
    const previous = config.activeSubscription;
    const nextSubscription = new OrganizationSubscription({
      plan: details.plan,
      status: details.status,
      activeFrom: details.activeFrom ?? previous.activeFrom,
      activeUntil: details.activeUntil,
      amount: details.amount ?? previous.amount,
      currency: details.currency ?? previous.currency,
      interval: details.interval ?? previous.interval,
      limits: getPlanLimits(details.plan),
      provider: 'LEMON_SQUEEZY',
      providerSubscriptionId: details.providerSubscriptionId,
      providerCustomerId: details.providerCustomerId,
      providerOrderId: details.providerOrderId,
      providerVariantId: details.providerVariantId,
    });

    const overage = await this.findLimitOverage(
      organizationId,
      nextSubscription.limits,
    );
    if (overage) {
      nextSubscription.status = OrganizationStatus.SUSPENDED;
    }

    const subscriptionChanged =
      previous.plan !== nextSubscription.plan ||
      previous.status !== nextSubscription.status ||
      (previous.providerSubscriptionId ?? null) !==
        (nextSubscription.providerSubscriptionId ?? null);

    if (subscriptionChanged) {
      config.subscriptionHistory = [
        previous,
        ...config.subscriptionHistory,
      ].slice(0, 20);
    }

    config.activeSubscription = nextSubscription;

    const serializedConfig = this.serializeConfig(config);

    const updatedOrganization = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        configuration: serializedConfig,
      },
    });

    await this.cacheManagerService.setDataExist({
      data: updatedOrganization,
      dataType: DataType.ORGANIZATIONS,
    });

    return {
      previous,
      next: nextSubscription,
      organizationName: organization.name,
    };
  }

  private async notifyCustomer(params: {
    email: string | null;
    eventName: string;
    organizationName: string;
    previous: OrganizationSubscription;
    next: OrganizationSubscription;
    amount: number;
    currency: string;
    interval: OrganizationSubscription['interval'];
    endsAt: Date | null;
    renewsAt: Date | null;
  }): Promise<void> {
    if (!params.email) {
      return;
    }

    const normalizedEvent = params.eventName.toLowerCase();
    const planChanged = params.previous.plan !== params.next.plan;
    const statusBecameActive =
      params.previous.status !== OrganizationStatus.ACTIVE &&
      params.next.status === OrganizationStatus.ACTIVE;
    const isUpdateEvent =
      normalizedEvent.includes('subscription_updated') ||
      normalizedEvent.includes('subscription_change');

    try {
      if (
        normalizedEvent.includes('subscription_created') ||
        normalizedEvent.includes('subscription_resumed') ||
        statusBecameActive
      ) {
        await this.emailService.sendSubscriptionActivated({
          email: params.email,
          organization: params.organizationName,
          plan: params.next.plan,
          amount: params.amount,
          currency: params.currency,
          interval: params.interval,
        });
      }

      if (
        normalizedEvent.includes('payment_success') ||
        normalizedEvent.includes('payment_succeeded')
      ) {
        await this.emailService.sendSubscriptionRenewal({
          email: params.email,
          organization: params.organizationName,
          plan: params.next.plan,
          amount: params.amount,
          currency: params.currency,
          interval: params.interval,
          renewsAt: params.renewsAt,
        });
      }

      if (
        normalizedEvent.includes('payment_failed') ||
        normalizedEvent.includes('payment_failure')
      ) {
        await this.emailService.sendSubscriptionPaymentFailed({
          email: params.email,
          organization: params.organizationName,
          plan: params.next.plan,
        });
      }

      if (
        normalizedEvent.includes('subscription_cancelled') ||
        normalizedEvent.includes('subscription_canceled') ||
        normalizedEvent.includes('subscription_expired')
      ) {
        await this.emailService.sendSubscriptionCanceled({
          email: params.email,
          organization: params.organizationName,
          plan: params.next.plan,
          endsAt: params.endsAt,
        });
      }

      if (planChanged && isUpdateEvent) {
        await this.emailService.sendPlanChanged({
          email: params.email,
          organization: params.organizationName,
          fromPlan: params.previous.plan,
          toPlan: params.next.plan,
        });
      }
    } catch (error) {
      this.logger.warn('Billing email notification failed', {
        error: error instanceof Error ? error.message : 'unknown_error',
      });
    }
  }

  private serializeConfig(config: OrganizationConfiguration) {
    const serializeSubscription = (subscription: OrganizationSubscription) => ({
      ...subscription,
      activeFrom: subscription.activeFrom?.toISOString?.() ?? null,
      activeUntil: subscription.activeUntil?.toISOString?.() ?? null,
    });

    return {
      activeSubscription: serializeSubscription(config.activeSubscription),
      subscriptionHistory: config.subscriptionHistory.map(
        serializeSubscription,
      ),
    };
  }

  private async findLimitOverage(
    organizationId: string,
    limits: OrganizationSubscription['limits'],
  ): Promise<string | null> {
    const [
      domainGroupCount,
      totalDomainCount,
      totalRuleCount,
      activeUserCount,
      domainCounts,
      ruleCounts,
    ] = await Promise.all([
      this.prisma.domainGroup.count({
        where: { organizationId, deletedAt: null },
      }),
      this.prisma.domain.count({
        where: {
          domainGroup: { organizationId, deletedAt: null },
          deletedAt: null,
        },
      }),
      this.prisma.redirectRule.count({
        where: {
          domainGroup: { organizationId, deletedAt: null },
          deletedAt: null,
        },
      }),
      this.prisma.user.count({
        where: {
          organizationId,
          deletedAt: null,
          isBlocked: false,
        },
      }),
      this.prisma.domain.groupBy({
        by: ['domainGroupId'],
        where: {
          deletedAt: null,
          domainGroup: { organizationId, deletedAt: null },
        },
        _count: { _all: true },
      }),
      this.prisma.redirectRule.groupBy({
        by: ['domainGroupId'],
        where: {
          deletedAt: null,
          domainGroup: { organizationId, deletedAt: null },
        },
        _count: { _all: true },
      }),
    ]);

    if (domainGroupCount > limits.maxDomainGroups) {
      return `Domain groups ${domainGroupCount}/${limits.maxDomainGroups}`;
    }

    if (totalDomainCount > limits.maxTotalDomains) {
      return `Total domains ${totalDomainCount}/${limits.maxTotalDomains}`;
    }

    if (totalRuleCount > limits.maxTotalRules) {
      return `Total rules ${totalRuleCount}/${limits.maxTotalRules}`;
    }

    if (activeUserCount > limits.maxUsers) {
      return `Active users ${activeUserCount}/${limits.maxUsers}`;
    }

    const domainOverage = domainCounts.find(
      (entry) => entry._count._all > limits.maxDomainsPerGroup,
    );
    if (domainOverage) {
      return `Domains per group ${domainOverage._count._all}/${limits.maxDomainsPerGroup}`;
    }

    const ruleOverage = ruleCounts.find(
      (entry) => entry._count._all > limits.maxRulesPerGroup,
    );
    if (ruleOverage) {
      return `Rules per group ${ruleOverage._count._all}/${limits.maxRulesPerGroup}`;
    }

    return null;
  }

  private resolvePlan(
    plan: string | null | undefined,
    variantId: string | number | null | undefined,
  ): OrganizationPlan {
    const normalized = (plan ?? '').toString().toUpperCase();
    if (normalized === String(OrganizationPlan.STARTER)) {
      return OrganizationPlan.STARTER;
    }
    if (normalized === String(OrganizationPlan.PRO)) {
      return OrganizationPlan.PRO;
    }

    const variantIdStr = variantId ? String(variantId) : null;
    if (variantIdStr && variantIdStr === this.variantIds.starter) {
      return OrganizationPlan.STARTER;
    }
    if (variantIdStr && variantIdStr === this.variantIds.pro) {
      return OrganizationPlan.PRO;
    }

    return OrganizationPlan.FREE;
  }

  private resolveStatus(
    rawStatus: string | null | undefined,
    eventName: string,
  ): OrganizationStatus {
    const normalized = (rawStatus ?? '').toString().toLowerCase();
    if (
      eventName.includes('payment_failed') ||
      normalized === 'unpaid' ||
      normalized === 'past_due'
    ) {
      return OrganizationStatus.CANCELED;
    }
    if (normalized === 'cancelled' || normalized === 'expired') {
      return OrganizationStatus.CANCELED;
    }
    if (normalized === 'paused') {
      return OrganizationStatus.SUSPENDED;
    }
    return OrganizationStatus.ACTIVE;
  }

  private async updateCheckoutSessionFromWebhook(params: {
    checkoutSessionId: string;
    eventName: string;
    rawStatus: string | null | undefined;
    resolvedStatus: OrganizationStatus;
    providerSubscriptionId: string | null;
    providerOrderId: string | null;
  }): Promise<void> {
    const session = await this.prisma.billingCheckoutSession.findUnique({
      where: { id: params.checkoutSessionId },
    });

    if (!session) {
      this.logger.warn('Checkout session not found', {
        checkoutSessionId: params.checkoutSessionId,
      });
      return;
    }

    const data: Record<string, any> = {};
    if (params.providerSubscriptionId) {
      data.providerSubscriptionId = params.providerSubscriptionId;
    }
    if (params.providerOrderId) {
      data.providerOrderId = params.providerOrderId;
    }

    if (session.status === 'PENDING') {
      const nextStatus = this.resolveCheckoutStatus(
        params.resolvedStatus,
        params.rawStatus,
        params.eventName,
      );
      data.status = nextStatus;
      if (nextStatus !== 'PENDING') {
        data.completedAt = new Date();
      }
    }

    if (Object.keys(data).length === 0) {
      return;
    }

    await this.prisma.billingCheckoutSession.update({
      where: { id: params.checkoutSessionId },
      data,
    });
  }

  private resolveCheckoutStatus(
    resolvedStatus: OrganizationStatus,
    rawStatus: string | null | undefined,
    eventName: string,
  ): 'PENDING' | 'PAID' | 'CANCELED' | 'FAILED' | 'EXPIRED' {
    if (resolvedStatus === OrganizationStatus.ACTIVE) {
      return 'PAID';
    }

    const normalized = (rawStatus ?? '').toString().toLowerCase();
    if (normalized === 'expired') {
      return 'EXPIRED';
    }
    if (
      eventName.includes('payment_failed') ||
      normalized === 'unpaid' ||
      normalized === 'past_due'
    ) {
      return 'FAILED';
    }
    if (resolvedStatus === OrganizationStatus.CANCELED) {
      return 'CANCELED';
    }
    if (resolvedStatus === OrganizationStatus.SUSPENDED) {
      return 'FAILED';
    }

    return 'FAILED';
  }

  private appendCheckoutSessionId(
    baseUrl: string,
    checkoutSessionId: string,
  ): string {
    if (!baseUrl) {
      return '';
    }
    try {
      const url = new URL(baseUrl);
      url.searchParams.set('checkout_session', checkoutSessionId);
      return url.toString();
    } catch {
      return baseUrl;
    }
  }

  private parseDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private parseAmount(value: unknown): number {
    if (typeof value === 'number') {
      return value / 100;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed / 100;
      }
    }
    return 0;
  }

  private mapInterval(value: string | null | undefined) {
    const normalized = (value ?? '').toString().toLowerCase();
    if (normalized.includes('year')) {
      return 'YEARLY';
    }
    if (normalized.includes('life')) {
      return 'LIFETIME';
    }
    return 'MONTHLY';
  }

  private async findOrganizationIdByEmail(
    email: string | null,
  ): Promise<string | null> {
    if (!email) {
      return null;
    }
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    return user?.organizationId ?? null;
  }

  private async findOwnerEmailByOrganizationId(
    organizationId: string,
  ): Promise<string | null> {
    const owner = await this.prisma.user.findFirst({
      where: {
        organizationId,
        isOwner: true,
        deletedAt: null,
      },
      select: { email: true },
    });
    return owner?.email ?? null;
  }
}
