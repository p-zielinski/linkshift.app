import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { ZodPipe } from '../pipes/zod.pipe';
import * as qrCodeSchemas from '../zod-schames/qr-code.schemas';
import { QrCodeRateLimitService } from '../qr-code/qr-code-rate-limit.service';
import { QrCodeService } from '../qr-code/qr-code.service';

@Controller('api/v1/public')
export class PublicToolsController {
  constructor(
    private readonly qrCodeService: QrCodeService,
    private readonly qrCodeRateLimitService: QrCodeRateLimitService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  @Get('qr-code')
  async generateQrCode(
    @Req() request: Request,
    @Res() response: Response,
    @Query(new ZodPipe(qrCodeSchemas.GenerateQrCodeQuerySchema))
    query: qrCodeSchemas.GenerateQrCodeQueryDto,
  ) {
    const clientIp = this.extractClientIp(request);
    await this.qrCodeRateLimitService.check(clientIp);

    this.logger.log('Public QR code generation requested', {
      requestId: this.clsService.getId(),
      clientIp,
      format: query.format,
      size: query.size,
    });

    const generated = await this.qrCodeService.generate(
      query.url,
      query.format,
      query.size,
    );

    response.setHeader('Content-Type', generated.contentType);
    response.setHeader('Cache-Control', 'public, max-age=300');

    if (query.download) {
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="linkshift-qr-code.${generated.extension}"`,
      );
    }

    response.send(generated.payload);
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
