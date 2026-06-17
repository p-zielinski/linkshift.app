import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CacheManagerService } from '../cache/cache-manager.service';
import { RedirectService } from '../redirect/redirect.service';
import { AppEntity, createCustomCuid } from '../utils';

export const STARTER_LINK_MAP_NAME = 'First link map';

const STARTER_REDIRECT_SOURCE = '/short';

export type BootstrapStarterResources = {
  linkMap: { id: string };
  redirectRule: { id: string };
};

@Injectable()
export class OrganizationBootstrapService {
  constructor(
    private readonly cacheManagerService: CacheManagerService,
    private readonly redirectService: RedirectService,
  ) {}

  async provisionStarterResourcesInTransaction(
    tx: Pick<Prisma.TransactionClient, 'linkMap' | 'redirectRule'>,
    params: { domainGroupId: string },
  ): Promise<BootstrapStarterResources> {
    const linkMapId = createCustomCuid(AppEntity.LinkMap, 32);
    const redirectRuleId = createCustomCuid(AppEntity.RedirectRule, 32);

    const linkMap = await tx.linkMap.create({
      data: {
        id: linkMapId,
        name: STARTER_LINK_MAP_NAME,
        domainGroupId: params.domainGroupId,
        caseSensitive: false,
        queryMatch: 'ignore',
        fallbackDestination: null,
      },
    });

    const redirectRule = await tx.redirectRule.create({
      data: {
        id: redirectRuleId,
        source: STARTER_REDIRECT_SOURCE,
        pathMatch: 'prefix',
        queryMatch: 'ignore',
        destination: null,
        statusCode: 302,
        matchMethod: [],
        priority: 0,
        linkMapId: linkMap.id,
        domainGroupId: params.domainGroupId,
      },
    });

    return { linkMap, redirectRule };
  }

  async invalidateStarterResourcesCache(params: {
    domainGroupId: string;
    linkMapId: string;
  }): Promise<void> {
    await Promise.all([
      this.redirectService.invalidateDomainGroupRedirectCache(
        params.domainGroupId,
      ),
      this.cacheManagerService.invalidateCustomCache(
        this.getLinkMapCacheKey(params.linkMapId),
      ),
    ]);
  }

  private getLinkMapCacheKey(linkMapId: string): string {
    return `LINK_MAP_CONTEXT:${linkMapId}`;
  }
}
