import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { ZodPipe } from '../pipes/zod.pipe';
import { DocsAssistantRateLimitService } from '../docs-assistant/docs-assistant-rate-limit.service';
import { DocsAssistantService } from '../docs-assistant/docs-assistant.service';
import { formatDocsSearchStreamLine } from '../docs-assistant/docs-assistant-stream.model';
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
    @Res({ passthrough: true }) response: Response,
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

    return this.streamSearchInDocs(response, body.question, body.conversationSummary ?? null);
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

  private async streamSearchInDocs(
    response: Response,
    question: string,
    conversationSummary: string | null,
  ): Promise<void> {
    response.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Expires', '0');
    response.setHeader('X-Content-Type-Options', 'nosniff');

    try {
      for await (const event of this.docsAssistantService.processAgentSearchStream(
        question,
        conversationSummary,
      )) {
        response.write(formatDocsSearchStreamLine(event));
      }
    } catch (error) {
      if (!response.headersSent) {
        throw error;
      }

      const details =
        error instanceof Error && error.message.trim()
          ? error.message.trim()
          : "Couldn't get an answer. Try again in a moment";

      this.logger.error('Docs assistant stream failed after headers were sent', {
        requestId: this.clsService.getId(),
        error: error instanceof Error ? error.message : 'unknown_error',
      });

      response.write(formatDocsSearchStreamLine({ type: 'error', details }));
    }

    response.end();
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
