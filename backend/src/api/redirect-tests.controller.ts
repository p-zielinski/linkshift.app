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
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import { RedirectTestsService } from '../redirect-tests/redirect-tests.service';
import { ZodPipe } from '../pipes/zod.pipe';
import * as testSchemas from '../zod-schames/redirect-test.schemas';
import { BadRequestError, NotFoundError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { throwHttpException } from '../utils';

@Controller('api/v1/redirect-tests')
export class RedirectTestsController {
  constructor(
    private readonly redirectTestsService: RedirectTestsService,
    private readonly clsService: ClsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(
    @User('organizationId') organizationId: string,
    @Query(new ZodPipe(testSchemas.ListRedirectTestsQuerySchema))
    query: testSchemas.ListRedirectTestsQueryDto,
  ) {
    const { domainGroupId, ...pagination } = query;
    return this.redirectTestsService.listTests(
      organizationId,
      domainGroupId,
      pagination,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
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
  @UseGuards(AuthGuard)
  async create(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(testSchemas.CreateRedirectTestSchema))
    body: testSchemas.CreateRedirectTestDto,
  ) {
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
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(testSchemas.UpdateRedirectTestSchema))
    body: testSchemas.UpdateRedirectTestDto,
  ) {
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
  @UseGuards(AuthGuard)
  async delete(
    @Param('id') id: string,
    @User('organizationId') organizationId: string,
  ) {
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
