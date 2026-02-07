import { Injectable } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { PrismaService } from '../prisma.service';
import { DomainExtractorService } from './domain-extractor.service';
import { SafetyScannerService } from './safety-scanner.service';
import { DomainBlacklistService } from './domain-blacklist.service';
import { SAFETY_RESCAN_QUEUE } from './security.constants';
import { EmailService } from '../email/email.service';
import { Logger } from 'nestjs-pino';

type RescanJob = { ruleId: string; hits?: number };

@Injectable()
@Processor(SAFETY_RESCAN_QUEUE)
export class SafetyRescanProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly domainExtractor: DomainExtractorService,
    private readonly safetyScannerService: SafetyScannerService,
    private readonly domainBlacklistService: DomainBlacklistService,
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}

  @Process('rescan')
  async handleRescan(job: Job<RescanJob>): Promise<void> {
    const rule = await this.prisma.redirectRule.findFirst({
      where: {
        id: job.data.ruleId,
        deletedAt: null,
        isBlocked: false,
      },
      select: {
        id: true,
        destination: true,
        domainGroupId: true,
        domainGroup: {
          select: {
            organizationId: true,
            organization: { select: { name: true } },
          },
        },
      },
    });

    if (!rule) {
      return;
    }

    const domains = this.domainExtractor.extractUrls(rule.destination);
    if (domains.length === 0) {
      this.logger.debug('Safety rescan skipped (no domains)', {
        ruleId: rule.id,
      });
      return;
    }

    let results: Map<string, boolean>;
    try {
      results = await this.safetyScannerService.checkDomains(domains);
    } catch (error) {
      this.logger.error('Safety rescan failed', {
        ruleId: rule.id,
        error: error instanceof Error ? error.message : 'unknown_error',
      });
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

    const owner = await this.prisma.user.findFirst({
      where: {
        organizationId: rule.domainGroup.organizationId,
        isOwner: true,
        deletedAt: null,
      },
      select: { email: true },
    });

    if (owner?.email) {
      try {
        await this.emailService.sendRedirectRuleBlockedAlert({
          email: owner.email,
          organization: rule.domainGroup.organization?.name ?? 'Organization',
          ruleId: rule.id,
          destination: rule.destination,
          unsafeDomains,
          detectedAt: new Date(),
        });
      } catch (error) {
        this.logger.error('Security alert email failed', {
          ruleId: rule.id,
          organizationId: rule.domainGroup.organizationId,
          error: error instanceof Error ? error.message : 'unknown_error',
        });
      }
    } else {
      this.logger.warn('Security alert owner missing', {
        ruleId: rule.id,
        organizationId: rule.domainGroup.organizationId,
      });
    }

    this.logger.warn('Security alert rule blocked', {
      ruleId: rule.id,
      domainGroupId: rule.domainGroupId,
      unsafeDomains,
      hits: job.data.hits ?? null,
    });
  }
}
