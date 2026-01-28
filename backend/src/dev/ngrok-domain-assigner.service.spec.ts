import { NgrokDomainAssignerService } from './ngrok-domain-assigner.service';
import { PrismaService } from '../prisma.service';
import { CacheManagerService, DataType } from '../cache/cache-manager.service';
import type { Domain, DomainGroup, Organization } from '@prisma/client';

describe('NgrokDomainAssignerService', () => {
  const originalEnv = process.env;
  let prisma: PrismaService;
  let cacheManager: CacheManagerService;
  let service: NgrokDomainAssignerService;

  const organization = {
    id: 'org_1',
    name: 'Acme',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    configuration: null,
  } as Organization;

  const domainGroup = {
    id: 'dmg_1',
    name: 'Primary',
    organizationId: organization.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as DomainGroup;

  const otherGroup = {
    id: 'dmg_2',
    name: 'Secondary',
    organizationId: organization.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as DomainGroup;

  const buildPrisma = () =>
    ({
      organization: { findUnique: jest.fn() },
      user: { findFirst: jest.fn() },
      domainGroup: { findFirst: jest.fn() },
      domain: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    }) as unknown as PrismaService;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development',
      NGROK_URL: 'https://dev.ngrok.app',
      DEV_NGROK_ORG_ID: organization.id,
    };

    prisma = buildPrisma();
    (prisma.domain.findMany as jest.Mock).mockResolvedValue([]);
    cacheManager = {
      invalidateRedirectContext: jest.fn(),
      setDataExist: jest.fn(),
    } as unknown as CacheManagerService;

    service = new NgrokDomainAssignerService(prisma, cacheManager);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('skips when ngrok assignment is disabled', async () => {
    process.env.NGROK_URL = '';

    await service.assignNgrokDomain();

    expect(prisma.organization.findUnique).not.toHaveBeenCalled();
  });

  it('warns when ngrok URL is invalid', async () => {
    process.env.NGROK_URL = 'not-a-url';
    const warnSpy = jest
      .spyOn((service as any).logger, 'warn')
      .mockImplementation(() => undefined);

    await service.assignNgrokDomain();

    expect(warnSpy).toHaveBeenCalledWith(
      'NGROK_URL is invalid. Provide a full URL like https://xxxx.ngrok.app.',
    );
  });

  it('creates a new domain when none exists', async () => {
    const created = {
      id: 'dom_1',
      name: 'dev.ngrok.app',
      domainGroupId: domainGroup.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as Domain;

    (prisma.organization.findUnique as jest.Mock).mockResolvedValue(
      organization,
    );
    (prisma.domainGroup.findFirst as jest.Mock).mockResolvedValue(domainGroup);
    (prisma.domain.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.domain.create as jest.Mock).mockResolvedValue(created);

    await service.assignNgrokDomain();

    expect(prisma.domain.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'dev.ngrok.app',
          domainGroupId: domainGroup.id,
        }),
      }),
    );
    expect(cacheManager.invalidateRedirectContext).toHaveBeenCalledWith(
      'dev.ngrok.app',
    );
    expect(cacheManager.setDataExist).toHaveBeenCalledWith({
      dataType: DataType.DOMAINS,
      data: created,
    });
  });

  it('purges previous ngrok domains for the organization', async () => {
    const oldDomain = {
      id: 'dom_old',
      name: 'old.ngrok.app',
      domainGroupId: domainGroup.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as Domain;
    const deletedDomain = {
      ...oldDomain,
      deletedAt: new Date(),
    } as Domain;
    const created = {
      id: 'dom_new',
      name: 'dev.ngrok.app',
      domainGroupId: domainGroup.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as Domain;

    (prisma.organization.findUnique as jest.Mock).mockResolvedValue(
      organization,
    );
    (prisma.domainGroup.findFirst as jest.Mock).mockResolvedValue(domainGroup);
    (prisma.domain.findMany as jest.Mock).mockResolvedValue([oldDomain]);
    (prisma.domain.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.domain.update as jest.Mock).mockResolvedValue(deletedDomain);
    (prisma.domain.create as jest.Mock).mockResolvedValue(created);

    await service.assignNgrokDomain();

    expect(prisma.domain.update).toHaveBeenCalledWith({
      where: { id: oldDomain.id },
      data: { deletedAt: expect.any(Date) },
    });
    expect(cacheManager.invalidateRedirectContext).toHaveBeenCalledWith(
      oldDomain.name,
    );
    expect(cacheManager.setDataExist).toHaveBeenCalledWith({
      dataType: DataType.DOMAINS,
      data: deletedDomain,
    });
  });

  it('reassigns an existing domain within the same organization', async () => {
    const existing = {
      id: 'dom_2',
      name: 'dev.ngrok.app',
      domainGroupId: otherGroup.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as Domain;
    const updated = { ...existing, domainGroupId: domainGroup.id } as Domain;

    (prisma.organization.findUnique as jest.Mock).mockResolvedValue(
      organization,
    );
    (prisma.domainGroup.findFirst as jest.Mock)
      .mockResolvedValueOnce(domainGroup)
      .mockResolvedValueOnce(otherGroup);
    (prisma.domain.findFirst as jest.Mock).mockResolvedValue(existing);
    (prisma.domain.update as jest.Mock).mockResolvedValue(updated);

    await service.assignNgrokDomain();

    expect(prisma.domain.update).toHaveBeenCalledWith({
      where: { id: existing.id },
      data: { domainGroupId: domainGroup.id, deletedAt: null },
    });
    expect(cacheManager.invalidateRedirectContext).toHaveBeenCalledWith(
      'dev.ngrok.app',
    );
    expect(cacheManager.setDataExist).toHaveBeenCalledWith({
      dataType: DataType.DOMAINS,
      data: updated,
    });
  });

  it('skips reassignment when the domain belongs to another organization', async () => {
    const existing = {
      id: 'dom_3',
      name: 'dev.ngrok.app',
      domainGroupId: 'dmg_other',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as Domain;

    (prisma.organization.findUnique as jest.Mock).mockResolvedValue(
      organization,
    );
    (prisma.domainGroup.findFirst as jest.Mock)
      .mockResolvedValueOnce(domainGroup)
      .mockResolvedValueOnce(null);
    (prisma.domain.findFirst as jest.Mock).mockResolvedValue(existing);

    await service.assignNgrokDomain();

    expect(prisma.domain.update).not.toHaveBeenCalled();
    expect(prisma.domain.create).not.toHaveBeenCalled();
    expect(cacheManager.invalidateRedirectContext).not.toHaveBeenCalled();
  });
});
