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
              if (key === 'WEB_RISK_API_KEY') return 'test-key';
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
    fetchMock = jest.fn().mockImplementation((input: string) => {
      const url = new URL(input);
      const uri = url.searchParams.get('uri') ?? '';
      const isBad = uri.includes('bad.example.com');
      return Promise.resolve({
        ok: true,
        json: async () =>
          isBad ? { threat: { threatTypes: ['MALWARE'] } } : {},
      });
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch as typeof fetch;
    jest.resetAllMocks();
  });

  it('flags unsafe domains and caches results', async () => {
    const results = await service.checkUrls([
      'bad.example.com',
      'good.example.com',
    ]);

    expect(results.get('bad.example.com')).toBe(false);
    expect(results.get('good.example.com')).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(4);
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

  it('builds candidate urls for Web Risk', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await service.checkUrls(['testsafebrowsing.appspot.com/s/malware.html']);

    const uris = fetchMock.mock.calls.map((call) => {
      const requestUrl = new URL(call[0] as string);
      return requestUrl.searchParams.get('uri');
    });

    expect(uris.sort()).toEqual(
      [
        'https://testsafebrowsing.appspot.com/s/malware.html',
        'http://testsafebrowsing.appspot.com/s/malware.html',
        'https://testsafebrowsing.appspot.com/',
        'http://testsafebrowsing.appspot.com/',
      ].sort(),
    );
  });

  it('deduplicates candidate urls', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const urls = Array.from({ length: 130 }, (_, index) => {
      return `example-${index}.com/path`;
    });
    urls.push('example-0.com/path');

    await service.checkUrls(urls);

    expect(fetchMock).toHaveBeenCalledTimes(520);

    const uniqueUris = new Set(
      fetchMock.mock.calls.map((call) => {
        const requestUrl = new URL(call[0] as string);
        return requestUrl.searchParams.get('uri');
      }),
    );

    expect(uniqueUris.size).toBe(520);
  });
});
