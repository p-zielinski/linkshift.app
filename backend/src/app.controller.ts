import {
  Controller,
  All,
  Req,
  Res,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import express from 'express';
import { RedirectRule, RedirectService } from './redirect.service';
import { RuleValidatorService } from './rule-validator.service';
import { CreateRuleDto } from './create-rule.dto';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly ruleValidator: RuleValidatorService,
    private readonly configService: ConfigService,
  ) {}

  // For reference only
  // private readonly rules: RedirectRule[] = [
  //   {
  //     source: /^\/blog\/(.+)$/,
  //     destination:
  //       'https://new-blog.com/posts/$1?from={domain.root:to_upper_case.url_encode}',
  //   },
  //   {
  //     source: '*',
  //     destination:
  //       'https://backup-site.com/{path}?v={:random}&sum={query.id:add_10}',
  //   },
  // ];

  // @Post('api/v1/users')
  // async createUser(@Req() req: express.Request, @Res() res: express.Response) {
  //   if (req.hostname !== this.configService.get('API_HOSTNAME')) {
  //     await this.redirectService.applyRedirect(req, res);
  //     return;
  //   }
  //   ///zustand request validation, using services, returning data or errors.
  // }

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
