import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import { ZodPipe } from '../pipes/zod.pipe';
import { ApiKeyService } from '../api-key/api-key.service';
import * as apiKeySchemas from '../zod-schames/api-key.schemas';

@Controller('api/v1/api-keys')
export class ApiKeysController {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(@User('organizationId') organizationId: string) {
    this.logger.log('API keys list requested', {
      requestId: this.clsService.getId(),
      organizationId,
    });

    return this.apiKeyService.listForOrganization(organizationId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(apiKeySchemas.CreateApiKeySchema))
    body: apiKeySchemas.CreateApiKeyDto,
  ) {
    this.logger.log('API key create requested', {
      requestId: this.clsService.getId(),
      organizationId,
      hasExpiration: body.expiresAt !== null && body.expiresAt !== undefined,
    });

    return this.apiKeyService.create(organizationId, body);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getById(
    @Param(new ZodPipe(apiKeySchemas.ApiKeyIdParamSchema))
    params: { id: string },
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('API key details requested', {
      requestId: this.clsService.getId(),
      organizationId,
      apiKeyId: params.id,
    });

    return this.apiKeyService.getById(params.id, organizationId);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param(new ZodPipe(apiKeySchemas.ApiKeyIdParamSchema))
    params: { id: string },
    @User('organizationId') organizationId: string,
    @Body(new ZodPipe(apiKeySchemas.UpdateApiKeySchema))
    body: apiKeySchemas.UpdateApiKeyDto,
  ) {
    this.logger.log('API key update requested', {
      requestId: this.clsService.getId(),
      organizationId,
      apiKeyId: params.id,
      updatingExpiration: body.expiresAt !== undefined,
    });

    return this.apiKeyService.update(params.id, organizationId, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(
    @Param(new ZodPipe(apiKeySchemas.ApiKeyIdParamSchema))
    params: { id: string },
    @User('organizationId') organizationId: string,
  ) {
    this.logger.log('API key delete requested', {
      requestId: this.clsService.getId(),
      organizationId,
      apiKeyId: params.id,
    });

    await this.apiKeyService.delete(params.id, organizationId);
    return;
  }
}
