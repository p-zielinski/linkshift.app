import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  OrganizationConfiguration,
  OrganizationPlan,
  OrganizationStatus,
  OrganizationSubscription,
  BillingInterval,
} from '@shared/models/organization-config.model';
import type { PlanLimits } from '@shared/models/plan-limits.model';
import { CacheManagerService, DataType } from '../cache/cache-manager.service';
import {
  CHECKOUT_PLANS,
  PLAN_LIMITS,
  getPlanLimits,
  getVariantIdForPlan,
} from './billing.config';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { AppEntity, createCustomCuid } from '../utils';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { Logger } from 'nestjs-pino';
import _ from 'lodash';

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

type BillingPlanPrice = {
  plan: OrganizationPlan;
  interval: BillingInterval;
  amount: number;
  currency: string;
  variantId: string;
};

type BillingPlanCatalog = {
  plans: BillingPlanPrice[];
  limits: Partial<Record<OrganizationPlan, PlanLimits>>;
  updatedAt: string;
};

@Injectable()
export class BillingService {
  private readonly variantIds: {
    starterMonthly?: string | null;
    starterYearly?: string | null;
    proMonthly?: string | null;
    proYearly?: string | null;
  };
  private readonly productId: string | null;
  private readonly defaultSuccessUrl: string;
  private readonly defaultCancelUrl: string;
  private readonly planCatalogCacheKey = 'BILLING_PLANS_CATALOG_V1';
  private readonly planCatalogTtlSeconds = 15 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly lemon: LemonSqueezyService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {
    this.variantIds = {
      starterMonthly:
        this.configService.get<string>(
          'LEMON_SQUEEZY_VARIANT_BASIC_MONTHLY_ID',
        ) ?? this.configService.get<string>('LEMON_SQUEEZY_VARIANT_BASIC_ID'),
      starterYearly: this.configService.get<string>(
        'LEMON_SQUEEZY_VARIANT_BASIC_YEARLY_ID',
      ),
      proMonthly:
        this.configService.get<string>(
          'LEMON_SQUEEZY_VARIANT_PRO_MONTHLY_ID',
        ) ?? this.configService.get<string>('LEMON_SQUEEZY_VARIANT_PRO_ID'),
      proYearly: this.configService.get<string>(
        'LEMON_SQUEEZY_VARIANT_PRO_YEARLY_ID',
      ),
    };
    this.productId =
      this.configService.get<string>('LEMON_SQUEEZY_PRODUCT_ID') ?? null;
    this.defaultSuccessUrl =
      this.configService.get<string>('LEMON_SQUEEZY_SUCCESS_URL') ?? '';
  }

  async createCheckout(params: {
    organizationId: string;
    userId: string;
    plan: OrganizationPlan;
    interval?: BillingInterval;
    successUrl?: string;
    cancelUrl?: string;
  }) {
    if (!CHECKOUT_PLANS.includes(params.plan)) {
      throw new Error(`Plan ${params.plan} is not purchasable via checkout.`);
    }

    const interval = params.interval ?? 'MONTHLY';
    const variantId = getVariantIdForPlan(
      params.plan,
      interval,
      this.variantIds,
    );
    if (!variantId) {
      throw new Error(
        `Missing Lemon Squeezy variant for ${params.plan} (${interval}).`,
      );
    }

    const variantIds = this.getPlanVariantIds(params.plan);

    return this.createCheckoutInternal({
      organizationId: params.organizationId,
      userId: params.userId,
      plan: params.plan,
      interval,
      variantId,
      variantIds,
      customData: {
        plan: params.plan,
        interval,
      },
      successUrl: params.successUrl,
    });
  }

