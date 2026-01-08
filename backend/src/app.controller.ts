import { Controller, All, Req, Res } from '@nestjs/common';
import express from 'express';
import { RedirectService } from './redirect.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly configService: ConfigService,
  ) {}

  @All('*')
  async handleRedirect(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    if (req.hostname === this.configService.get('API_HOSTNAME')) {
      return res
        .send({
          message: `Cannot ${req.method} ${req.url}`,
          error: 'Not Found',
          statusCode: 404,
        })
        .status(404);
    }

    await this.redirectService.applyRedirect(req, res);
  }
}
