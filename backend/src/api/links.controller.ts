import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import { LinksListService } from '../links/links-list.service';
import { ZodPipe } from '../pipes/zod.pipe';
import type { ListLinksQueryDto } from '../zod-schames/links.schemas';
import { ListLinksQuerySchema } from '../zod-schames/links.schemas';

@Controller('api/v1/links')
export class LinksController {
  constructor(
    private readonly linksListService: LinksListService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @User('organizationId') organizationId: string,
    @Query(new ZodPipe(ListLinksQuerySchema)) query: ListLinksQueryDto,
  ) {
    this.logger.log('Links list requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: query.domainGroupId,
      linkMapId: query.linkMapId,
      limit: query.limit,
      hasSearch: Boolean(query.search),
      hasCursor: Boolean(query.startAfterId),
    });

    return this.linksListService.list(organizationId, query);
  }
}
