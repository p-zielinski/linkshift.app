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
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import * as domainSchemas from '../zod-schames/domain.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import {
  ConflictError,
  NotFoundError,
  throwHttpException,
} from '../models/error.model';
import { ClsService } from 'nestjs-cls';

@Controller('api/v1/domains')
export class DomainsController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly clsService: ClsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(@User('organizationId') organizationId: string) {
    const domains = await this.redirectService.listDomains(organizationId);

    return {
      success: true,
      data: domains,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    try {
      const domain = await this.redirectService.getDomainById(
        id,
        organizationId,
      );
      return { success: true, data: domain };
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
  @UseGuards(AuthGuard)
  async create(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(domainSchemas.CreateDomainSchema))
    body: domainSchemas.CreateDomainDto,
  ) {
    try {
      const domain = await this.redirectService.createDomain(
        organizationId,
        body,
      );
      return { success: true, data: domain };
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
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(domainSchemas.UpdateDomainSchema))
    body: domainSchemas.UpdateDomainDto,
  ) {
    try {
      const domain = await this.redirectService.updateDomain(
        id,
        organizationId,
        body,
      );
      return { success: true, data: domain };
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
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    try {
      await this.redirectService.deleteDomain(id, organizationId);
      return {
        success: true,
        message: 'Domain deleted successfully',
      };
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
