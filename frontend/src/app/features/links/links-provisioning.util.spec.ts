import type { LinkMap } from '../../core/models/link-map.model';
import type { RedirectRule } from '../../core/models/redirect-rule.model';
import {
  DEFAULT_LINK_MAP_NAME,
  buildDefaultLinkMapPayload,
  buildDefaultPrefixRulePayload,
  isValidHttpsDestination,
  isValidLinkKey,
  normalizeDestinationUrl,
  planLinkProvisioning,
  sanitizeLinkKey,
} from './links-provisioning.util';

describe('links-provisioning.util', () => {
  it('sanitizes and validates key slug', () => {
    expect(sanitizeLinkKey('/Summer-Sale/')).toBe('summer-sale');
    expect(isValidLinkKey('summer-sale')).toBe(true);
    expect(isValidLinkKey('summer sale')).toBe(false);
  });

  it('normalizes destination URL to https', () => {
    expect(normalizeDestinationUrl('example.com/promo')).toBe('https://example.com/promo');
    expect(normalizeDestinationUrl('https://example.com/promo')).toBe('https://example.com/promo');
    expect(isValidHttpsDestination('example.com')).toBe(true);
    expect(isValidHttpsDestination('http://example.com')).toBe(false);
  });

  it('reuses existing routing rule and map when available', () => {
    const maps: LinkMap[] = [
      {
        id: 'map-1',
        name: DEFAULT_LINK_MAP_NAME,
        domainGroupId: 'group-1',
        caseSensitive: false,
        queryMatch: 'ignore',
        entriesCount: 0,
        createdAt: '',
        updatedAt: '',
      },
    ];
    const rules: RedirectRule[] = [
      {
        id: 'rule-1',
        source: '/go',
        destination: null,
        statusCode: 302,
        matchMethod: [],
        queryMatch: 'ignore',
        pathMatch: 'prefix',
        linkMapId: 'map-1',
        priority: 0,
        domainGroupId: 'group-1',
        createdAt: '2026-06-05T10:00:00.000Z',
        updatedAt: '',
      },
    ];

    const plan = planLinkProvisioning({
      domainGroupId: 'group-1',
      linkMaps: maps,
      redirectRules: rules,
    });

    expect(plan.selectedMap?.id).toBe('map-1');
    expect(plan.createDefaultMap).toBe(false);
    expect(plan.createPrefixRule).toBe(false);
    expect(plan.sourcePath).toBe('/go');
  });

  it('reuses existing map and requests prefix rule when rule is missing', () => {
    const maps: LinkMap[] = [
      {
        id: 'map-1',
        name: 'Marketing links',
        domainGroupId: 'group-1',
        caseSensitive: false,
        queryMatch: 'ignore',
        entriesCount: 0,
        createdAt: '',
        updatedAt: '',
      },
    ];

    const plan = planLinkProvisioning({
      domainGroupId: 'group-1',
      linkMaps: maps,
      redirectRules: [],
    });

    expect(plan.selectedMap?.id).toBe('map-1');
    expect(plan.createDefaultMap).toBe(false);
    expect(plan.createPrefixRule).toBe(true);
  });

  it('requests default map and prefix rule when group has no map', () => {
    const plan = planLinkProvisioning({
      domainGroupId: 'group-1',
      linkMaps: [],
      redirectRules: [],
    });

    expect(plan.selectedMap).toBeNull();
    expect(plan.createDefaultMap).toBe(true);
    expect(plan.createPrefixRule).toBe(true);
    expect(plan.sourcePath).toBe('/go');
  });

  it('builds default creation payloads with required defaults', () => {
    expect(buildDefaultLinkMapPayload('group-1')).toEqual({
      name: DEFAULT_LINK_MAP_NAME,
      domainGroupId: 'group-1',
      caseSensitive: false,
      queryMatch: 'ignore',
    });

    expect(
      buildDefaultPrefixRulePayload({
        domainGroupId: 'group-1',
        linkMapId: 'map-1',
        sourcePath: '/go',
      }),
    ).toEqual({
      domainGroupId: 'group-1',
      source: '/go',
      destination: null,
      statusCode: 302,
      pathMatch: 'prefix',
      queryMatch: 'ignore',
      priority: 0,
      linkMapId: 'map-1',
      matchMethod: [],
    });
  });
});
