/**
 * Server-side link row aggregation helpers.
 * Logic must stay aligned with `frontend/src/app/features/links/links-aggregation.util.ts`.
 */

const HTTPS_PROTOCOL = 'https://';

export type RoutingRuleCandidate = {
  id: string;
  linkMapId: string | null;
  source: string;
  pathMatch: string;
  queryMatch: string;
  isBlocked: boolean;
  priority: number;
  createdAt: Date | string;
};

export function resolveSubdomainBaseHost(baseUrl: string): string {
  return baseUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
}

export function normalizeRuleSourcePath(source: string): string | null {
  try {
    const url = new URL(source, 'https://local.linkshift.dev');
    const pathname = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`;
    return pathname.replace(/\/+$/, '') || '/';
  } catch {
    return null;
  }
}

export function buildShortPath(sourcePath: string, key: string): string {
  const normalizedSource = normalizeSourcePath(sourcePath);
  const normalizedKey = normalizeKeyForPath(key);
  if (!normalizedKey) {
    return normalizedSource;
  }
  if (normalizedSource === '/') {
    return `/${normalizedKey}`;
  }
  return `${normalizedSource}/${normalizedKey}`;
}

export function buildShortUrl(host: string, shortPath: string): string {
  const normalizedHost = host.replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
  const normalizedPath = shortPath.startsWith('/') ? shortPath : `/${shortPath}`;

  if (!normalizedHost) {
    return normalizedPath;
  }
  return `${HTTPS_PROTOCOL}${normalizedHost}${normalizedPath}`;
}

export function resolveBestRuleByMapId(
  rules: RoutingRuleCandidate[],
): Record<string, RoutingRuleCandidate> {
  const byMapId: Record<string, RoutingRuleCandidate> = {};
  const candidates = rules
    .filter(
      (rule) =>
        !!rule.linkMapId &&
        rule.pathMatch === 'prefix' &&
        rule.queryMatch === 'ignore' &&
        !rule.isBlocked,
    )
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }
      return compareCreatedAt(left.createdAt, right.createdAt);
    });

  for (const rule of candidates) {
    const mapId = rule.linkMapId as string;
    if (!byMapId[mapId]) {
      byMapId[mapId] = rule;
    }
  }

  return byMapId;
}

export function resolveFirstHostForDomainGroup(
  domainGroupId: string,
  subdomains: Array<{ name: string; domainGroupId: string }>,
  domains: Array<{ name: string; domainGroupId: string }>,
  subdomainBaseHost: string,
): string {
  const normalizedBaseHost = resolveSubdomainBaseHost(subdomainBaseHost);

  const groupSubdomains = subdomains
    .filter((subdomain) => subdomain.domainGroupId === domainGroupId)
    .map((subdomain) => `${subdomain.name}.${normalizedBaseHost}`)
    .filter((host) => host !== '.')
    .map((host) => host.toLowerCase().trim())
    .filter((host) => host.length > 0);

  if (groupSubdomains.length > 0) {
    return groupSubdomains[0];
  }

  const groupDomains = domains
    .filter((domain) => domain.domainGroupId === domainGroupId)
    .map((domain) => domain.name.trim().toLowerCase())
    .filter((host) => host.length > 0);

  return groupDomains[0] ?? '';
}

function normalizeSourcePath(sourcePath: string): string {
  const normalized = sourcePath.trim();
  if (!normalized) {
    return '/';
  }
  const withLeadingSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return withLeadingSlash.replace(/\/+$/, '') || '/';
}

function normalizeKeyForPath(value: string): string {
  return value.trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

function compareCreatedAt(left: Date | string, right: Date | string): number {
  const leftValue = left instanceof Date ? left.toISOString() : left;
  const rightValue = right instanceof Date ? right.toISOString() : right;
  return leftValue.localeCompare(rightValue);
}
