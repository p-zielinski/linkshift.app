import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { ZodPipe } from '../pipes/zod.pipe';
import * as redirectTraceSchemas from '../zod-schemas/redirect-trace.schemas';
import { RedirectTraceRateLimitService } from '../redirect-trace/redirect-trace-rate-limit.service';
import { RedirectTraceService } from '../redirect-trace/redirect-trace.service';
import { extractClientIp } from '../utils/client-ip.util';

@Controller()
export class TraceController {
  constructor(
    private readonly redirectTraceService: RedirectTraceService,
    private readonly redirectTraceRateLimitService: RedirectTraceRateLimitService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Get('trace')
  async traceRedirectStep(
    @Req() request: Request,
    @Res() response: Response,
    @Query(new ZodPipe(redirectTraceSchemas.RedirectTraceQuerySchema))
    query: redirectTraceSchemas.RedirectTraceQueryDto,
  ) {
    const clientIp = extractClientIp(request);
    await this.redirectTraceRateLimitService.check(clientIp);

    this.logger.log('Public redirect trace step requested (root route)', {
      requestId: this.clsService.getId(),
      clientIp,
      url: query.url,
      userAgent: query.userAgent,
    });

    const step = await this.redirectTraceService.traceStep(query.url, query.userAgent);

    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Expires', '0');

    response.json(step);
  }
}
