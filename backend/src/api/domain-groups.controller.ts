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
    const domainGroups =
      await this.redirectService.listDomainGroups(organizationId);

    return {
      success: true,
      data: domainGroups,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    try {
      const domainGroup = await this.redirectService.getDomainGroupById(
        id,
        organizationId,
      );
      return { success: true, data: domainGroup };
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
  async create(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(domainGroupSchemas.CreateDomainGroupSchema))
    body: domainGroupSchemas.CreateDomainGroupDto,
  ) {
    const domainGroup = await this.redirectService.createDomainGroup(
      organizationId,
      body,
    );

    return {
      success: true,
      data: domainGroup,
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(domainGroupSchemas.UpdateDomainGroupSchema))
    body: domainGroupSchemas.UpdateDomainGroupDto,
  ) {
    try {
      const domainGroup = await this.redirectService.updateDomainGroup(
        id,
        organizationId,
        body,
      );
      return { success: true, data: domainGroup };
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
      return {
        success: true,
        message: 'Domain group deleted successfully',
      };
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
