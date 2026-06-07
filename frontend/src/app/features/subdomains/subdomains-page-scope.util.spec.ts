import type { Subdomain } from '../../core/models/subdomain.model';
import { filterSubdomainsByDomainGroup } from './subdomains-page-scope.util';

describe('filterSubdomainsByDomainGroup', () => {
  const subdomains: Subdomain[] = [
    {
      id: 'sub-1',
      name: 'alpha',
      domainGroupId: 'group-a',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'sub-2',
      name: 'beta',
      domainGroupId: 'group-b',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  it('returns all subdomains when no group is selected', () => {
    expect(filterSubdomainsByDomainGroup(subdomains, '')).toEqual(subdomains);
  });

  it('filters subdomains by selected domain group', () => {
    expect(filterSubdomainsByDomainGroup(subdomains, 'group-a')).toEqual([subdomains[0]]);
  });
});
