import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SafetyScannerService } from './safety-scanner.service';
import { RedisService } from '../redis/redis.service';
import { SAFETY_L2_TTL_SECONDS } from './security.constants';
import { Logger } from 'nestjs-pino';

describe('SafetyScannerService', () => {
  let service: SafetyScannerService;
  let redisService: { get: jest.Mock; set: jest.Mock };
  let fetchMock: jest.Mock;
  let originalFetch: typeof fetch | undefined;

  beforeEach(async () => {
    redisService = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        SafetyScannerService,
        {
          provide: RedisService,
          useValue: redisService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SAFE_BROWSING_API_KEY') return 'test-key';
              if (key === 'SAFE_BROWSING_CLIENT_ID') return 'test-client';
              if (key === 'SAFE_BROWSING_CLIENT_VERSION') return '1.2.3';
              return undefined;
            }),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            setContext: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(SafetyScannerService);

    originalFetch = global.fetch;
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        matches: [{ threat: { url: 'https://bad.example.com/phish' } }],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch as typeof fetch;
    jest.resetAllMocks();
  });

  it('flags unsafe domains and caches results', async () => {
    const results = await service.checkDomains([
      'bad.example.com',
      'good.example.com',
    ]);

    expect(results.get('bad.example.com')).toBe(false);
    expect(results.get('good.example.com')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(redisService.set).toHaveBeenCalledWith(
      'safety:domain:bad.example.com',
      false,
      SAFETY_L2_TTL_SECONDS,
    );
    expect(redisService.set).toHaveBeenCalledWith(
      'safety:domain:good.example.com',
      true,
      SAFETY_L2_TTL_SECONDS,
    );
  });
});
