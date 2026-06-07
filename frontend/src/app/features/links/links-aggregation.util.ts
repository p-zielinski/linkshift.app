import type { Domain } from '../../core/models/domain.model';
import type { DomainGroup } from '../../core/models/domain-group.model';
import type { AggregatedLinkRow } from '../../core/models/links-list.model';
import type { Subdomain } from '../../core/models/subdomain.model';

export type { AggregatedLinkRow };

export type LinksHostOption = {
  domainGroupId: string;
  host: string;
  label: string;
  kind: 'subdomain' | 'custom-domain';
};

const HTTPS_PROTOCOL = 'https://';

export function resolveSubdomainBaseHost(baseUrl: string): string {
  return baseUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
}

export function buildGroupHostOptions(
  domainGroups: DomainGroup[],
  subdomains: Subdomain[],
  domains: Domain[],
  subdomainBaseHost: string,
): LinksHostOption[] {
  const normalizedBaseHost = resolveSubdomainBaseHost(subdomainBaseHost);
  const hostOptions: LinksHostOption[] = [];

  for (const group of domainGroups) {
    const groupSubdomains = subdomains
      .filter((subdomain) => subdomain.domainGroupId === group.id)
      .map((subdomain) => `${subdomain.name}.${normalizedBaseHost}`)
      .filter((host) => host !== '.')
      .map((host) => host.toLowerCase().trim())
      .filter((host) => host.length > 0);

    for (const host of groupSubdomains) {
      hostOptions.push({
        domainGroupId: group.id,
        host,
        label: `${host} (managed subdomain)`,
        kind: 'subdomain',
      });
    }

    const groupDomains = domains
      .filter((domain) => domain.domainGroupId === group.id)
      .map((domain) => domain.name.trim().toLowerCase())
      .filter((host) => host.length > 0);

    for (const host of groupDomains) {
      hostOptions.push({
        domainGroupId: group.id,
        host,
        label: `${host} (custom domain)`,
        kind: 'custom-domain',
      });
    }
  }

  return dedupeHosts(hostOptions);
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

/** Build full short URLs for every connected host on a site (display/copy only). */
export function buildShortUrlsForHosts(hosts: LinksHostOption[], shortPath: string): string[] {
  if (!shortPath) {
    return [];
  }
  return hosts.map((option) => buildShortUrl(option.host, shortPath));
}

/** Join multiple short URLs for clipboard copy (one URL per line). */
export function formatShortUrlsForClipboard(shortUrls: readonly string[]): string {
  return shortUrls.filter((url) => url.trim().length > 0).join('\n');
}

/** Tooltip text listing all full short URLs for a site-scoped link. */
export function formatShortUrlsTooltip(shortPath: string, shortUrls: readonly string[]): string {
  if (shortUrls.length === 0) {
    return shortPath;
  }
  if (shortUrls.length === 1) {
    return shortUrls[0];
  }
  return shortUrls.join('\n');
}

/** Lazy-expand API rows that ship with empty `shortUrls`. */
export function expandAggregatedLinkRowShortUrls(
  row: AggregatedLinkRow,
  hostsByDomainGroupId: Record<string, LinksHostOption[]>,
): AggregatedLinkRow {
  if (row.shortUrls.length > 0) {
    return row;
  }
  const hosts = hostsByDomainGroupId[row.domainGroupId] ?? [];
  const shortUrls = buildShortUrlsForHosts(hosts, row.shortPath);
  return { ...row, shortUrls, shortUrl: shortUrls[0] ?? row.shortUrl };
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

function dedupeHosts(hostOptions: LinksHostOption[]): LinksHostOption[] {
  const deduped = new Map<string, LinksHostOption>();
  for (const option of hostOptions) {
    const key = `${option.domainGroupId}::${option.host}`;
    if (!deduped.has(key)) {
      deduped.set(key, option);
    }
  }
  return Array.from(deduped.values());
}
