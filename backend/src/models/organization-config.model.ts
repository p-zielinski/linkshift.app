export enum OrganizationPlan {
  FREE = 'FREE',
  PAID = 'PAID',
}

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PAYMENT_DUE = 'PAYMENT_DUE',
}

/**
 * Represents the configuration and limits for an Organization.
 * Default values are applied if not present in the database.
 */
export class OrganizationConfiguration {
  // Account Status & Plan
  plan: OrganizationPlan = OrganizationPlan.FREE;
  status: OrganizationStatus = OrganizationStatus.ACTIVE;

  // Domain Group Limits
  maxDomainGroups: number = 1;

  // Domain Limits
  maxDomainsPerGroup: number = 1;
  maxTotalDomains: number = 1;

  // Redirect Rule Limits
  maxRulesPerGroup: number = 15;
  maxTotalRules: number = 15;

  constructor(partial?: Partial<OrganizationConfiguration>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  /**
   * Creates a configuration instance from a JSON object, applying defaults.
   */
  static fromJson(json: any): OrganizationConfiguration {
    return new OrganizationConfiguration(json || {});
  }
}
