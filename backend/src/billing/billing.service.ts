import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  PLAN_LIMITS,
  getPlanLimits,
  getPriceIdForPlan,
} from './billing.config';
import {
  PaddleService,
  PaddleSubscriptionProrationBillingMode,
  PaddleSubscriptionUpdateItem,
} from './paddle.service';
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

type BillingChangeCheckoutResult = {
  flow: 'CHECKOUT';
  checkoutSessionId: string;
  plan: OrganizationPlan;
  interval: BillingInterval;
  priceId: string;
};

type BillingChangeUpdatedResult = {
  flow: 'UPDATED';
  providerSubscriptionId: string;
  plan: OrganizationPlan;
  interval: BillingInterval;
  prorationBillingMode: PaddleSubscriptionProrationBillingMode;
  amount: number;
  currency: string;
  activeFrom: string | null;
  activeUntil: string | null;
};

type BillingChangeNoopResult = {
  flow: 'NOOP';
  plan: OrganizationPlan;
  interval: BillingInterval;
  priceId: string;
};

type BillingSubscriptionSyncResult = {
  synced: boolean;
  source: 'PADDLE' | 'LOCAL';
  reason: string | null;
  activeSubscription: {
    plan: OrganizationPlan;
    status: OrganizationStatus;
    interval: OrganizationSubscription['interval'];
    providerSubscriptionId: string | null;
    providerVariantId: string | null;
    amount: number;
    currency: string;
    activeFrom: string | null;
    activeUntil: string | null;
  };
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
        this.configService.get<string>('PADDLE_PRICE_BASIC_MONTHLY_ID') ??
        this.configService.get<string>('PADDLE_PRICE_BASIC_ID'),
      starterYearly: this.configService.get<string>(
        'PADDLE_PRICE_BASIC_YEARLY_ID',
      ),
      proMonthly:
        this.configService.get<string>('PADDLE_PRICE_PRO_MONTHLY_ID') ??
        this.configService.get<string>('PADDLE_PRICE_PRO_ID'),
      proYearly: this.configService.get<string>('PADDLE_PRICE_PRO_YEARLY_ID'),
    };
    this.defaultSuccessUrl =
      this.configService.get<string>('PADDLE_SUCCESS_URL') ?? '';
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

  async createCheckoutSession(params: {
    organizationId: string;
    userId: string;
    priceId: string;
  }) {
    const standard = this.resolveStandardPlanForPrice(params.priceId);
    if (!standard) {
      throw new Error('Unknown Paddle price for checkout session.');
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

    await this.prisma.billingCheckoutSession.create({
      data: {
        id: checkoutSessionId,
        organizationId: organization.id,
        userId: user.id,
        plan: standard.plan,
        status: 'PENDING',
        metadata: {
          organizationName: organization.name,
          email: user.email,
          interval: standard.interval,
          planName: null,
        },
      },
    });

    return {
      checkoutSessionId,
      plan: standard.plan,
      interval: standard.interval,
      priceId: standard.priceId,
    };
  }

  async changeSubscriptionByPrice(params: {
    organizationId: string;
    userId: string;
    priceId: string;
  }): Promise<
    | BillingChangeCheckoutResult
    | BillingChangeUpdatedResult
    | BillingChangeNoopResult
  > {
    const standard = this.resolveStandardPlanForPrice(params.priceId);
    if (!standard) {
      throw new Error('Unknown Paddle price for subscription change.');
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
      throw new Error(
        'Organization or user not found for subscription change.',
      );
    }

    const config = OrganizationConfiguration.fromJson(
      organization.configuration,
    );
    const activeSubscription = config.activeSubscription;
    const providerSubscriptionId =
      activeSubscription.providerSubscriptionId ?? null;

    if (!providerSubscriptionId) {
      const checkout = await this.createCheckoutSession({
        organizationId: organization.id,
        userId: user.id,
        priceId: params.priceId,
      });
      return {
        flow: 'CHECKOUT',
        ...checkout,
      };
    }

    const currentBillingInterval = this.toBillingInterval(
      activeSubscription.interval,
    );
    const intervalChangeRequested =
      !!currentBillingInterval && currentBillingInterval !== standard.interval;
    const hasCancelableActiveSubscription =
      activeSubscription.status !== OrganizationStatus.CANCELED;

    if (intervalChangeRequested && hasCancelableActiveSubscription) {
      throw new BadRequestException(
        'Changing billing interval is not available for an active subscription. Cancel your current subscription first, then choose a new interval.',
      );
    }

    try {
      const subscriptionResponse = await this.paddle.getSubscription(
        providerSubscriptionId,
      );
      const subscriptionData = subscriptionResponse.data ?? {};
      const subscriptionStatus = (subscriptionData.status ?? '')
        .toString()
        .toLowerCase();
      const cancellationScheduled =
        this.hasScheduledCancellation(subscriptionData);

      if (cancellationScheduled) {
        throw new BadRequestException(
          'Subscription change is unavailable because cancellation is already scheduled for the end of the billing period. Open Manage subscription to remove the scheduled cancellation first.',
        );
      }

      if (
        subscriptionStatus === 'canceled' ||
        subscriptionStatus === 'cancelled' ||
        subscriptionStatus === 'expired' ||
        subscriptionStatus === 'inactive'
      ) {
        const checkout = await this.createCheckoutSession({
          organizationId: organization.id,
          userId: user.id,
          priceId: params.priceId,
        });
        return {
          flow: 'CHECKOUT',
          ...checkout,
        };
      }

      const providerCurrentPriceId =
        this.extractPriceIdFromEventData(subscriptionData);
      if (providerCurrentPriceId === standard.priceId) {
        const localInterval = this.toBillingInterval(
          activeSubscription.interval,
        );
        const localStateInSync =
          (activeSubscription.providerVariantId ?? null) === standard.priceId &&
          activeSubscription.plan === standard.plan &&
          localInterval === standard.interval;

        if (!localStateInSync) {
          const localUpdate =
            await this.syncOrganizationSubscriptionFromProviderSnapshot({
              organizationId: organization.id,
              subscriptionData,
              fallbackPriceId: standard.priceId,
              fallbackInterval: standard.interval,
            });
          if (!localUpdate) {
            throw new Error('Unable to synchronize subscription state.');
          }
        }

        return {
          flow: 'NOOP',
          plan: standard.plan,
          interval: standard.interval,
          priceId: standard.priceId,
        };
      }

      if (
        !providerCurrentPriceId &&
        (activeSubscription.providerVariantId ?? null) === standard.priceId
      ) {
        return {
          flow: 'NOOP',
          plan: standard.plan,
          interval: standard.interval,
          priceId: standard.priceId,
        };
      }

      let prorationBillingMode = await this.resolveProrationBillingMode({
        activeSubscription,
        targetPriceId: standard.priceId,
        targetInterval: standard.interval,
      });

      const items = this.buildSubscriptionUpdateItems({
        subscriptionData,
        currentVariantId: activeSubscription.providerVariantId,
        targetPriceId: standard.priceId,
      });

      let updatedSubscription: Awaited<
        ReturnType<PaddleService['updateSubscription']>
      > | null = null;

      const applySubscriptionUpdate = async (
        mode: PaddleSubscriptionProrationBillingMode,
      ) => {
        await this.paddle.previewSubscriptionUpdate({
          subscriptionId: providerSubscriptionId,
          items,
          prorationBillingMode: mode,
        });
        return this.paddle.updateSubscription({
          subscriptionId: providerSubscriptionId,
          items,
          prorationBillingMode: mode,
          onPaymentFailure: 'prevent_change',
        });
      };

      try {
        updatedSubscription =
          await applySubscriptionUpdate(prorationBillingMode);
      } catch (error) {
        if (
          prorationBillingMode === 'prorated_next_billing_period' &&
          this.isProrationModeInvalidForScheduledChange(error)
        ) {
          prorationBillingMode = 'do_not_bill';
          updatedSubscription =
            await applySubscriptionUpdate(prorationBillingMode);
        } else if (
          prorationBillingMode === 'prorated_immediately' &&
          this.isMinimumPaymentAmountError(error)
        ) {
          prorationBillingMode = 'prorated_next_billing_period';
          try {
            updatedSubscription =
              await applySubscriptionUpdate(prorationBillingMode);
          } catch (fallbackError) {
            if (this.isProrationModeInvalidForScheduledChange(fallbackError)) {
              prorationBillingMode = 'do_not_bill';
              updatedSubscription =
                await applySubscriptionUpdate(prorationBillingMode);
            } else {
              throw fallbackError;
            }
          }
        } else {
          throw error;
        }
      }

      if (!updatedSubscription) {
        throw new Error('Subscription update did not return data.');
      }

      const localUpdate =
        await this.syncOrganizationSubscriptionFromProviderSnapshot({
          organizationId: organization.id,
          subscriptionData: updatedSubscription.data ?? {},
          fallbackPriceId: standard.priceId,
          fallbackInterval: standard.interval,
        });

      if (!localUpdate) {
        throw new Error('Unable to synchronize subscription state.');
      }

      return {
        flow: 'UPDATED',
        providerSubscriptionId: localUpdate.next.providerSubscriptionId ?? '',
        plan: localUpdate.next.plan,
        interval: localUpdate.next.interval as BillingInterval,
        prorationBillingMode,
        amount: localUpdate.next.amount,
        currency: localUpdate.next.currency,
        activeFrom: localUpdate.next.activeFrom?.toISOString?.() ?? null,
        activeUntil: localUpdate.next.activeUntil?.toISOString?.() ?? null,
      };
    } catch (error) {
      const mappedError = this.mapSubscriptionChangeError(error);
      if (mappedError) {
        throw new BadRequestException(mappedError);
      }
      throw error;
    }
  }

  async syncSubscriptionFromProvider(params: {
    organizationId: string;
  }): Promise<BillingSubscriptionSyncResult> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: params.organizationId },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found.');
    }

    const config = OrganizationConfiguration.fromJson(
      organization.configuration,
    );
    const activeSubscription = config.activeSubscription;
    const providerSubscriptionId =
      activeSubscription.providerSubscriptionId ?? null;

    if (!providerSubscriptionId) {
      return {
        synced: false,
        source: 'LOCAL',
        reason:
          'No Paddle subscription id found in organization configuration.',
        activeSubscription:
          this.buildSubscriptionSyncSnapshot(activeSubscription),
      };
    }

    const subscriptionResponse = await this.paddle.getSubscription(
      providerSubscriptionId,
    );
    const subscriptionData = subscriptionResponse.data ?? {};
    const fallbackInterval =
      this.toBillingInterval(activeSubscription.interval) ?? 'MONTHLY';
    const fallbackPriceId =
      activeSubscription.providerVariantId ??
      getPriceIdForPlan(
        activeSubscription.plan,
        fallbackInterval,
        this.priceIds,
      );

    const localUpdate =
      await this.syncOrganizationSubscriptionFromProviderSnapshot({
        organizationId: organization.id,
        subscriptionData,
        fallbackPriceId,
        fallbackInterval,
      });

    return {
      synced: !!localUpdate,
      source: 'PADDLE',
      reason: localUpdate
        ? null
        : 'Provider snapshot could not be applied to local configuration.',
      activeSubscription: this.buildSubscriptionSyncSnapshot(
        localUpdate?.next ?? activeSubscription,
      ),
    };
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
    const portalUrl = subscription.urls?.customer_portal;

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
    if (
      normalizedEventName === 'transaction.updated' &&
      payload?.data?.origin === 'subscription_payment_method_change'
    ) {
      this.logger.debug(
        'Ignoring transaction.updated event for payment method change',
        { eventName },
      );
      return;
    }

    const customData = {
      ...(data.custom_data ?? {}),
      ...(data.customData ?? {}),
    } as Record<string, any>;

    const organizationId =
      customData.organizationId ?? customData.organization_id ?? null;
    const email =
      customData.email ?? data.customer?.email ?? data.customer_email ?? null;

    const orgId =
      organizationId ?? (await this.findOrganizationIdByEmail(email));

    if (!orgId) {
      this.logger.warn('Webhook missing organization mapping', { eventName });
      return;
    }

    const priceId = this.extractPriceIdFromEventData(data);
    const fallbackInterval = this.resolveIntervalFromPriceId(priceId) ?? 'MONTHLY';

    if (subscriptionId) {
      const subscriptionSnapshotResponse =
        await this.paddle.getSubscription(subscriptionId);
      const subscriptionSnapshotData = subscriptionSnapshotResponse.data ?? {};
      const subscriptionUpdate =
        await this.syncOrganizationSubscriptionFromProviderSnapshot({
          organizationId: orgId,
          subscriptionData: subscriptionSnapshotData,
          fallbackPriceId: priceId,
          fallbackInterval,
          eventName: normalizedEventName,
        });

      if (subscriptionUpdate) {
        const renewsAt = this.extractRenewsAtFromEventData(
          subscriptionSnapshotData,
        );
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
      status: OrganizationStatus | null;
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
    const previousSubscriptionId = previous.providerSubscriptionId ?? null;
    const incomingSubscriptionId = details.providerSubscriptionId ?? null;

    if (
      previousSubscriptionId &&
      incomingSubscriptionId &&
      previousSubscriptionId !== incomingSubscriptionId &&
      details.status !== OrganizationStatus.ACTIVE
    ) {
      this.logger.warn(
        'Ignoring non-active webhook for non-current subscription',
        {
          organizationId,
          previousSubscriptionId,
          incomingSubscriptionId,
          incomingStatus: details.status,
        },
      );
      return null;
    }

    const nextSubscription = new OrganizationSubscription({
      plan: details.plan,
      planName: details.planName ?? null,
      status: details.status ?? previous.status,
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
      previous.interval !== nextSubscription.interval ||
      previous.amount !== nextSubscription.amount ||
      previous.currency !== nextSubscription.currency ||
      (previous.providerSubscriptionId ?? null) !==
        (nextSubscription.providerSubscriptionId ?? null) ||
      (previous.providerVariantId ?? null) !==
        (nextSubscription.providerVariantId ?? null) ||
      (previous.providerOrderId ?? null) !==
        (nextSubscription.providerOrderId ?? null) ||
      (previous.providerCustomerId ?? null) !==
        (nextSubscription.providerCustomerId ?? null) ||
      previous.activeUntil?.getTime?.() !==
        nextSubscription.activeUntil?.getTime?.() ||
      previous.activeFrom?.getTime?.() !==
        nextSubscription.activeFrom?.getTime?.() ||
      previous.planName !== nextSubscription.planName ||
      JSON.stringify(previous.limits) !==
        JSON.stringify(nextSubscription.limits) ||
      previous.provider !== nextSubscription.provider;

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

  private async resolvePricingFromPrice(params: { priceId: string }): Promise<{
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
          pricesById.set(String(response.data.id ?? priceId), response.data);
        }
      }),
    );

    return pricesById;
  }

  private extractPricePricing(price: { id?: string; [key: string]: any }): {
    amount: number;
    currency: string;
    interval: BillingInterval;
  } {
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
      payload.data?.subscription_id ?? payload.data?.subscription?.id ?? null;
    return candidate ? String(candidate) : null;
  }

  private extractPriceIdFromEventData(
    data: Record<string, any>,
  ): string | null {
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

  private extractCurrencyFromEventData(
    data: Record<string, any>,
  ): string | null {
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

  private extractIntervalFromEventData(
    data: Record<string, any>,
  ): string | null {
    return (
      data.billing_cycle?.interval ??
      data.items?.[0]?.price?.billing_cycle?.interval ??
      data.items?.[0]?.price?.billingCycle?.interval ??
      data.interval ??
      null
    );
  }

  private extractActiveFromFromEventData(
    data: Record<string, any>,
  ): Date | null {
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
  ): OrganizationStatus | null {
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
    if (eventName.includes('subscription.paused') || normalized === 'paused') {
      return OrganizationStatus.SUSPENDED;
    }
    if (
      eventName.includes('transaction.paid') ||
      eventName.includes('payment_success') ||
      eventName.includes('payment_succeeded') ||
      eventName.includes('subscription.created') ||
      eventName.includes('subscription.resumed') ||
      eventName.includes('subscription.activated') ||
      normalized === 'trialing' ||
      normalized === 'active' ||
      normalized === 'paid'
    ) {
      return OrganizationStatus.ACTIVE;
    }
    return null;
  }

  private async updateCheckoutSessionFromWebhook(params: {
    checkoutSessionId: string;
    eventName: string;
    rawStatus: string | null | undefined;
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
    rawStatus: string | null | undefined,
    eventName: string,
  ): 'PENDING' | 'PAID' | 'CANCELED' | 'FAILED' | 'EXPIRED' {
    const normalizedEvent = eventName.toLowerCase();
    const normalized = (rawStatus ?? '').toString().toLowerCase();

    if (
      normalizedEvent.includes('transaction.paid') ||
      normalizedEvent.includes('payment_success') ||
      normalizedEvent.includes('payment_succeeded') ||
      normalized === 'paid' ||
      normalized === 'completed'
    ) {
      return 'PAID';
    }

    if (normalized === 'expired') {
      return 'EXPIRED';
    }
    if (
      normalizedEvent.includes('transaction.payment_failed') ||
      normalizedEvent.includes('payment_failed') ||
      normalized === 'unpaid' ||
      normalized === 'past_due'
    ) {
      return 'FAILED';
    }
    if (
      normalizedEvent.includes('subscription.canceled') ||
      normalizedEvent.includes('subscription_cancelled') ||
      normalizedEvent.includes('subscription_canceled') ||
      normalized === 'cancelled' ||
      normalized === 'canceled' ||
      normalized === 'inactive'
    ) {
      return 'CANCELED';
    }
    if (
      normalizedEvent.includes('subscription.paused') ||
      normalized === 'paused'
    ) {
      return 'FAILED';
    }

    return 'PENDING';
  }

  private async resolveProrationBillingMode(params: {
    activeSubscription: OrganizationSubscription;
    targetPriceId: string;
    targetInterval: BillingInterval;
  }): Promise<PaddleSubscriptionProrationBillingMode> {
    const targetPricing = await this.resolvePricingFromPrice({
      priceId: params.targetPriceId,
    });
    const currentAnnualized = this.annualizeAmount(
      params.activeSubscription.amount,
      params.activeSubscription.interval,
    );
    const targetAnnualized = this.annualizeAmount(
      targetPricing?.amount ?? params.activeSubscription.amount,
      targetPricing?.interval ?? params.targetInterval,
    );

    if (targetAnnualized > currentAnnualized) {
      return 'prorated_immediately';
    }
    if (targetAnnualized < currentAnnualized) {
      return 'prorated_next_billing_period';
    }
    return 'do_not_bill';
  }

  private annualizeAmount(
    amount: number,
    interval: OrganizationSubscription['interval'],
  ): number {
    if (!Number.isFinite(amount)) {
      return 0;
    }
    if (interval === 'YEARLY') {
      return amount;
    }
    if (interval === 'LIFETIME') {
      return amount;
    }
    return amount * 12;
  }

  private toBillingInterval(
    interval: OrganizationSubscription['interval'],
  ): BillingInterval | null {
    if (interval === 'MONTHLY') {
      return 'MONTHLY';
    }
    if (interval === 'YEARLY') {
      return 'YEARLY';
    }
    return null;
  }

  private buildSubscriptionUpdateItems(params: {
    subscriptionData: Record<string, any>;
    currentVariantId: string | null;
    targetPriceId: string;
  }): PaddleSubscriptionUpdateItem[] {
    const rawItems = Array.isArray(params.subscriptionData.items)
      ? params.subscriptionData.items
      : [];
    if (rawItems.length === 0) {
      throw new Error('Current Paddle subscription has no items.');
    }

    const items = rawItems.map((item: Record<string, any>) => {
      const priceId = this.normalizeProviderOrderId(
        item.price_id ?? item.price?.id ?? null,
      );
      if (!priceId) {
        throw new Error(
          'Current Paddle subscription item is missing price_id.',
        );
      }
      const quantityRaw = Number(item.quantity ?? 1);
      const quantity =
        Number.isFinite(quantityRaw) && quantityRaw > 0
          ? Math.round(quantityRaw)
          : 1;

      return {
        priceId,
        quantity,
      };
    });

    const managedItemIndex = this.resolveManagedSubscriptionItemIndex({
      items,
      currentVariantId: params.currentVariantId,
    });
    if (managedItemIndex < 0) {
      throw new Error(
        'Unable to determine which subscription item should be replaced.',
      );
    }

    return items.map((item, index) => ({
      price_id:
        index === managedItemIndex ? params.targetPriceId : item.priceId,
      quantity: item.quantity,
    }));
  }

  private resolveManagedSubscriptionItemIndex(params: {
    items: Array<{ priceId: string; quantity: number }>;
    currentVariantId: string | null;
  }): number {
    if (params.currentVariantId) {
      const currentItemIndex = params.items.findIndex(
        (item) => item.priceId === params.currentVariantId,
      );
      if (currentItemIndex >= 0) {
        return currentItemIndex;
      }
    }

    const managedItemIndex = params.items.findIndex(
      (item) => !!this.resolveStandardPlanForPrice(item.priceId),
    );
    if (managedItemIndex >= 0) {
      return managedItemIndex;
    }

    if (params.items.length === 1) {
      return 0;
    }

    return -1;
  }

  private async syncOrganizationSubscriptionFromProviderSnapshot(params: {
    organizationId: string;
    subscriptionData: Record<string, any>;
    fallbackPriceId?: string | null;
    fallbackInterval: BillingInterval;
    eventName?: string;
  }) {
    const normalizedEventName = (
      params.eventName ?? 'subscription.updated'
    ).toLowerCase();
    const priceId =
      this.extractPriceIdFromEventData(params.subscriptionData) ??
      params.fallbackPriceId ??
      null;
    const plan = this.resolvePlan(null, priceId);
    const status =
      this.resolveStatus(params.subscriptionData.status, normalizedEventName) ??
      OrganizationStatus.ACTIVE;
    const limits = getPlanLimits(plan);
    const planName =
      params.subscriptionData.custom_data?.planName ??
      params.subscriptionData.custom_data?.plan_name ??
      params.subscriptionData.customData?.planName ??
      params.subscriptionData.customData?.plan_name ??
      null;
    const pricingFallback = priceId
      ? await this.resolvePricingFromPrice({
          priceId,
        })
      : null;
    const rawAmount = this.extractAmountFromEventData(params.subscriptionData);
    const intervalValue = this.extractIntervalFromEventData(
      params.subscriptionData,
    );
    const resolvedInterval = intervalValue
      ? this.mapInterval(intervalValue)
      : (pricingFallback?.interval ?? params.fallbackInterval);
    const resolvedAmount =
      rawAmount > 0 || plan === OrganizationPlan.FREE
        ? rawAmount
        : (pricingFallback?.amount ?? rawAmount);
    const resolvedCurrency =
      this.extractCurrencyFromEventData(params.subscriptionData) ??
      pricingFallback?.currency ??
      'EUR';
    const providerSubscriptionId =
      this.normalizeProviderOrderId(params.subscriptionData.id) ?? null;

    if (!providerSubscriptionId) {
      throw new Error('Updated Paddle subscription is missing id.');
    }

    return this.updateOrganizationSubscription(params.organizationId, {
      plan,
      planName,
      status,
      providerSubscriptionId,
      providerCustomerId:
        this.normalizeProviderOrderId(
          params.subscriptionData.customer_id ??
            params.subscriptionData.customer?.id ??
            null,
        ) ?? null,
      providerOrderId: this.normalizeProviderOrderId(
        params.subscriptionData.order_id ?? params.subscriptionData.id,
      ),
      providerVariantId: priceId,
      activeFrom: this.extractActiveFromFromEventData(params.subscriptionData),
      activeUntil: this.extractActiveUntilFromEventData(
        params.subscriptionData,
        status,
        normalizedEventName,
      ),
      amount: resolvedAmount,
      currency: resolvedCurrency,
      interval: resolvedInterval,
      limits,
    });
  }

  private buildSubscriptionSyncSnapshot(
    subscription: OrganizationSubscription,
  ) {
    return {
      plan: subscription.plan,
      status: subscription.status,
      interval: subscription.interval,
      providerSubscriptionId: subscription.providerSubscriptionId ?? null,
      providerVariantId: subscription.providerVariantId ?? null,
      amount: subscription.amount,
      currency: subscription.currency,
      activeFrom: subscription.activeFrom?.toISOString?.() ?? null,
      activeUntil: subscription.activeUntil?.toISOString?.() ?? null,
    };
  }

  private isProrationModeInvalidForScheduledChange(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }
    const normalized = error.message.toLowerCase();
    return (
      normalized.includes(
        'subscription_invalid_billing_mode_for_scheduled_change',
      ) ||
      (normalized.includes('scheduled') &&
        (normalized.includes('billing mode') ||
          normalized.includes('proration_billing_mode')))
    );
  }

  private hasScheduledCancellation(
    subscriptionData: Record<string, any>,
  ): boolean {
    const scheduledChange =
      subscriptionData.scheduled_change ?? subscriptionData.scheduledChange;
    if (!scheduledChange || typeof scheduledChange !== 'object') {
      return false;
    }
    const action = (scheduledChange.action ?? '')
      .toString()
      .toLowerCase()
      .trim();
    if (!action) {
      return false;
    }
    return action.includes('cancel');
  }

  private isMinimumPaymentAmountError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }
    const normalized = error.message.toLowerCase();
    return (
      normalized.includes(
        'transaction balance is less than what we can charge',
      ) ||
      (normalized.includes('minimum payment amount') &&
        normalized.includes('subscription update'))
    );
  }

  private mapSubscriptionChangeError(error: unknown): string | null {
    if (error instanceof BadRequestException) {
      const response = error.getResponse();
      if (typeof response === 'string' && response.trim()) {
        return response;
      }
      if (
        response &&
        typeof response === 'object' &&
        'message' in response &&
        typeof (response as { message?: unknown }).message === 'string'
      ) {
        const message = (response as { message: string }).message.trim();
        if (message) {
          return message;
        }
      }
    }

    if (!(error instanceof Error)) {
      return null;
    }

    const normalized = error.message.toLowerCase();
    if (this.isMinimumPaymentAmountError(error)) {
      return 'Unable to apply an immediate billing adjustment because the prorated amount is below Paddle minimum charge. Please try again later or cancel and create a new subscription.';
    }
    if (
      normalized.includes(
        'the new items are not valid for updating this subscription',
      )
    ) {
      return 'Changing billing interval is not available for an active subscription. Cancel your current subscription first, then choose a new interval.';
    }
    if (
      normalized.includes(
        'changing billing interval is not available for an active subscription',
      )
    ) {
      return error.message;
    }
    if (
      normalized.includes('scheduled change') &&
      (normalized.includes('proration_billing_mode') ||
        normalized.includes('billing mode'))
    ) {
      return 'Subscription update is temporarily blocked because this subscription already has a scheduled change. Open Manage subscription and resolve the scheduled change first.';
    }

    return null;
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
