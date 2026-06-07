import type { Subdomain } from '../../core/models/subdomain.model';

export function filterSubdomainsByDomainGroup(
  subdomains: readonly Subdomain[],
  domainGroupId: string,
): Subdomain[] {
  if (!domainGroupId) {
    return [...subdomains];
  }

  return subdomains.filter((subdomain) => subdomain.domainGroupId === domainGroupId);
}
