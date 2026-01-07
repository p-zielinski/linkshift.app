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

@Controller()
export class AppController {
  constructor(
    private readonly redirectService: RedirectService,
    private readonly ruleValidator: RuleValidatorService,
  ) {}

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

  @Post('api/rules')
  addRule(@Body() createRuleDto: CreateRuleDto) {
    // 1. Validate incoming data
    const validation = this.ruleValidator.validate(
      createRuleDto.source,
      createRuleDto.destination,
    );

    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }

    // 2. Convert source string to RegExp object if applicable
    let finalSource: string | RegExp = createRuleDto.source;

    // Detect regex format: /pattern/flags
    if (
      typeof createRuleDto.source === 'string' &&
      createRuleDto.source.startsWith('/') &&
      createRuleDto.source.lastIndexOf('/') > 0
    ) {
      const lastSlashIndex = createRuleDto.source.lastIndexOf('/');
      const pattern = createRuleDto.source.substring(1, lastSlashIndex);
      const flags = createRuleDto.source.substring(lastSlashIndex + 1);

      try {
        finalSource = new RegExp(pattern, flags);
      } catch (e) {
        // Fallback or re-throw, though validator should have caught this
        throw new BadRequestException(`Invalid regex format: ${e.message}`);
      }
    }

    // 3. Create and store the rule
    const newRule: RedirectRule = {
      source: finalSource,
      destination: createRuleDto.destination,
    };

    this.rules.push(newRule);

    // Return the created rule (converting RegExp back to string for JSON response)
    return {
      message: 'Rule added successfully',
      rule: {
        ...newRule,
        source: newRule.source.toString(),
      },
      totalRules: this.rules.length,
    };
  }

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
