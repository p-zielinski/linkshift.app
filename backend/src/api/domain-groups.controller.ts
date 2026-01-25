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
import { NotFoundError, throwHttpException } from '../models/error.model';
import { ClsService } from 'nestjs-cls';

@Controller('api/v1/domain-groups')
export class DomainGroupsController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly clsService: ClsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(@User('organizationId') organizationId: string) {
    return this.redirectService.listDomainGroups(organizationId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
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
