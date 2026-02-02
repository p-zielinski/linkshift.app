import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { PrismaService } from '../prisma.service';
import { DomainExtractorService } from './domain-extractor.service';
import { SafetyScannerService } from './safety-scanner.service';
import { DomainBlacklistService } from './domain-blacklist.service';
import { SAFETY_RESCAN_QUEUE } from './security.constants';

type RescanJob = { ruleId: string; hits?: number };

@Injectable()
@Processor(SAFETY_RESCAN_QUEUE)
export class SafetyRescanProcessor {
  private readonly logger = new Logger(SafetyRescanProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly domainExtractor: DomainExtractorService,
    private readonly safetyScannerService: SafetyScannerService,
    private readonly domainBlacklistService: DomainBlacklistService,
  ) {}

  @Process('rescan')
  async handleRescan(job: Job<RescanJob>): Promise<void> {
    const rule = await this.prisma.redirectRule.findFirst({
      where: {
        id: job.data.ruleId,
        deletedAt: null,
        isBlocked: false,
      },
      select: { id: true, destination: true, domainGroupId: true },
    });

    if (!rule) {
      return;
    }

    const domains = this.domainExtractor.extractDomains(rule.destination);
    if (domains.length === 0) {
      this.logger.debug(
        JSON.stringify({
          event: 'safety_rescan_no_domains',
          ruleId: rule.id,
        }),
      );
      return;
    }

    let results: Map<string, boolean>;
    try {
      results = await this.safetyScannerService.checkDomains(domains);
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          event: 'safety_rescan_failed',
          ruleId: rule.id,
          error: error instanceof Error ? error.message : 'unknown_error',
        }),
      );
      throw error;
    }
    const unsafeDomains = domains.filter(
      (domain) => results.get(domain) === false,
    );

    if (unsafeDomains.length === 0) {
      return;
    }

    await this.prisma.redirectRule.update({
      where: { id: rule.id },
      data: {
        isBlocked: true,
        blockedAt: new Date(),
      },
    });

    await this.domainBlacklistService.addDomains(unsafeDomains);

    this.logger.error(
      JSON.stringify({
        event: 'security_alert_rule_blocked',
        ruleId: rule.id,
        domainGroupId: rule.domainGroupId,
        unsafeDomains,
        hits: job.data.hits ?? null,
      }),
    );
  }
}
