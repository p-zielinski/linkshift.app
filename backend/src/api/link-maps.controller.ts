import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import { LinkMapService } from '../link-map/link-map.service';
import * as linkMapSchemas from '../zod-schames/link-map.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import { BadRequestError, NotFoundError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';
import { Logger } from 'nestjs-pino';

@Controller('api/v1/link-maps')
export class LinkMapsController {
  constructor(
    private readonly linkMapService: LinkMapService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @User('organizationId') organizationId: string,
    @Query(new ZodPipe(linkMapSchemas.ListLinkMapsQuerySchema))
    query: linkMapSchemas.ListLinkMapsQueryDto,
  ) {
    this.logger.log('Link maps list requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: query.domainGroupId,
    });
    return this.linkMapService.listMaps(organizationId, query.domainGroupId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('Link map get requested', {
      requestId: this.clsService.getId(),
      organizationId,
      linkMapId: id,
    });
    try {
      return this.linkMapService.getMapById(organizationId, id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'LinkMap',
            relatedObjectId: id,
          }),
        );
      }
      throw error;
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(linkMapSchemas.CreateLinkMapSchema))
    body: linkMapSchemas.CreateLinkMapDto,
  ) {
    this.logger.log('Link map create requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: body.domainGroupId,
    });
    try {
      return this.linkMapService.createMap(organizationId, body);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'DomainGroup',
          }),
        );
      }
      if (error instanceof BadRequestException) {
        const response = error.getResponse() as any;
        throwHttpException(
          new BadRequestError({
            requestId: this.clsService.getId(),
            details: response.message || 'Validation failed',
          }),
        );
      }
      throw error;
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(linkMapSchemas.UpdateLinkMapSchema))
    body: linkMapSchemas.UpdateLinkMapDto,
  ) {
    this.logger.log('Link map update requested', {
      requestId: this.clsService.getId(),
      organizationId,
      linkMapId: id,
    });
    try {
      return this.linkMapService.updateMap(id, organizationId, body);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'LinkMap',
            relatedObjectId: id,
          }),
        );
      }
      if (error instanceof BadRequestException) {
        const response = error.getResponse() as any;
        throwHttpException(
          new BadRequestError({
            requestId: this.clsService.getId(),
            details: response.message || 'Validation failed',
          }),
        );
      }
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('Link map delete requested', {
      requestId: this.clsService.getId(),
      organizationId,
      linkMapId: id,
    });
    try {
      return this.linkMapService.deleteMap(id, organizationId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'LinkMap',
            relatedObjectId: id,
          }),
        );
      }
      throw error;
    }
  }

}
