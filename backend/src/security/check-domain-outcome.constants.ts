export const CHECK_DOMAIN_OUTCOME = {
  not_found: 'not_found',
  reserved_subdomain: 'reserved_subdomain',
  invalid_subdomain_format: 'invalid_subdomain_format',
  inactive_group: 'inactive_group',
  dns_pending: 'dns_pending',
  allowed: 'allowed',
} as const;

export type CheckDomainOutcome =
  (typeof CHECK_DOMAIN_OUTCOME)[keyof typeof CHECK_DOMAIN_OUTCOME];

export type CheckDomainHostType = 'subdomain' | 'custom' | 'unknown';

export type DomainAllowCheckResult = {
  allowed: boolean;
  outcome: CheckDomainOutcome;
  hostType: CheckDomainHostType;
};

export type DomainAllowCheckCached = Pick<
  DomainAllowCheckResult,
  'allowed' | 'outcome'
>;
