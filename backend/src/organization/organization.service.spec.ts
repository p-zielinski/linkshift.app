import { OrganizationService } from './organization.service';
import { PrismaService } from '../prisma.service';
import { CacheManagerService } from '../cache/cache-manager.service';
import { ClsService } from 'nestjs-cls';
import {
  OrganizationConfiguration,
  OrganizationPlan,
  OrganizationStatus,
  OrganizationSubscription,
} from '@shared/models/organization-config.model';
import { Logger } from 'nestjs-pino';

describe('OrganizationService.getEffectiveSubscription', () => {
  let service: OrganizationService;

  beforeEach(() => {
    service = new OrganizationService(
      {} as PrismaService,
      {} as CacheManagerService,
      { getId: jest.fn() } as unknown as ClsService,
      {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        setContext: jest.fn(),
      } as unknown as Logger,
    );
  });

  it('returns suspended subscriptions as-is', () => {
    const config = new OrganizationConfiguration({
      activeSubscription: new OrganizationSubscription({
        plan: OrganizationPlan.PRO,
        status: OrganizationStatus.SUSPENDED,
        activeUntil: new Date(Date.now() - 60_000),
      }),
    });

    const result = service.getEffectiveSubscription(config);

    expect(result.plan).toBe(OrganizationPlan.PRO);
    expect(result.status).toBe(OrganizationStatus.SUSPENDED);
  });

  it('keeps canceled subscriptions active until activeUntil', () => {
    const config = new OrganizationConfiguration({
      activeSubscription: new OrganizationSubscription({
        plan: OrganizationPlan.PRO,
        status: OrganizationStatus.CANCELED,
        activeUntil: new Date(Date.now() + 60_000),
      }),
    });

    const result = service.getEffectiveSubscription(config);

    expect(result.plan).toBe(OrganizationPlan.PRO);
    expect(result.status).toBe(OrganizationStatus.CANCELED);
  });

  it('downgrades canceled subscriptions when activeUntil is missing', () => {
    const config = new OrganizationConfiguration({
      activeSubscription: new OrganizationSubscription({
        plan: OrganizationPlan.PRO,
        status: OrganizationStatus.CANCELED,
        activeUntil: null,
      }),
    });

    const result = service.getEffectiveSubscription(config);

    expect(result.plan).toBe(OrganizationPlan.FREE);
    expect(result.status).toBe(OrganizationStatus.ACTIVE);
  });

  it('downgrades canceled subscriptions once activeUntil is in the past', () => {
    const config = new OrganizationConfiguration({
      activeSubscription: new OrganizationSubscription({
        plan: OrganizationPlan.STARTER,
        status: OrganizationStatus.CANCELED,
        activeUntil: new Date(Date.now() - 60_000),
      }),
    });

    const result = service.getEffectiveSubscription(config);

    expect(result.plan).toBe(OrganizationPlan.FREE);
    expect(result.status).toBe(OrganizationStatus.ACTIVE);
  });

  it('downgrades active subscriptions once activeUntil is in the past', () => {
    const config = new OrganizationConfiguration({
      activeSubscription: new OrganizationSubscription({
        plan: OrganizationPlan.PRO,
        status: OrganizationStatus.ACTIVE,
        activeUntil: new Date(Date.now() - 60_000),
      }),
    });

    const result = service.getEffectiveSubscription(config);

    expect(result.plan).toBe(OrganizationPlan.FREE);
    expect(result.status).toBe(OrganizationStatus.ACTIVE);
  });

  it('keeps active subscriptions without activeUntil', () => {
    const config = new OrganizationConfiguration({
      activeSubscription: new OrganizationSubscription({
        plan: OrganizationPlan.STARTER,
        status: OrganizationStatus.ACTIVE,
        activeUntil: null,
      }),
    });

    const result = service.getEffectiveSubscription(config);

    expect(result.plan).toBe(OrganizationPlan.STARTER);
    expect(result.status).toBe(OrganizationStatus.ACTIVE);
  });
});
