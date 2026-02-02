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
import { BadRequestError, NotFoundError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';

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

    return this.redirectService.listRules(
      organizationId,
      domainGroupId,
      pagination,
    );
  }

  @Get('top')
  @UseGuards(AuthGuard)
  async topRules(
    @User('organizationId') organizationId: string,
    @Query('limit') limit?: string,
    @Query('range') range?: string,
  ) {
    const parsedLimit = limit ? Number(limit) : 50;
    return this.redirectService.getTopRules(
      organizationId,
      parsedLimit,
      range ?? 'day',
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    try {
      return this.redirectService.getRuleById(id, organizationId);
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
      return this.redirectService.createRule(organizationId, body);
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

  @Post('simulate')
  @UseGuards(AuthGuard)
  async simulate(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(redirectRuleSchemas.SimulateRedirectsSchema))
    body: redirectRuleSchemas.SimulateRedirectsDto,
  ) {
    return this.redirectService.simulateRedirects(
      organizationId,
      body.entries,
    );
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
      return this.redirectService.updateRule(id, organizationId, body);
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
      return this.redirectService.deleteRule(id, organizationId);
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
