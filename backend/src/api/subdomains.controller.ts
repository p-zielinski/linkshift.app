import {
  Body,
  ConflictException,
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
import { ApiOrUserAuthGuard } from '../auth/api-or-user-auth.guard';
import { User } from '../auth/user.decorator';
import * as subdomainSchemas from '../zod-schames/subdomain.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import { ConflictError, NotFoundError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';
import { Logger } from 'nestjs-pino';

@Controller('api/v1/subdomains')
export class SubdomainsController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @UseGuards(ApiOrUserAuthGuard)
  list(@User('organizationId') organizationId: string) {
    this.logger.log('Subdomains list requested', {
      requestId: this.clsService.getId(),
      organizationId,
    });
    return this.redirectService.listSubdomains(organizationId);
  }

  @Get(':id')
  @UseGuards(ApiOrUserAuthGuard)
  getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('Subdomain get requested', {
      requestId: this.clsService.getId(),
      organizationId,
      subdomainId: id,
    });
    try {
      return this.redirectService.getSubdomainById(id, organizationId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'LinkShiftSubdomain',
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
    @Body(new ZodPipe(subdomainSchemas.CreateSubdomainSchema))
    body: subdomainSchemas.CreateSubdomainDto,
  ) {
    this.logger.log('Subdomain create requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: body.domainGroupId,
    });
    try {
      return this.redirectService.createSubdomain(organizationId, body);
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
    @Body(new ZodPipe(subdomainSchemas.UpdateSubdomainSchema))
    body: subdomainSchemas.UpdateSubdomainDto,
  ) {
    this.logger.log('Subdomain update requested', {
      requestId: this.clsService.getId(),
      organizationId,
      subdomainId: id,
    });
    try {
      return this.redirectService.updateSubdomain(id, organizationId, body);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'LinkShiftSubdomain',
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
    this.logger.log('Subdomain delete requested', {
      requestId: this.clsService.getId(),
      organizationId,
      subdomainId: id,
    });
    try {
      return this.redirectService.deleteSubdomain(id, organizationId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'LinkShiftSubdomain',
            relatedObjectId: id,
          }),
        );
      }
      throw error;
    }
  }
}
