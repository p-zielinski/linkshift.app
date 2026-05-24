export const SAFETY_CACHE_PREFIX = 'safety:domain:';
export const SAFETY_L1_TTL_MS = 2 * 60 * 1000;
export const SAFETY_L2_TTL_SECONDS = 12 * 60 * 60;

export const DOMAIN_BLACKLIST_SET_KEY = 'safety:blacklist:domains';

export const REDIRECT_HIT_PREFIX_GLOBAL = 'redirect:rule:hits:global';
export const REDIRECT_HIT_PREFIX_ORG = 'redirect:rule:hits:org';
export const REDIRECT_HIT_TTL_SECONDS = 26 * 60 * 60;
export const REDIRECT_TOP_TEMP_KEY_PREFIX = 'redirect:rule:hits:top';

export const SAFETY_RESCAN_QUEUE = 'safety-rescan';

export const WEB_RISK_MONTHLY_USAGE_KEY_PREFIX = 'safety:web-risk:usage';
export const WEB_RISK_WARNED_THRESHOLDS_KEY_PREFIX =
  'safety:web-risk:warned-thresholds';
export const WEB_RISK_MONTHLY_BUDGET_DEFAULT = 95_000;
export const WEB_RISK_MONTHLY_COUNTER_TTL_SECONDS = 93 * 24 * 60 * 60;
export const WEB_RISK_USAGE_WARNING_THRESHOLDS_DEFAULT = [80, 90, 95, 100];
export const WEB_RISK_RESCAN_USAGE_THRESHOLD_PERCENT_DEFAULT = 90;
