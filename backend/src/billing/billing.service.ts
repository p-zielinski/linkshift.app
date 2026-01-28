import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly lemon: LemonSqueezyService,
  ) {}

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

    const variantId = getVariantIdForPlan(params.plan);
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
      },
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
    });

    return checkout;
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
      this.logger.debug(`Ignoring Lemon Squeezy event: ${eventName}`);
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
      this.logger.warn(
        `Webhook ${eventName} missing organization mapping.`,
      );
      return;
    }

    const plan = this.resolvePlan(customData.plan, attributes.variant_id);
    const status = this.resolveStatus(attributes.status, eventName);

    await this.updateOrganizationSubscription(orgId, {
      plan,
      status,
      providerSubscriptionId: subscriptionId,
      providerCustomerId: attributes.customer_id ?? null,
      providerOrderId: attributes.order_id ?? null,
      providerVariantId: attributes.variant_id ?? null,
      activeFrom: this.parseDate(attributes.created_at),
      activeUntil: this.parseDate(
        attributes.ends_at ?? attributes.renews_at,
      ),
      amount: this.parseAmount(
        attributes.price ?? attributes.unit_price ?? attributes.renewal_price,
      ),
      currency: attributes.currency ?? attributes.currency_code ?? 'EUR',
      interval: this.mapInterval(
        attributes.billing_interval ?? attributes.interval,
      ),
    });
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
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      this.logger.warn(`Organization ${organizationId} not found for billing.`);
      return;
    }

    const config = OrganizationConfiguration.fromJson(
      organization.configuration,
    );
    const previous = config.activeSubscription;
    const nextSubscription = new OrganizationSubscription({
      plan: details.plan,
      status: details.status,
      activeFrom: details.activeFrom ?? previous.activeFrom,
      activeUntil: details.activeUntil ?? previous.activeUntil,
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
    if (normalized === OrganizationPlan.STARTER) {
      return OrganizationPlan.STARTER;
    }
    if (normalized === OrganizationPlan.PRO) {
      return OrganizationPlan.PRO;
    }
    if (normalized === OrganizationPlan.ENTERPRISE) {
      return OrganizationPlan.ENTERPRISE;
    }

    const variantIdStr = variantId ? String(variantId) : null;
    if (
      variantIdStr &&
      variantIdStr === process.env.LEMON_SQUEEZY_VARIANT_STARTER_ID
    ) {
      return OrganizationPlan.STARTER;
    }
    if (
      variantIdStr &&
      variantIdStr === process.env.LEMON_SQUEEZY_VARIANT_PRO_ID
    ) {
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
}
