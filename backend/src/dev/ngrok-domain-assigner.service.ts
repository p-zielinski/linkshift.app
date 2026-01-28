import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CacheManagerService, DataType } from '../cache/cache-manager.service';
import { AppEntity, createCustomCuid } from '../utils';
import type { Domain, DomainGroup, Organization } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NgrokDomainAssignerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(NgrokDomainAssignerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheManager: CacheManagerService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.assignNgrokDomain();
  }

  async assignNgrokDomain(): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const hostname = this.extractHostname(
      this.configService.get<string>('NGROK_URL'),
    );
    if (!hostname) {
      this.logger.warn(
        'NGROK_URL is invalid. Provide a full URL like https://xxxx.ngrok.app.',
      );
      return;
    }

    const organization = await this.resolveOrganization();
    if (!organization) {
      this.logger.warn(
        'Dev ngrok assignment skipped. Set DEV_NGROK_ORG_ID or DEV_NGROK_ORG_EMAIL to target an organization.',
      );
      return;
    }

    await this.purgeNgrokDomains(organization.id);

    const domainGroup = await this.resolveDomainGroup(organization.id);
    if (!domainGroup) {
      this.logger.warn(
        `No domain group found for organization ${organization.id}. Create one or set DEV_NGROK_DOMAIN_GROUP_ID.`,
      );
      return;
    }

    const existing = await this.prisma.domain.findFirst({
      where: { name: hostname },
    });

    if (existing && existing.deletedAt === null) {
      if (existing.domainGroupId === domainGroup.id) {
        this.logger.log(
          `Ngrok domain already assigned: ${hostname} -> ${domainGroup.id}`,
        );
        return;
      }

      const sameOrg = await this.isDomainInOrganization(
        existing,
        organization.id,
      );
      if (!sameOrg) {
        this.logger.warn(
          `Ngrok domain ${hostname} already belongs to another organization.`,
        );
        return;
      }

      const updated = await this.prisma.domain.update({
        where: { id: existing.id },
        data: { domainGroupId: domainGroup.id, deletedAt: null },
      });

      await this.afterDomainChange(hostname, updated);
      this.logger.log(
        `Ngrok domain reassigned: ${hostname} -> ${domainGroup.id}`,
      );
      return;
    }

    const created = await this.prisma.domain.create({
      data: {
        id: createCustomCuid(AppEntity.Domain),
        name: hostname,
        domainGroupId: domainGroup.id,
      },
    });

    await this.afterDomainChange(hostname, created);
    this.logger.log(
      `Ngrok domain assigned: ${hostname} -> ${domainGroup.id}`,
    );
  }

  private isEnabled(): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';
    return (
      nodeEnv !== 'production' &&
      !!this.configService.get<string>('NGROK_URL')
    );
  }

  private extractHostname(url: string | undefined): string | null {
    if (!url) {
      return null;
    }
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }

  private async resolveOrganization(): Promise<Organization | null> {
    const orgId = this.configService.get<string>('DEV_NGROK_ORG_ID');
    if (orgId) {
      return this.prisma.organization.findUnique({ where: { id: orgId } });
    }

    const email = this.configService.get<string>('DEV_NGROK_ORG_EMAIL');
    if (!email) {
      return null;
    }

    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { organization: true },
    });
    return user?.organization ?? null;
  }

  private async resolveDomainGroup(
    organizationId: string,
  ): Promise<DomainGroup | null> {
    const groupId = this.configService.get<string>(
      'DEV_NGROK_DOMAIN_GROUP_ID',
    );
    if (groupId) {
      return this.prisma.domainGroup.findFirst({
        where: { id: groupId, organizationId, deletedAt: null },
      });
    }

    return this.prisma.domainGroup.findFirst({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async purgeNgrokDomains(organizationId: string): Promise<void> {
    const domains = await this.prisma.domain.findMany({
      where: {
        deletedAt: null,
        name: { contains: 'ngrok', mode: 'insensitive' },
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (domains.length === 0) {
      return;
    }

    const deletedAt = new Date();
    for (const domain of domains) {
      const updated = await this.prisma.domain.update({
        where: { id: domain.id },
        data: { deletedAt },
      });

      await this.afterDomainChange(domain.name, updated);
    }

    this.logger.log(
      `Removed ${domains.length} previous ngrok domain(s) for organization ${organizationId}.`,
    );
  }

  private async isDomainInOrganization(
    domain: Domain,
    organizationId: string,
  ): Promise<boolean> {
    const group = await this.prisma.domainGroup.findFirst({
      where: { id: domain.domainGroupId, organizationId },
    });
    return !!group;
  }

  private async afterDomainChange(
    hostname: string,
    domain: Domain,
  ): Promise<void> {
    await this.cacheManager.invalidateRedirectContext(hostname);
    await this.cacheManager.setDataExist({
      dataType: DataType.DOMAINS,
      data: domain,
    });
  }
}
