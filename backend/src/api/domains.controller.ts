import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RedirectService } from '../redirect/redirect.service';
import { ApiOrUserAuthGuard } from '../auth/api-or-user-auth.guard';
import { User } from '../auth/user.decorator';
import * as domainSchemas from '../zod-schames/domain.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import { ConflictError, NotFoundError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';
import { Logger } from 'nestjs-pino';

@Controller('api/v1/domains')
export class DomainsController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @UseGuards(ApiOrUserAuthGuard)
  list(@User('organizationId') organizationId: string) {
    this.logger.log('Domains list requested', {
      requestId: this.clsService.getId(),
      organizationId,
    });
    return this.redirectService.listDomains(organizationId);
  }

  @Get(':id')
  @UseGuards(ApiOrUserAuthGuard)
  getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('Domain get requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainId: id,
    });
    try {
      return this.redirectService.getDomainById(id, organizationId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'Domain',
            relatedObjectId: id,
          }),
        );
      }
      throw error;
    }
  }

  @Post()
  @UseGuards(ApiOrUserAuthGuard)
  create(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(domainSchemas.CreateDomainSchema))
    body: domainSchemas.CreateDomainDto,
  ) {
    this.logger.log('Domain create requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: body.domainGroupId,
    });
    try {
      return this.redirectService.createDomain(organizationId, body);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'DomainGroup', // Usually fails due to domain group not found
          }),
        );
      }
      if (error instanceof ConflictException) {
        throwHttpException(
          new ConflictError({
            requestId: this.clsService.getId(),
            details: error.message,
          }),
        );
      }
      throw error;
    }
  }

  @Put(':id')
  @UseGuards(ApiOrUserAuthGuard)
  update(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(domainSchemas.UpdateDomainSchema))
    body: domainSchemas.UpdateDomainDto,
  ) {
    this.logger.log('Domain update requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainId: id,
    });
    try {
      return this.redirectService.updateDomain(id, organizationId, body);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'Domain',
            relatedObjectId: id,
          }),
        );
      }
      if (error instanceof ConflictException) {
        throwHttpException(
          new ConflictError({
            requestId: this.clsService.getId(),
            details: error.message,
          }),
        );
      }
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(ApiOrUserAuthGuard)
  async delete(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('Domain delete requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainId: id,
    });
    try {
      return this.redirectService.deleteDomain(id, organizationId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'Domain',
            relatedObjectId: id,
          }),
        );
      }
      throw error;
    }
  }
}
