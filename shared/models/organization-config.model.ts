export enum OrganizationPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELED = 'CANCELED',
}

/**
 * Detailed snapshot of a plan's limits and billing at the time of purchase.
 */
export class OrganizationSubscription {
  plan: OrganizationPlan = OrganizationPlan.FREE;
  status: OrganizationStatus = OrganizationStatus.ACTIVE;

  // Validity
  activeFrom: Date = new Date();
  activeUntil: Date | null = null;

  // Financials
  amount: number = 0;
  currency: string = 'EUR';
  interval: 'MONTHLY' | 'YEARLY' | 'LIFETIME' = 'MONTHLY';

  // Limits "Snapshotted" for this specific subscription
  limits = {
    maxDomainGroups: 1,
    maxDomainsPerGroup: 1,
    maxTotalDomains: 1,
    maxRulesPerGroup: 15,
    maxTotalRules: 15,
    redirectionLimitPerMinute: 10,
  };

  constructor(partial?: Partial<OrganizationSubscription>) {
    if (partial) {
      Object.assign(this, partial);
      if (this.activeUntil && typeof this.activeUntil === 'string') {
        this.activeUntil = new Date(this.activeUntil);
      }
      if (this.activeFrom && typeof this.activeFrom === 'string') {
        this.activeFrom = new Date(this.activeFrom);
      }
    }
  }
}

/**
 * Main Organization Configuration holder.
 */
export class OrganizationConfiguration {
  activeSubscription: OrganizationSubscription = new OrganizationSubscription();
  subscriptionHistory: OrganizationSubscription[] = [];

  constructor(partial?: Partial<OrganizationConfiguration>) {
    if (partial) {
      if (partial.activeSubscription) {
        this.activeSubscription = new OrganizationSubscription(
          partial.activeSubscription,
        );
      }
      if (partial.subscriptionHistory) {
        this.subscriptionHistory = partial.subscriptionHistory.map(
          (s) => new OrganizationSubscription(s),
        );
      }
    }
  }

  static fromJson(json: any): OrganizationConfiguration {
    return new OrganizationConfiguration(json || {});
  }
}
