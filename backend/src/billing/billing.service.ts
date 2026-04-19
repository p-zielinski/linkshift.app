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
  getPriceIdForPlan,
} from './billing.config';
import { PaddleService } from './paddle.service';
import { AppEntity, createCustomCuid } from '../utils';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { Logger } from 'nestjs-pino';

type PaddleWebhookPayload = {
  event_type?: string;
  event_id?: string;
  notification_id?: string;
  data?: {
    id?: string;
    [key: string]: any;
  };
};

type BillingPlanPrice = {
  plan: OrganizationPlan;
  interval: BillingInterval;
  amount: number;
  currency: string;
  priceId: string;
};

type BillingPlanCatalog = {
  plans: BillingPlanPrice[];
  limits: Partial<Record<OrganizationPlan, PlanLimits>>;
  updatedAt: string;
};

@Injectable()
export class BillingService {
  private readonly priceIds: {
    starterMonthly?: string | null;
    starterYearly?: string | null;
    proMonthly?: string | null;
    proYearly?: string | null;
  };
  private readonly defaultSuccessUrl: string;
  private readonly planCatalogCacheKey = 'BILLING_PLANS_CATALOG_V2';
  private readonly planCatalogTtlSeconds = 15 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly paddle: PaddleService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {
    this.priceIds = {
      starterMonthly:
        this.configService.get<string>(
          'PADDLE_PRICE_BASIC_MONTHLY_ID',
        ) ?? this.configService.get<string>('PADDLE_PRICE_BASIC_ID'),
      starterYearly: this.configService.get<string>(
        'PADDLE_PRICE_BASIC_YEARLY_ID',
      ),
      proMonthly:
        this.configService.get<string>(
          'PADDLE_PRICE_PRO_MONTHLY_ID',
        ) ?? this.configService.get<string>('PADDLE_PRICE_PRO_ID'),
      proYearly: this.configService.get<string>(
        'PADDLE_PRICE_PRO_YEARLY_ID',
      ),
    };
    this.defaultSuccessUrl =
      this.configService.get<string>('PADDLE_SUCCESS_URL') ?? '';
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
    const priceId = getPriceIdForPlan(
      params.plan,
      interval,
      this.priceIds,
    );
    if (!priceId) {
      throw new Error(`Missing Paddle price for ${params.plan} (${interval}).`);
    }

    return this.createCheckoutInternal({
      organizationId: params.organizationId,
      userId: params.userId,
      plan: params.plan,
      interval,
      priceId,
      customData: {
        plan: params.plan,
        interval,
      },
      successUrl: params.successUrl,
    });
  }

  async createCheckoutByPrice(params: {
    organizationId: string;
    userId: string;
    priceId: string;
    successUrl?: string;
  }) {
    const standard = this.resolveStandardPlanForPrice(params.priceId);
    if (standard) {
      return this.createCheckoutInternal({
        organizationId: params.organizationId,
        userId: params.userId,
        plan: standard.plan,
        interval: standard.interval,
        priceId: standard.priceId,
        customData: {
          plan: standard.plan,
          interval: standard.interval,
        },
        successUrl: params.successUrl,
      });
    }
    throw new Error('Unknown Paddle price for checkout.');
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
      throw new Error('No active Paddle subscription found.');
    }

    const response = await this.paddle.getSubscription(subscriptionId);
    const subscription = response.data ?? {};
    const portalUrl =
      subscription.management_urls?.update_payment_method ??
      subscription.management_urls?.cancel ??
      subscription.management_urls?.customer_portal ??
      subscription.urls?.customer_portal ??
      null;

    if (portalUrl) {
      return portalUrl;
    }

    const customerId =
      config.activeSubscription.providerCustomerId ??
      subscription.customer_id ??
      null;
    if (customerId) {
      const portalSession = await this.paddle.createCustomerPortalSession({
        customerId,
        subscriptionIds: [subscriptionId],
      });
      const sessionUrl =
        portalSession.data?.urls?.general?.overview ??
        portalSession.data?.urls?.subscriptions ??
        portalSession.data?.urls?.customer_portal ??
        null;
      if (sessionUrl) {
        return sessionUrl;
      }
    }

