import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { ZodPipe } from '../pipes/zod.pipe';
import { DocsAssistantRateLimitService } from '../docs-assistant/docs-assistant-rate-limit.service';
import { DocsAssistantService } from '../docs-assistant/docs-assistant.service';
import { TurnstileGuard } from '../security/turnstile.guard';
import * as docsAssistantSchemas from '../zod-schemas/docs-assistant.schemas';

@Controller('api/v1/public/docs')
export class DocsAssistantController {
  constructor(
    private readonly docsAssistantService: DocsAssistantService,
    private readonly docsAssistantRateLimitService: DocsAssistantRateLimitService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Post('search')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(ThrottlerGuard, TurnstileGuard)
  async searchInDocs(
    @Req() request: Request,
    @Body(new ZodPipe(docsAssistantSchemas.DocsSearchBodySchema))
    body: docsAssistantSchemas.DocsSearchBodyDto,
  ) {
    const clientIp = this.extractClientIp(request);
    await this.docsAssistantRateLimitService.check(clientIp);

    this.logger.log('Public docs assistant search requested', {
      requestId: this.clsService.getId(),
      clientIp,
      questionLength: body.question.length,
    });

    return this.docsAssistantService.processAgentSearch(body.question);
  }

  @Post('rate')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseGuards(ThrottlerGuard)
  async rateAnswer(
    @Body(new ZodPipe(docsAssistantSchemas.DocsRateBodySchema))
    body: docsAssistantSchemas.DocsRateBodyDto,
  ) {
    return this.docsAssistantService.saveRating(body.logId, body.rating);
  }

  private extractClientIp(request: Request): string | null {
    const value = request.ip?.trim();
    if (value) {
      return value;
    }

    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      const [first] = forwarded.split(',');
      return first?.trim() || null;
    }

    return null;
  }
}
