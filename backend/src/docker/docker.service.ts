import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { Logger } from 'nestjs-pino';
import Docker from 'dockerode';

@Injectable()
export class DockerService implements OnModuleInit {
  private readonly docker: Docker;
  private updateInProgress = false;
  private updateQueued = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    const socketPath =
      this.configService.get<string>('DOCKER_SOCKET_PATH') ??
      '/var/run/docker.sock';
    this.docker = new Docker({ socketPath });
  }

  onModuleInit(): void {
    void this.updateTraefikAppHostRule('startup');
  }

  async updateTraefikAppHostRule(reason: string): Promise<void> {
    if (!this.isEnabled()) {
      this.logger.debug('Traefik update skipped', { reason });
      return;
    }

    if (this.updateInProgress) {
      this.updateQueued = true;
      this.logger.debug('Traefik update queued', { reason });
      return;
    }

    this.updateInProgress = true;
    try {
      const serviceName = this.configService.get<string>(
        'TRAEFIK_TARGET_SERVICE',
      );
      if (!serviceName) {
        this.logger.warn('Traefik target service is not configured', { reason });
        return;
      }

      const ruleLabel =
        this.configService.get<string>('TRAEFIK_ROUTER_RULE_LABEL') ??
        'traefik.http.routers.backend.rule';
      const baseHosts = this.parseHosts(
        this.configService.get<string>('TRAEFIK_BASE_HOSTS') ??
          this.configService.get<string>('API_HOSTNAME') ??
          '',
      );

      const domains = await this.prisma.domain.findMany({
        where: {
          deletedAt: null,
          domainGroup: { deletedAt: null },
        },
        select: { name: true },
      });

      const hostSet = new Set<string>(baseHosts);
      for (const domain of domains) {
        if (domain.name) {
          hostSet.add(domain.name.trim());
        }
      }

      if (hostSet.size === 0) {
        this.logger.warn('No hosts available for Traefik rule update', {
          reason,
        });
        return;
      }

      const hostRule = Array.from(hostSet)
        .filter(Boolean)
        .sort()
        .map((host) => `Host(\`${host}\`)`)
        .join(' || ');

      const services = await this.docker.listServices();
      const service = services.find(
        (entry) => entry.Spec?.Name === serviceName,
      );

      if (!service?.Spec?.Labels) {
        this.logger.warn('Traefik service not found or missing labels', {
          reason,
          serviceName,
        });
        return;
      }

      const currentRule = service.Spec.Labels[ruleLabel];
      if (currentRule === hostRule) {
        this.logger.debug('Traefik host rule unchanged', {
          serviceName,
          domains: hostSet.size,
        });
        return;
      }

      const updatedLabels = {
        ...service.Spec.Labels,
        [ruleLabel]: hostRule,
      };

      const updateConfig = {
        ...service.Spec,
        Labels: updatedLabels,
        version: service.Version?.Index ?? 0,
      };

      await this.docker.getService(serviceName).update(updateConfig);

      this.logger.log('Traefik host rule updated', {
        serviceName,
        domains: hostSet.size,
      });
    } catch (error) {
      this.logger.warn('Traefik host rule update failed', {
        reason,
        error: error instanceof Error ? error.message : 'unknown_error',
      });
    } finally {
      this.updateInProgress = false;
      if (this.updateQueued) {
        this.updateQueued = false;
        void this.updateTraefikAppHostRule('queued');
      }
    }
  }

  private isEnabled(): boolean {
    const enabled =
      (this.configService.get<string>('TRAEFIK_UPDATE_ENABLED') ?? 'false') ===
      'true';
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';
    if (!enabled) {
      return false;
    }
    return nodeEnv === 'production';
  }

  private parseHosts(value: string): string[] {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
}
