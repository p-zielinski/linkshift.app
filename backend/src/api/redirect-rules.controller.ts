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
import { ApiOrUserAuthGuard } from '../auth/api-or-user-auth.guard';
import { User } from '../auth/user.decorator';
import * as redirectRuleSchemas from '../zod-schames/redirect-rule.schemas';
import { ZodPipe } from '../pipes/zod.pipe';
import { BadRequestError, NotFoundError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';
import { Logger } from 'nestjs-pino';

@Controller('api/v1/redirect-rules')
export class RedirectRulesController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @UseGuards(ApiOrUserAuthGuard)
  async list(
    @User('organizationId') organizationId: string,
    @Query(new ZodPipe(redirectRuleSchemas.ListRedirectRulesQuerySchema))
    query: redirectRuleSchemas.ListRedirectRulesQueryDto,
  ) {
    this.logger.log('Redirect rules list requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: query.domainGroupId,
    });
    const { domainGroupId, ...pagination } = query;

    return this.redirectService.listRules(
      organizationId,
      domainGroupId,
      pagination,
    );
  }

  @Get('analytics')
  @UseGuards(ApiOrUserAuthGuard)
  async topRules(
    @User('organizationId') organizationId: string,
    @Query(new ZodPipe(redirectRuleSchemas.TopRedirectRulesQuerySchema))
    query?: redirectRuleSchemas.TopRedirectRulesQueryDto,
  ) {
    this.logger.log('Redirect rules analytics requested', {
      requestId: this.clsService.getId(),
      organizationId,
      range: query?.range ?? 'day',
      start: query?.start?.toISOString?.(),
      end: query?.end?.toISOString?.(),
    });

    return this.redirectService.getTopRules(
      organizationId,
      query ?? { limit: 50 },
    );
  }

  @Get(':id')
  @UseGuards(ApiOrUserAuthGuard)
  async getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('Redirect rule get requested', {
      requestId: this.clsService.getId(),
      organizationId,
      ruleId: id,
    });
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
  @UseGuards(ApiOrUserAuthGuard)
  async create(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(redirectRuleSchemas.CreateRedirectRuleSchema))
    body: redirectRuleSchemas.CreateRedirectRuleDto,
  ) {
    this.logger.log('Redirect rule create requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: body.domainGroupId,
    });
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
  @UseGuards(ApiOrUserAuthGuard)
  async simulate(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(redirectRuleSchemas.SimulateRedirectsSchema))
    body: redirectRuleSchemas.SimulateRedirectsDto,
  ) {
    this.logger.log('Redirect rule simulation requested', {
      requestId: this.clsService.getId(),
      organizationId,
      entryCount: body.entries?.length ?? 0,
    });
    return this.redirectService.simulateRedirects(organizationId, body.entries);
  }

  @Put(':id')
  @UseGuards(ApiOrUserAuthGuard)
  async update(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(redirectRuleSchemas.UpdateRedirectRuleSchema))
    body: redirectRuleSchemas.UpdateRedirectRuleDto,
  ) {
    this.logger.log('Redirect rule update requested', {
      requestId: this.clsService.getId(),
      organizationId,
      ruleId: id,
    });
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
  @UseGuards(ApiOrUserAuthGuard)
  async delete(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('Redirect rule delete requested', {
      requestId: this.clsService.getId(),
      organizationId,
      ruleId: id,
    });
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