    throw new Error('Missing customer portal URL from Paddle.');
  }

  async getPlanCatalog(): Promise<BillingPlanCatalog> {
    const cached =
      await this.cacheManagerService.getCustomCache<BillingPlanCatalog>(
        this.planCatalogCacheKey,
      );
    if (cached) {
      return cached;
    }

    const planPrices = this.getPlanPriceDefinitions();
    const priceIds = planPrices
      .map((entry) => entry.priceId)
      .filter((entry): entry is string => !!entry);
    const prices = await this.fetchPlanPrices(priceIds);
    const plans: BillingPlanPrice[] = [];

    for (const entry of planPrices) {
      if (!entry.priceId) {
        this.logger.warn('Missing Paddle price configuration', {
          plan: entry.plan,
          interval: entry.interval,
        });
        continue;
      }
      const price = prices.get(entry.priceId);
      if (!price) {
        this.logger.warn('Price not returned from Paddle API', {
          priceId: entry.priceId,
        });
        continue;
      }

      const pricing = this.extractPricePricing(price);
      plans.push({
        plan: entry.plan,
        interval: entry.interval,
        amount: pricing.amount,
        currency: pricing.currency,
        priceId: entry.priceId,
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
    priceId: string;
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
      const checkout = await this.paddle.createCheckout({
        priceId: params.priceId,
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
    payload: PaddleWebhookPayload,
  ): Promise<void> {
    if (!this.paddle.verifySignature(rawBody, signature)) {
      throw new Error('Invalid Paddle signature.');
    }

    const eventName = (payload.event_type ?? 'unknown').toString();
    const normalizedEventName = eventName.toLowerCase();
    const data = payload.data ?? {};
    const subscriptionId = this.extractSubscriptionIdFromEvent(
      normalizedEventName,
      payload,
    );

    if (
      !normalizedEventName.includes('subscription') &&
      !normalizedEventName.includes('transaction')
    ) {
      this.logger.debug('Ignoring billing event', { eventName });
      return;
    }

    const customData = {
      ...(data.custom_data ?? {}),
      ...(data.customData ?? {}),
    } as Record<string, any>;

    const organizationId =
      customData.organizationId ?? customData.organization_id ?? null;
    const email =
      customData.email ??
      data.customer?.email ??
      data.customer_email ??
      null;

    const orgId =
      organizationId ?? (await this.findOrganizationIdByEmail(email));

    if (!orgId) {
      this.logger.warn('Webhook missing organization mapping', { eventName });
      return;
    }

    const priceId = this.extractPriceIdFromEventData(data);
    const plan = this.resolvePlan(customData.plan, priceId);
    const status = this.resolveStatus(data.status, normalizedEventName);
    const limits = getPlanLimits(plan);
    const planName = customData.planName ?? customData.plan_name ?? null;

    const pricingFallback = priceId
      ? await this.resolvePricingFromPrice({
          priceId,
        })
      : null;
    const rawAmount = this.extractAmountFromEventData(data);
    const intervalValue = this.extractIntervalFromEventData(data);
    const resolvedInterval = intervalValue
      ? this.mapInterval(intervalValue)
      : (pricingFallback?.interval ??
        this.resolveIntervalFromPriceId(priceId) ??
        'MONTHLY');

    const resolvedAmount =
      rawAmount > 0 || plan === OrganizationPlan.FREE
        ? rawAmount
        : (pricingFallback?.amount ?? rawAmount);
    const resolvedCurrency =
      this.extractCurrencyFromEventData(data) ??
      pricingFallback?.currency ??
      'EUR';

    if (subscriptionId) {
      const subscriptionUpdate = await this.updateOrganizationSubscription(
        orgId,
        {
          plan,
          planName,
          status,
          providerSubscriptionId: subscriptionId,
          providerCustomerId:
            data.customer_id ?? data.customer?.id ?? null,
          providerOrderId: this.normalizeProviderOrderId(
            data.order_id ?? data.id,
          ),
          providerVariantId: priceId,
          activeFrom: this.extractActiveFromFromEventData(data),
          activeUntil: this.extractActiveUntilFromEventData(
            data,
            status,
            normalizedEventName,
          ),
          amount: resolvedAmount,
          currency: resolvedCurrency,
          interval: resolvedInterval,
          limits,
        },
      );

      if (subscriptionUpdate) {
        const renewsAt = this.extractRenewsAtFromEventData(data);
        const notificationEmail =
          email ?? (await this.findOwnerEmailByOrganizationId(orgId));
        await this.notifyCustomer({
          email: notificationEmail,
          eventName: normalizedEventName,
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
    }

    const checkoutSessionId =
      customData.checkoutSessionId ?? customData.checkout_session_id ?? null;

    if (checkoutSessionId) {
      await this.updateCheckoutSessionFromWebhook({
        checkoutSessionId,
        eventName,
        rawStatus: data.status,
        resolvedStatus: status,
        providerSubscriptionId: subscriptionId,
        providerOrderId: this.normalizeProviderOrderId(
          data.order_id ?? data.id,
        ),
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
      providerOrderId: string | null;
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
      provider: 'PADDLE',
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
      normalizedEvent.includes('subscription.updated') ||
      normalizedEvent.includes('subscription.items.updated') ||
      normalizedEvent.includes('subscription_updated') ||
      normalizedEvent.includes('subscription_change') ||
      normalizedEvent.includes('subscription_plan_changed');

    try {
      if (
        normalizedEvent.includes('subscription.created') ||
        normalizedEvent.includes('subscription.resumed') ||
        normalizedEvent.includes('subscription.activated') ||
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
        normalizedEvent.includes('transaction.paid') ||
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
        normalizedEvent.includes('transaction.payment_failed') ||
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
        normalizedEvent.includes('subscription.canceled') ||
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

  private resolveStandardPlanForPrice(priceId: string): {
    plan: OrganizationPlan;
    interval: BillingInterval;
    priceId: string;
  } | null {
    if (priceId === this.priceIds.starterMonthly) {
      return {
        plan: OrganizationPlan.BASIC,
        interval: 'MONTHLY',
        priceId,
      };
    }
    if (priceId === this.priceIds.starterYearly) {
      return {
        plan: OrganizationPlan.BASIC,
        interval: 'YEARLY',
        priceId,
      };
    }
    if (priceId === this.priceIds.proMonthly) {
      return {
        plan: OrganizationPlan.PRO,
        interval: 'MONTHLY',
        priceId,
      };
    }
    if (priceId === this.priceIds.proYearly) {
      return {
        plan: OrganizationPlan.PRO,
        interval: 'YEARLY',
        priceId,
      };
    }
    return null;
  }

  private getPlanPriceDefinitions(): Array<{
    plan: OrganizationPlan;
    interval: BillingInterval;
    priceId: string | null;
  }> {
    return [
      {
        plan: OrganizationPlan.BASIC,
        interval: 'MONTHLY',
        priceId: this.priceIds.starterMonthly ?? null,
      },
      {
        plan: OrganizationPlan.BASIC,
        interval: 'YEARLY',
        priceId: this.priceIds.starterYearly ?? null,
      },
      {
        plan: OrganizationPlan.PRO,
        interval: 'MONTHLY',
        priceId: this.priceIds.proMonthly ?? null,
      },
      {
        plan: OrganizationPlan.PRO,
        interval: 'YEARLY',
        priceId: this.priceIds.proYearly ?? null,
      },
    ];
  }

  private resolveIntervalFromPriceId(
    priceId: string | null,
  ): BillingInterval | null {
    if (!priceId) {
      return null;
    }

    const match = this.getPlanPriceDefinitions().find(
      (entry) => entry.priceId === priceId,
    );
    return match?.interval ?? null;
  }

  private async resolvePricingFromPrice(params: {
    priceId: string;
  }): Promise<{
    amount: number;
    currency: string;
    interval: BillingInterval;
  } | null> {
    if (!params.priceId) {
      return null;
    }

    const catalog = await this.getPlanCatalog();
    const catalogEntry = catalog.plans.find(
      (entry) => entry.priceId === params.priceId,
    );
    if (catalogEntry) {
      return {
        amount: catalogEntry.amount,
        currency: catalogEntry.currency,
        interval: catalogEntry.interval,
      };
    }

    const prices = await this.fetchPlanPrices([params.priceId]);
    const price = prices.get(params.priceId);
    if (price) {
      return this.extractPricePricing(price);
    }

    return null;
  }

  private async fetchPlanPrices(
    priceIds: string[],
  ): Promise<Map<string, Record<string, any>>> {
    const uniqueIds = Array.from(new Set(priceIds));
    const pricesById = new Map<string, Record<string, any>>();

    await Promise.all(
      uniqueIds.map(async (priceId) => {
        const response = await this.paddle.getPrice(priceId);
        if (response.data) {
          pricesById.set(
            String(response.data.id ?? priceId),
            response.data,
          );
        }
      }),
    );

    return pricesById;
  }

  private extractPricePricing(price: {
    id?: string;
    [key: string]: any;
  }): { amount: number; currency: string; interval: BillingInterval } {
    const amount = this.parseAmount(
      price.unit_price?.amount ??
        price.unitPrice?.amount ??
        price.unit_amount ??
        price.amount,
    );
    const currency =
      price.unit_price?.currency_code ??
      price.unitPrice?.currencyCode ??
      price.currency ??
      price.currency_code ??
      'EUR';
    const interval = this.mapInterval(
      price.billing_cycle?.interval ??
        price.billingCycle?.interval ??
        price.interval,
    ) as BillingInterval;

    return { amount, currency, interval };
  }

  private extractSubscriptionIdFromEvent(
    normalizedEventName: string,
    payload: PaddleWebhookPayload,
  ): string | null {
    if (normalizedEventName.includes('subscription') && payload.data?.id) {
      return String(payload.data.id);
    }
    const candidate =
      payload.data?.subscription_id ??
      payload.data?.subscription?.id ??
      null;
    return candidate ? String(candidate) : null;
  }

  private extractPriceIdFromEventData(data: Record<string, any>): string | null {
    const candidate =
      data.price_id ??
      data.price?.id ??
      data.items?.[0]?.price_id ??
      data.items?.[0]?.price?.id ??
      data.subscription_details?.items?.[0]?.price?.id ??
      null;

    return candidate ? String(candidate) : null;
  }

  private extractAmountFromEventData(data: Record<string, any>): number {
    return this.parseAmount(
      data.details?.totals?.total ??
        data.recurring_totals?.total ??
        data.totals?.total ??
        data.unit_totals?.total ??
        data.items?.[0]?.price?.unit_price?.amount ??
        data.items?.[0]?.price?.unitPrice?.amount ??
        0,
    );
  }

  private extractCurrencyFromEventData(data: Record<string, any>): string | null {
    return (
      data.details?.totals?.currency_code ??
      data.recurring_totals?.currency_code ??
      data.totals?.currency_code ??
      data.items?.[0]?.price?.unit_price?.currency_code ??
      data.items?.[0]?.price?.unitPrice?.currencyCode ??
      data.currency_code ??
      data.currency ??
      null
    );
  }

  private extractIntervalFromEventData(data: Record<string, any>): string | null {
    return (
      data.billing_cycle?.interval ??
      data.items?.[0]?.price?.billing_cycle?.interval ??
      data.items?.[0]?.price?.billingCycle?.interval ??
      data.interval ??
      null
    );
  }

  private extractActiveFromFromEventData(data: Record<string, any>): Date | null {
    return this.parseDate(
      data.started_at ?? data.first_billed_at ?? data.created_at ?? null,
    );
  }

  private extractActiveUntilFromEventData(
    data: Record<string, any>,
    status: OrganizationStatus,
    normalizedEventName: string,
  ): Date | null {
    if (
      status === OrganizationStatus.CANCELED ||
      normalizedEventName.includes('subscription.canceled')
    ) {
      return this.parseDate(
        data.canceled_at ??
          data.scheduled_change?.effective_at ??
          data.current_billing_period?.ends_at ??
          data.next_billed_at ??
          null,
      );
    }

    return this.parseDate(
      data.current_billing_period?.ends_at ?? data.next_billed_at ?? null,
    );
  }

  private extractRenewsAtFromEventData(data: Record<string, any>): Date | null {
    return this.parseDate(
      data.next_billed_at ?? data.current_billing_period?.ends_at ?? null,
    );
  }

  private resolvePlan(
    plan: string | null | undefined,
    priceId: string | number | null | undefined,
  ): OrganizationPlan {
    const normalized = (plan ?? '').toString().toUpperCase();
    if (normalized === 'STARTER') {
      return OrganizationPlan.BASIC;
    }
    const knownPlans = Object.values(OrganizationPlan) as string[];
    if (knownPlans.includes(normalized)) {
      return normalized as OrganizationPlan;
    }

    const priceIdStr = priceId ? String(priceId) : null;
    if (
      priceIdStr &&
      (priceIdStr === this.priceIds.starterMonthly ||
        priceIdStr === this.priceIds.starterYearly)
    ) {
      return OrganizationPlan.BASIC;
    }
    if (
      priceIdStr &&
      (priceIdStr === this.priceIds.proMonthly ||
        priceIdStr === this.priceIds.proYearly)
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
      eventName.includes('transaction.payment_failed') ||
      eventName.includes('payment_failed') ||
      normalized === 'unpaid' ||
      normalized === 'past_due'
    ) {
      return OrganizationStatus.CANCELED;
    }
    if (
      eventName.includes('subscription.canceled') ||
      normalized === 'cancelled' ||
      normalized === 'canceled' ||
      normalized === 'expired' ||
      normalized === 'inactive'
    ) {
      return OrganizationStatus.CANCELED;
    }
    if (
      eventName.includes('subscription.paused') ||
      normalized === 'paused'
    ) {
      return OrganizationStatus.SUSPENDED;
    }
    if (normalized === 'trialing') {
      return OrganizationStatus.ACTIVE;
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
      eventName.includes('transaction.payment_failed') ||
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

  private normalizeProviderOrderId(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? String(value) : null;
    }
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
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
