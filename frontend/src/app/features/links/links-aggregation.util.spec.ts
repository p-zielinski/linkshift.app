import type { Domain } from '../../core/models/domain.model';
import type { DomainGroup } from '../../core/models/domain-group.model';
import type { Subdomain } from '../../core/models/subdomain.model';
import type { AggregatedLinkRow } from '../../core/models/links-list.model';
import {
  buildGroupHostOptions,
  buildShortPath,
  buildShortUrl,
  buildShortUrlsForHosts,
  expandAggregatedLinkRowShortUrls,
  formatShortUrlsForClipboard,
  formatShortUrlsTooltip,
  normalizeRuleSourcePath,
} from './links-aggregation.util';

describe('links-aggregation.util', () => {
  it('builds short path from source and key', () => {
    expect(buildShortPath('/go', 'summer-sale')).toBe('/go/summer-sale');
    expect(buildShortPath('go', 'summer-sale')).toBe('/go/summer-sale');
    expect(buildShortPath('/go/', '/summer-sale/')).toBe('/go/summer-sale');
  });

  it('builds root short path when source is slash', () => {
    expect(buildShortPath('/', 'summer-sale')).toBe('/summer-sale');
    expect(buildShortPath('/', '')).toBe('/');
  });

  it('builds short URL with https protocol', () => {
    expect(buildShortUrl('promo.example.com', '/go/summer')).toBe('https://promo.example.com/go/summer');
    expect(buildShortUrl('https://promo.example.com', '/go/summer')).toBe(
      'https://promo.example.com/go/summer',
    );
    expect(buildShortUrl('', '/go/summer')).toBe('/go/summer');
  });

  it('builds short URLs for every host on a site', () => {
    const hosts = [
      {
        domainGroupId: 'group-1',
        host: 'first.example.com',
        label: 'first.example.com',
        kind: 'custom-domain' as const,
      },
      {
        domainGroupId: 'group-1',
        host: 'second.example.com',
        label: 'second.example.com',
        kind: 'custom-domain' as const,
      },
    ];

    expect(buildShortUrlsForHosts(hosts, '/go/launch')).toEqual([
      'https://first.example.com/go/launch',
      'https://second.example.com/go/launch',
    ]);
  });

  it('lazy-expands shortUrls when API row has none', () => {
    const row: AggregatedLinkRow = {
      id: 'entry-1',
      domainGroupId: 'group-1',
      linkMapId: 'map-1',
      linkMapName: 'Default links',
      redirectRuleId: 'rule-1',
      host: 'promo.example.com',
      shortPath: '/go/launch',
      shortUrls: [],
      shortUrl: '/go/launch',
      key: 'launch',
      destination: 'https://target.example.com',
      updatedAt: '2026-06-05T10:00:00.000Z',
    };
    const hostsByDomainGroupId = {
      'group-1': [
        {
          domainGroupId: 'group-1',
          host: 'promo.example.com',
          label: 'promo.example.com',
          kind: 'custom-domain' as const,
        },
        {
          domainGroupId: 'group-1',
          host: 'links.example.com',
          label: 'links.example.com',
          kind: 'custom-domain' as const,
        },
      ],
    };

    const expanded = expandAggregatedLinkRowShortUrls(row, hostsByDomainGroupId);
    expect(expanded.shortUrls).toEqual([
      'https://promo.example.com/go/launch',
      'https://links.example.com/go/launch',
    ]);
    expect(expanded.shortUrl).toBe('https://promo.example.com/go/launch');
    expect(expandAggregatedLinkRowShortUrls(expanded, hostsByDomainGroupId)).toBe(expanded);
  });

  it('formats short URLs for clipboard and tooltip', () => {
    const urls = ['https://a.example/go', 'https://b.example/go'];

    expect(formatShortUrlsForClipboard(urls)).toBe('https://a.example/go\nhttps://b.example/go');
    expect(formatShortUrlsTooltip('/go', urls)).toBe('https://a.example/go\nhttps://b.example/go');
    expect(formatShortUrlsTooltip('/go', ['https://a.example/go'])).toBe('https://a.example/go');
    expect(formatShortUrlsTooltip('/go', [])).toBe('/go');
  });

  it('normalizes source path from stored rule source', () => {
    expect(normalizeRuleSourcePath('/go')).toBe('/go');
    expect(normalizeRuleSourcePath('https://example.com/go/')).toBe('/go');
    expect(normalizeRuleSourcePath('')).toBe('/');
  });

  it('builds host options from group subdomains and custom domains', () => {
    const groups: DomainGroup[] = [
      {
        id: 'group-1',
        name: 'Marketing',
        organizationId: 'org-1',
        robotsPolicy: 'NONE',
        redirectDeliveryMode: 'INSTANT',
        customRobotsContent: null,
        createdAt: '',
        updatedAt: '',
      },
    ];
    const subdomains: Subdomain[] = [
      { id: 'sub-1', name: 'promo', domainGroupId: 'group-1', createdAt: '', updatedAt: '' },
    ];
    const domains: Domain[] = [
      { id: 'dom-1', name: 'campaign.example.com', domainGroupId: 'group-1', dnsStatus: 'VERIFIED', createdAt: '', updatedAt: '' },
    ];

    const hosts = buildGroupHostOptions(groups, subdomains, domains, 'https://ls.linkshift.app');
    expect(hosts.map((host) => host.host)).toEqual(['promo.ls.linkshift.app', 'campaign.example.com']);
  });
});