  async createCheckoutByVariant(params: {
    organizationId: string;
    userId: string;
    variantId: string;
    successUrl?: string;
  }) {
    const standard = this.resolveStandardPlanForVariant(params.variantId);
    if (standard) {
      return this.createCheckoutInternal({
        organizationId: params.organizationId,
        userId: params.userId,
        plan: standard.plan,
        interval: standard.interval,
        variantId: standard.variantId,
        variantIds: standard.variantIds,
        customData: {
          plan: standard.plan,
          interval: standard.interval,
        },
        successUrl: params.successUrl,
      });
    }
    throw new Error('Unknown Lemon Squeezy variant for checkout.');
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

  async getPlanCatalog(): Promise<BillingPlanCatalog> {
    const cached =
      await this.cacheManagerService.getCustomCache<BillingPlanCatalog>(
        this.planCatalogCacheKey,
      );
    if (cached) {
      return cached;
    }

    const planVariants = this.getPlanVariantDefinitions();
    const variantIds = planVariants
      .map((entry) => entry.variantId)
      .filter((entry): entry is string => !!entry);
    const variants = await this.fetchPlanVariants(variantIds);
    const plans: BillingPlanPrice[] = [];

    for (const entry of planVariants) {
      if (!entry.variantId) {
        this.logger.warn('Missing variant configuration', {
          plan: entry.plan,
          interval: entry.interval,
        });
        continue;
      }
      const variant = variants.get(entry.variantId);
      if (!variant) {
        this.logger.warn('Variant not returned from Lemon Squeezy', {
          variantId: entry.variantId,
        });
        continue;
      }

      const pricing = this.extractVariantPricing(variant);
      plans.push({
        plan: entry.plan,
        interval: entry.interval,
        amount: pricing.amount,
        currency: pricing.currency,
        variantId: entry.variantId,
      });
    }

    const limits = Object.entries(PLAN_LIMITS).reduce(
      (acc, [plan, planLimits]) => {
        acc[plan as OrganizationPlan] = planLimits;
        return acc;
      },
      {} as Partial<Record<OrganizationPlan, PlanLimits>>,
    );

    const catalog: BillingPlanCatalog = {
      plans,
      limits,
      updatedAt: new Date().toISOString(),
    };

    await this.cacheManagerService.setCustomCache(
      this.planCatalogCacheKey,
      catalog,
      this.planCatalogTtlSeconds,
    );

    return catalog;
  }

  private async createCheckoutInternal(params: {
    organizationId: string;
    userId: string;
    plan: OrganizationPlan;
    planName?: string | null;
    interval: BillingInterval;
    variantId: string;
    variantIds: string[];
    customData: Record<string, any>;
    successUrl?: string;
  }) {
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

    const successUrl = this.appendCheckoutSessionId(
      baseSuccessUrl,
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
          interval: params.interval,
          planName: params.planName ?? null,
        },
      },
    });

    try {
      const checkout = await this.lemon.createCheckout({
        variantId: params.variantId,
        variantIds: params.variantIds,
        customerEmail: user.email,
        organizationName: organization.name,
        customData: {
          organizationId: organization.id,
          userId: user.id,
          plan: params.plan,
          interval: params.interval,
          organizationName: organization.name,
          email: user.email,
          checkoutSessionId,
          ...params.customData,
        },
        successUrl: successUrl || undefined,
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

    const variantIdStr = attributes.variant_id
      ? String(attributes.variant_id)
      : null;
    const plan = this.resolvePlan(customData.plan, attributes.variant_id);
    const status = this.resolveStatus(attributes.status, eventName);
    const limits = getPlanLimits(plan);
    const planName = customData.planName ?? customData.plan_name ?? null;

    const pricingFallback = variantIdStr
      ? await this.resolvePricingFromVariant({
          variantId: variantIdStr,
        })
      : null;
    const rawAmount = this.parseAmount(
      attributes.price ?? attributes.unit_price ?? attributes.renewal_price,
    );
    const intervalValue = attributes.billing_interval ?? attributes.interval;
    const resolvedInterval = intervalValue
      ? this.mapInterval(intervalValue)
      : (pricingFallback?.interval ??
        this.resolveIntervalFromVariantId(variantIdStr) ??
        'MONTHLY');

    const resolvedAmount =
      rawAmount > 0 || plan === OrganizationPlan.FREE
        ? rawAmount
        : (pricingFallback?.amount ?? rawAmount);
    const resolvedCurrency =
      attributes.currency ??
      attributes.currency_code ??
      pricingFallback?.currency ??
      'EUR';

    const subscriptionUpdate = await this.updateOrganizationSubscription(
      orgId,
      {
        plan,
        planName,
        status,
        providerSubscriptionId: subscriptionId,
        providerCustomerId: attributes.customer_id ?? null,
        providerOrderId: _.toString(attributes.order_id) ?? null,
        providerVariantId: attributes.variant_id ?? null,
        activeFrom: this.parseDate(attributes.created_at),
        activeUntil: this.parseDate(attributes.ends_at),
        amount: resolvedAmount,
        currency: resolvedCurrency,
        interval: resolvedInterval,
        limits,
      },
    );

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
      customData.checkoutSessionId ?? customData.checkout_session_id ?? null;

    if (checkoutSessionId) {
      await this.updateCheckoutSessionFromWebhook({
        checkoutSessionId,
        eventName,
        rawStatus: attributes.status,
        resolvedStatus: status,
        providerSubscriptionId: subscriptionId,
        providerOrderId: _.toString(attributes.order_id) ?? null,
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
      planName: string | null;
      status: OrganizationStatus;
      providerSubscriptionId: string | null;
      providerCustomerId: string | null;
      providerOrderId: number | null;
      providerVariantId: string | null;
      activeFrom: Date | null;
      activeUntil: Date | null;
      amount: number;
      currency: string;
      interval: OrganizationSubscription['interval'];
      limits: PlanLimits;
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
      planName: details.planName ?? null,
      status: details.status,
      activeFrom: details.activeFrom ?? previous.activeFrom,
      activeUntil: details.activeUntil,
      amount: details.amount ?? previous.amount,
      currency: details.currency ?? previous.currency,
      interval: details.interval ?? previous.interval,
      limits: details.limits ?? getPlanLimits(details.plan),
      provider: 'LEMON_SQUEEZY',
      providerSubscriptionId: details.providerSubscriptionId,
      providerCustomerId: details.providerCustomerId,
      providerOrderId: _.toString(details.providerOrderId),
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
    const nextPlanLabel = this.formatPlanLabel(
      params.next.plan,
      params.next.planName ?? null,
    );
    const previousPlanLabel = this.formatPlanLabel(
      params.previous.plan,
      params.previous.planName ?? null,
    );
    const planChanged = params.previous.plan !== params.next.plan;
    const statusBecameActive =
      params.previous.status !== OrganizationStatus.ACTIVE &&
      params.next.status === OrganizationStatus.ACTIVE;
    const isUpdateEvent =
      normalizedEvent.includes('subscription_updated') ||
      normalizedEvent.includes('subscription_change') ||
      normalizedEvent.includes('subscription_plan_changed');

    try {
      if (
        normalizedEvent.includes('subscription_created') ||
        normalizedEvent.includes('subscription_resumed') ||
        statusBecameActive
      ) {
        await this.emailService.sendSubscriptionActivated({
          email: params.email,
          organization: params.organizationName,
          plan: nextPlanLabel,
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
          plan: nextPlanLabel,
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
          plan: nextPlanLabel,
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
          plan: nextPlanLabel,
          endsAt: params.endsAt,
        });
      }

      if (planChanged && isUpdateEvent) {
        await this.emailService.sendPlanChanged({
          email: params.email,
          organization: params.organizationName,
          fromPlan: previousPlanLabel,
          toPlan: nextPlanLabel,
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

  private getPlanVariantIds(plan: OrganizationPlan): string[] {
    if (plan === OrganizationPlan.BASIC) {
      return [
        this.variantIds.starterMonthly,
        this.variantIds.starterYearly,
        this.variantIds.proMonthly,
        this.variantIds.proYearly,
      ].filter((entry): entry is string => !!entry);
    }
    if (plan === OrganizationPlan.PRO) {
      return [this.variantIds.proMonthly, this.variantIds.proYearly].filter(
        (entry): entry is string => !!entry,
      );
    }
    return [];
  }

  private resolveStandardPlanForVariant(variantId: string): {
    plan: OrganizationPlan;
    interval: BillingInterval;
    variantId: string;
    variantIds: string[];
  } | null {
    if (variantId === this.variantIds.starterMonthly) {
      return {
        plan: OrganizationPlan.BASIC,
        interval: 'MONTHLY',
        variantId,
        variantIds: this.getPlanVariantIds(OrganizationPlan.BASIC),
      };
    }
    if (variantId === this.variantIds.starterYearly) {
      return {
        plan: OrganizationPlan.BASIC,
        interval: 'YEARLY',
        variantId,
        variantIds: this.getPlanVariantIds(OrganizationPlan.BASIC),
      };
    }
    if (variantId === this.variantIds.proMonthly) {
      return {
        plan: OrganizationPlan.PRO,
        interval: 'MONTHLY',
        variantId,
        variantIds: this.getPlanVariantIds(OrganizationPlan.PRO),
      };
    }
    if (variantId === this.variantIds.proYearly) {
      return {
        plan: OrganizationPlan.PRO,
        interval: 'YEARLY',
        variantId,
        variantIds: this.getPlanVariantIds(OrganizationPlan.PRO),
      };
    }
    return null;
  }

  private getPlanVariantDefinitions(): Array<{
    plan: OrganizationPlan;
    interval: BillingInterval;
    variantId: string | null;
  }> {
    return [
      {
        plan: OrganizationPlan.BASIC,
        interval: 'MONTHLY',
        variantId: this.variantIds.starterMonthly ?? null,
      },
      {
        plan: OrganizationPlan.BASIC,
        interval: 'YEARLY',
        variantId: this.variantIds.starterYearly ?? null,
      },
      {
        plan: OrganizationPlan.PRO,
        interval: 'MONTHLY',
        variantId: this.variantIds.proMonthly ?? null,
      },
      {
        plan: OrganizationPlan.PRO,
        interval: 'YEARLY',
        variantId: this.variantIds.proYearly ?? null,
      },
    ];
  }

  private resolveIntervalFromVariantId(
    variantId: string | null,
  ): BillingInterval | null {
    if (!variantId) {
      return null;
    }

    const match = this.getPlanVariantDefinitions().find(
      (entry) => entry.variantId === variantId,
    );
    return match?.interval ?? null;
  }

  private async resolvePricingFromVariant(params: {
    variantId: string;
  }): Promise<{
    amount: number;
    currency: string;
    interval: BillingInterval;
  } | null> {
    if (!params.variantId) {
      return null;
    }

    const catalog = await this.getPlanCatalog();
    const catalogEntry = catalog.plans.find(
      (entry) => entry.variantId === params.variantId,
    );
    if (catalogEntry) {
      return {
        amount: catalogEntry.amount,
        currency: catalogEntry.currency,
        interval: catalogEntry.interval,
      };
    }

    const variants = await this.fetchPlanVariants([params.variantId]);
    const variant = variants.get(params.variantId);
    if (variant) {
      return this.extractVariantPricing(variant);
    }

    return null;
  }

  private async fetchPlanVariants(
    variantIds: string[],
  ): Promise<Map<string, { id?: string; attributes?: Record<string, any> }>> {
    const uniqueIds = Array.from(new Set(variantIds));
    const variantsById = new Map<
      string,
      { id?: string; attributes?: Record<string, any> }
    >();

    if (this.productId) {
      const response = await this.lemon.listVariants(this.productId);
      const items = response.data ?? [];
      for (const item of items) {
        if (item?.id) {
          variantsById.set(String(item.id), item);
        }
      }
      return variantsById;
    }

    await Promise.all(
      uniqueIds.map(async (variantId) => {
        const response = await this.lemon.getVariant(variantId);
        if (response.data) {
          variantsById.set(
            String(response.data.id ?? variantId),
            response.data,
          );
        }
      }),
    );

    return variantsById;
  }

  private extractVariantPricing(variant: {
    id?: string;
    attributes?: Record<string, any>;
  }): { amount: number; currency: string; interval: BillingInterval } {
    const attributes = variant.attributes ?? {};
    const amount = this.parseAmount(
      attributes.price ?? attributes.unit_price ?? attributes.renewal_price,
    );
    const currency = attributes.currency ?? attributes.currency_code ?? 'EUR';
    const interval = this.mapInterval(
      attributes.billing_interval ??
        attributes.interval_unit ??
        attributes.interval,
    ) as BillingInterval;
    return { amount, currency, interval };
  }

  private resolvePlan(
    plan: string | null | undefined,
    variantId: string | number | null | undefined,
  ): OrganizationPlan {
    const normalized = (plan ?? '').toString().toUpperCase();
    if (normalized === 'STARTER') {
      return OrganizationPlan.BASIC;
    }
    const knownPlans = Object.values(OrganizationPlan) as string[];
    if (knownPlans.includes(normalized)) {
      return normalized as OrganizationPlan;
    }

    const variantIdStr = variantId ? String(variantId) : null;
    if (
      variantIdStr &&
      (variantIdStr === this.variantIds.starterMonthly ||
        variantIdStr === this.variantIds.starterYearly)
    ) {
      return OrganizationPlan.BASIC;
    }
    if (
      variantIdStr &&
      (variantIdStr === this.variantIds.proMonthly ||
        variantIdStr === this.variantIds.proYearly)
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

  private async updateCheckoutSessionFromWebhook(params: {
    checkoutSessionId: string;
    eventName: string;
    rawStatus: string | null | undefined;
    resolvedStatus: OrganizationStatus;
    providerSubscriptionId: string | null;
    providerOrderId: number | null;
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
      data.providerOrderId = _.toString(params.providerOrderId);
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

  private formatPlanLabel(
    plan: OrganizationPlan,
    planName?: string | null,
  ): string {
    if (planName) {
      return planName;
    }
    if (plan === OrganizationPlan.BASIC) {
      return 'Basic';
    }
    if (plan === OrganizationPlan.PRO) {
      return 'Pro';
    }
    if (plan === OrganizationPlan.FREE) {
      return 'Free';
    }
    return String(plan);
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
