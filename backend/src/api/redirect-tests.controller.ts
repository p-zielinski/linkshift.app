import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiOrUserAuthGuard } from '../auth/api-or-user-auth.guard';
import { User } from '../auth/user.decorator';
import { RedirectTestsService } from '../redirect-tests/redirect-tests.service';
import { ZodPipe } from '../pipes/zod.pipe';
import * as testSchemas from '../zod-schames/redirect-test.schemas';
import { BadRequestError, NotFoundError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';
import { Logger } from 'nestjs-pino';

@Controller('api/v1/redirect-tests')
export class RedirectTestsController {
  constructor(
    private readonly redirectTestsService: RedirectTestsService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @UseGuards(ApiOrUserAuthGuard)
  async list(
    @User('organizationId') organizationId: string,
    @Query(new ZodPipe(testSchemas.ListRedirectTestsQuerySchema))
    query: testSchemas.ListRedirectTestsQueryDto,
  ) {
    this.logger.log('Redirect tests list requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: query.domainGroupId,
    });
    const { domainGroupId, ...pagination } = query;
    return this.redirectTestsService.listTests(
      organizationId,
      domainGroupId,
      pagination,
    );
  }

  @Get(':id')
  @UseGuards(ApiOrUserAuthGuard)
  async getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('Redirect test get requested', {
      requestId: this.clsService.getId(),
      organizationId,
      testId: id,
    });
    try {
      return this.redirectTestsService.getTestById(id, organizationId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'RedirectTest',
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
    @Body(new ZodPipe(testSchemas.CreateRedirectTestSchema))
    body: testSchemas.CreateRedirectTestDto,
  ) {
    this.logger.log('Redirect test create requested', {
      requestId: this.clsService.getId(),
      organizationId,
      domainGroupId: body.domainGroupId,
    });
    try {
      return this.redirectTestsService.createTest(organizationId, body);
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
  @UseGuards(ApiOrUserAuthGuard)
  async update(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(testSchemas.UpdateRedirectTestSchema))
    body: testSchemas.UpdateRedirectTestDto,
  ) {
    this.logger.log('Redirect test update requested', {
      requestId: this.clsService.getId(),
      organizationId,
      testId: id,
    });
    try {
      return this.redirectTestsService.updateTest(id, organizationId, body);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'RedirectTest',
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
    this.logger.log('Redirect test delete requested', {
      requestId: this.clsService.getId(),
      organizationId,
      testId: id,
    });
    try {
      await this.redirectTestsService.deleteTest(id, organizationId);
      return;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throwHttpException(
          new NotFoundError({
            requestId: this.clsService.getId(),
            details: error.message,
            relatedObject: 'RedirectTest',
            relatedObjectId: id,
          }),
        );
      }
      throw error;
    }
  }
}
