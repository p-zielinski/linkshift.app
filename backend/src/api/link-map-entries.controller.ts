import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import { LinkMapService } from '../link-map/link-map.service';
import * as linkMapSchemas from '../zod-schames/link-map.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';

@Controller('api/v1/link-map-entries')
export class LinkMapEntriesController {
  constructor(
    private readonly linkMapService: LinkMapService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @User('organizationId') organizationId: string,
    @Query(new ZodPipe(linkMapSchemas.ListLinkMapEntriesQuerySchema))
    query: linkMapSchemas.ListLinkMapEntriesQueryDto,
  ) {
    this.logger.log('Link map entries list requested', {
      requestId: this.clsService.getId(),
      organizationId,
      linkMapId: query.linkMapId,
      limit: query.limit,
      hasSearch: Boolean(query.search),
      hasCursor: Boolean(query.startAfterId),
    });

    return this.linkMapService.listEntries(organizationId, query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('Link map entry get requested', {
      requestId: this.clsService.getId(),
      organizationId,
      entryId: id,
    });

    return this.linkMapService.getEntryById(organizationId, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(linkMapSchemas.CreateLinkMapEntrySchema))
    body: linkMapSchemas.CreateLinkMapEntryDto,
  ) {
    this.logger.log('Link map entry create requested', {
      requestId: this.clsService.getId(),
      organizationId,
      linkMapId: body.linkMapId,
    });

    return this.linkMapService.createEntry(organizationId, body);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(linkMapSchemas.UpdateLinkMapEntrySchema))
    body: linkMapSchemas.UpdateLinkMapEntryDto,
  ) {
    this.logger.log('Link map entry update requested', {
      requestId: this.clsService.getId(),
      organizationId,
      entryId: id,
    });

    return this.linkMapService.updateEntry(organizationId, id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('Link map entry delete requested', {
      requestId: this.clsService.getId(),
      organizationId,
      entryId: id,
    });

    return this.linkMapService.deleteEntry(organizationId, id);
  }

  @Delete()
  @UseGuards(AuthGuard)
  async deleteMany(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(linkMapSchemas.DeleteLinkMapEntriesByIdSchema))
    body: linkMapSchemas.DeleteLinkMapEntriesByIdDto,
  ) {
    this.logger.log('Link map entries bulk delete requested', {
      requestId: this.clsService.getId(),
      organizationId,
      linkMapId: body.linkMapId,
      entriesCount: body.entryIds.length,
    });

    return this.linkMapService.deleteEntriesById(organizationId, body);
  }

  @Post('import')
  @UseGuards(AuthGuard)
  async importEntries(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(linkMapSchemas.ImportLinkMapEntriesSchema))
    body: linkMapSchemas.ImportLinkMapEntriesDto,
  ) {
    this.logger.log('Link map entries import requested', {
      requestId: this.clsService.getId(),
      organizationId,
      linkMapId: body.linkMapId,
      entriesCount: body.entries.length,
    });

    return this.linkMapService.importEntries(organizationId, body);
  }

  @Post('import/rollback')
  @UseGuards(AuthGuard)
  async rollbackImport(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(linkMapSchemas.RollbackImportedLinkMapEntriesSchema))
    body: linkMapSchemas.RollbackImportedLinkMapEntriesDto,
  ) {
    this.logger.log('Link map entries import rollback requested', {
      requestId: this.clsService.getId(),
      organizationId,
      linkMapId: body.linkMapId,
      entriesCount: body.entryIds.length,
    });

    return this.linkMapService.rollbackImportedEntries(organizationId, body);
  }
}
