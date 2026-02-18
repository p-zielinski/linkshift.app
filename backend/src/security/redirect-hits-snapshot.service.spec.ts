import { RedirectHitsSnapshotService } from './redirect-hits-snapshot.service';
import { buildHourlyKey } from './redirect-analytics-keys';
import { REDIRECT_HIT_PREFIX_ORG } from './security.constants';

describe('RedirectHitsSnapshotService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should snapshot hourly hits from redis into the database', async () => {
    const key = buildHourlyKey(`${REDIRECT_HIT_PREFIX_ORG}:org-1`, new Date());

    const redisService = {
      scan: jest.fn().mockResolvedValue({ cursor: '0', keys: [key] }),
      zScan: jest
        .fn()
        .mockResolvedValue({
          cursor: '0',
          entries: [{ member: 'rule-1', score: 4 }],
        }),
    };

    const prismaService = {
      $executeRaw: jest.fn().mockResolvedValue(1),
    };

    const logger = {
      error: jest.fn(),
    };

    const service = new RedirectHitsSnapshotService(
      redisService as any,
      prismaService as any,
      logger as any,
    );

    await service.snapshotHourlyHits({
      lookbackHours: 1,
      scanCount: 1000,
      zScanCount: 1000,
      batchSize: 500,
    });

    expect(redisService.scan).toHaveBeenCalledTimes(1);
    expect(redisService.zScan).toHaveBeenCalledTimes(1);
    expect(prismaService.$executeRaw).toHaveBeenCalledTimes(1);
  });
});
