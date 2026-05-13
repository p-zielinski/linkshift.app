import { ExecutionContext } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { ApiOrUserAuthGuard } from './api-or-user-auth.guard';
import { JwtService } from './jwt.service';
import {
  CacheManagerService,
  CachedByProperty,
  DataType,
} from '../cache/cache-manager.service';
import { LegalService } from '../legal/legal.service';
import { ApiKeyService } from '../api-key/api-key.service';

describe('ApiOrUserAuthGuard', () => {
  const jwtService = {
    verifyToken: jest.fn(),
  } as unknown as JwtService;

  const cacheManagerService = {
    getData: jest.fn(),
  } as unknown as CacheManagerService;

  const legalService = {
    isConsentUpToDate: jest.fn().mockReturnValue(true),
  } as unknown as LegalService;

  const apiKeyService = {
    authenticate: jest.fn(),
  } as unknown as ApiKeyService;

  const clsService = {
    getId: jest.fn().mockReturnValue('req_1'),
  } as unknown as ClsService;

  const logger = {
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const createContext = (request: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('authenticates using API key context when x-api-key is provided', async () => {
    const guard = new ApiOrUserAuthGuard(
      jwtService,
      clsService,
      cacheManagerService,
      legalService,
      apiKeyService,
      logger,
    );

    const request = {
      headers: {
        'x-api-key': 'lsk_live_example',
      },
      header: (name: string) =>
        name.toLowerCase() === 'x-api-key' ? 'lsk_live_example' : undefined,
      path: '/api/v1/domains',
      url: '/api/v1/domains',
    } as any;

    (apiKeyService.authenticate as jest.Mock).mockResolvedValue({
      organizationId: 'org_1',
      apiKeyId: 'apk_1',
    });

    const result = await guard.canActivate(createContext(request));

    expect(result).toBe(true);
    expect(request.user).toEqual({
      authType: 'api_key',
      organizationId: 'org_1',
      apiKeyId: 'apk_1',
    });
  });

  it('authenticates using bearer token when user token is valid', async () => {
    const guard = new ApiOrUserAuthGuard(
      jwtService,
      clsService,
      cacheManagerService,
      legalService,
      apiKeyService,
      logger,
    );

    const request = {
      headers: {
        authorization: 'Bearer jwt-token',
      },
      header: () => undefined,
      path: '/api/v1/domains',
      url: '/api/v1/domains',
    } as any;

    (jwtService.verifyToken as jest.Mock).mockReturnValue({
      userId: 'usr_1',
      organizationId: 'org_1',
    });
    (cacheManagerService.getData as jest.Mock).mockResolvedValue({
      id: 'usr_1',
      organizationId: 'org_1',
      isBlocked: false,
    });

    const result = await guard.canActivate(createContext(request));

    expect(result).toBe(true);
    expect(cacheManagerService.getData).toHaveBeenCalledWith({
      dataType: DataType.USERS,
      properties: {
        [CachedByProperty.ID]: 'usr_1',
      },
    });
    expect(request.user).toEqual({
      authType: 'user',
      userId: 'usr_1',
      organizationId: 'org_1',
    });
    expect(apiKeyService.authenticate).not.toHaveBeenCalled();
  });

  it('rejects requests without JWT or API key', async () => {
    const guard = new ApiOrUserAuthGuard(
      jwtService,
      clsService,
      cacheManagerService,
      legalService,
      apiKeyService,
      logger,
    );

    const request = {
      headers: {},
      header: () => undefined,
      path: '/api/v1/domains',
      url: '/api/v1/domains',
    } as any;

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toHaveProperty('status', 401);
  });
});
