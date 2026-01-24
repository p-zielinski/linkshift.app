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
import { RedirectService } from '../redirect/redirect.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import * as redirectRuleSchemas from '../zod-schames/redirect-rule.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import {
  BadRequestError,
  NotFoundError,
  throwHttpException,
} from '../models/error.model';
import { ClsService } from 'nestjs-cls';

@Controller('api/v1/redirect-rules')
export class RedirectRulesController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly clsService: ClsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @User('organizationId') organizationId: string,
    @Query(new ZodPipe(redirectRuleSchemas.ListRedirectRulesQuerySchema))
    query: redirectRuleSchemas.ListRedirectRulesQueryDto,
  ) {
    const { domainGroupId, ...pagination } = query;

    const result = await this.redirectService.listRules(
      organizationId,
      domainGroupId,
      pagination,
    );

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    try {
      const rule = await this.redirectService.getRuleById(id, organizationId);
      return { success: true, data: rule };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'RedirectRule',
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
    @Body(new ZodPipe(redirectRuleSchemas.CreateRedirectRuleSchema))
    body: redirectRuleSchemas.CreateRedirectRuleDto,
  ) {
    try {
      const result = await this.redirectService.createRule(
        organizationId,
        body,
      );
      return {
        success: true,
        data: result.rule,
      };
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
    @Body(new ZodPipe(redirectRuleSchemas.UpdateRedirectRuleSchema))
    body: redirectRuleSchemas.UpdateRedirectRuleDto,
  ) {
    try {
      const result = await this.redirectService.updateRule(
        id,
        organizationId,
        body,
      );
      return {
        success: true,
        data: result.rule,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'RedirectRule',
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
    try {
      await this.redirectService.deleteRule(id, organizationId);
      return {
        success: true,
        message: 'Redirect rule deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'RedirectRule',
            relatedObjectId: id,
          }),
        );
      }
      throw error;
    }
  }
}
