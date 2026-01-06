import { Controller, All, Req, Res } from '@nestjs/common';
import express from 'express';
import { RedirectRule, RedirectService } from './redirect.service';

@Controller()
export class AppController {
  constructor(private readonly redirectService: RedirectService) {}

  // Define rules here (or fetch from DB/ConfigService)
  private readonly rules: RedirectRule[] = [
    {
      source: /^\/blog\/(.+)$/,
      destination:
        'https://new-blog.com/posts/$1?from={domain.root:to_upper_case.url_encode}',
    },
    {
      source: '*',
      destination:
        'https://backup-site.com/{path}?v={:random}&sum={query.id:add_10}',
    },
  ];

  @All('*')
  async handleRedirect(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    // Pass rules to the service
    const target = await this.redirectService.getRedirect(req, this.rules);

    console.log(`Redirecting to: ${target}`);

    return res.redirect(302, target ?? 'http://google.com/search?q=404');
  }
}
