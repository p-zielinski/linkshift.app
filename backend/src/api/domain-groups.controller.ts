import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RedirectService } from '../redirect/redirect.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import * as domainGroupSchemas from '../zod-schames/domain-group.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import { NotFoundError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';
import { Logger } from 'nestjs-pino';

@Controller('api/v1/domain-groups')
export class DomainGroupsController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {
  }

  @Get()
  @UseGuards(AuthGuard)
  async list(@User('organizationId') organizationId: string) {
    this.logger.log('Domain groups list requested', {
      requestId: this.clsService.getId(),
      organizationId,
    });
    return this.redirectService.listDomainGroups(organizationId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('Domain group get requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: id,
    });
    try {
      return this.redirectService.getDomainGroupById(id, organizationId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'DomainGroup',
            relatedObjectId: id,
          }),
        );
      }
      throw error;
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(domainGroupSchemas.CreateDomainGroupSchema))
    body: domainGroupSchemas.CreateDomainGroupDto,
  ) {
    this.logger.log('Domain group create requested', {
      requestId: this.clsService.getId(),
      organizationId,
    });
    return this.redirectService.createDomainGroup(organizationId, body);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(domainGroupSchemas.UpdateDomainGroupSchema))
    body: domainGroupSchemas.UpdateDomainGroupDto,
  ) {
    this.logger.log('Domain group update requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: id,
    });
    try {
      return this.redirectService.updateDomainGroup(id, organizationId, body);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'DomainGroup',
            relatedObjectId: id,
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
    this.logger.log('Domain group delete requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: id,
    });
    try {
      await this.redirectService.deleteDomainGroup(id, organizationId);
      return;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'DomainGroup',
            relatedObjectId: id,
          }),
        );
      }
      throw error;
    }
  }
}
