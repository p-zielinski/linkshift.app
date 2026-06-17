import { OrganizationBootstrapService } from './organization-bootstrap.service';
import { CacheManagerService } from '../cache/cache-manager.service';
import { RedirectService } from '../redirect/redirect.service';
import { AppEntity } from '../utils';

jest.mock('../utils', () => {
  const actual = jest.requireActual('../utils');
  return {
    ...actual,
    createCustomCuid: jest.fn((entity: AppEntity, length?: number) => {
      if (entity === AppEntity.LinkMap) {
        return 'lmap_test_link_map_id_0000000001';
      }
      if (entity === AppEntity.RedirectRule) {
        return 'rule_test_redirect_rule_id_001';
      }
      return actual.createCustomCuid(entity, length);
    }),
  };
});

describe('OrganizationBootstrapService', () => {
  let service: OrganizationBootstrapService;
  let cacheManagerService: {
    invalidateCustomCache: jest.Mock<Promise<void>, [string]>;
  };
  let redirectService: {
    invalidateDomainGroupRedirectCache: jest.Mock<Promise<void>, [string]>;
  };

  beforeEach(() => {
    cacheManagerService = {
      invalidateCustomCache: jest.fn().mockResolvedValue(undefined),
    };
    redirectService = {
      invalidateDomainGroupRedirectCache: jest
        .fn()
        .mockResolvedValue(undefined),
    };

    service = new OrganizationBootstrapService(
      cacheManagerService as unknown as CacheManagerService,
      redirectService as unknown as RedirectService,
    );
  });

  describe('provisionStarterResourcesInTransaction', () => {
    it('creates starter link map and redirect rule in the transaction', async () => {
      const tx = {
        linkMap: {
          create: jest.fn().mockResolvedValue({
            id: 'lmap_test_link_map_id_0000000001',
          }),
        },
        redirectRule: {
          create: jest.fn().mockResolvedValue({
            id: 'rule_test_redirect_rule_id_001',
          }),
        },
      };

      const result = await service.provisionStarterResourcesInTransaction(
        tx,
        { domainGroupId: 'dmg_test_group' },
      );

      expect(tx.linkMap.create).toHaveBeenCalledWith({
        data: {
          id: 'lmap_test_link_map_id_0000000001',
          name: 'First link map',
          domainGroupId: 'dmg_test_group',
          caseSensitive: false,
          queryMatch: 'ignore',
          fallbackDestination: null,
        },
      });
      expect(tx.redirectRule.create).toHaveBeenCalledWith({
        data: {
          id: 'rule_test_redirect_rule_id_001',
          source: '/short',
          pathMatch: 'prefix',
          queryMatch: 'ignore',
          destination: null,
          statusCode: 302,
          matchMethod: [],
          priority: 0,
          linkMapId: 'lmap_test_link_map_id_0000000001',
          domainGroupId: 'dmg_test_group',
        },
      });
      expect(result).toEqual({
        linkMap: { id: 'lmap_test_link_map_id_0000000001' },
        redirectRule: { id: 'rule_test_redirect_rule_id_001' },
      });
    });
  });

  describe('invalidateStarterResourcesCache', () => {
    it('invalidates redirect domain cache and link map cache', async () => {
      await service.invalidateStarterResourcesCache({
        domainGroupId: 'dmg_test_group',
        linkMapId: 'lmap_test_link_map_id_0000000001',
      });

      expect(
        redirectService.invalidateDomainGroupRedirectCache,
      ).toHaveBeenCalledWith('dmg_test_group');
      expect(cacheManagerService.invalidateCustomCache).toHaveBeenCalledWith(
        'LINK_MAP_CONTEXT:lmap_test_link_map_id_0000000001',
      );
    });
  });
});
