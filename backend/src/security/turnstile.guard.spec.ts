import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import * as turnstileVerify from '@shared/security/turnstile-verify';
import { TurnstileGuard } from './turnstile.guard';

jest.mock('@shared/security/turnstile-verify', () => ({
  shouldSkipTurnstileVerification: jest.fn(),
  extractTurnstileTokenFromHeader: jest.fn(),
  verifyTurnstileToken: jest.fn(),
}));

describe('TurnstileGuard', () => {
  const shouldSkip = jest.mocked(turnstileVerify.shouldSkipTurnstileVerification);
  const extractToken = jest.mocked(turnstileVerify.extractTurnstileTokenFromHeader);
  const verifyToken = jest.mocked(turnstileVerify.verifyTurnstileToken);

  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        NODE_ENV: 'production',
        CLOUDFLARE_TURNSTILE_SECRET_KEY: 'secret',
        TURNSTILE_SKIP_VERIFY: 'false',
      };
      return values[key];
    }),
  } as unknown as ConfigService;

  const clsService = {
    getId: jest.fn(() => 'req-1'),
  } as unknown as ClsService;

  const logger = {
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;

  const guard = new TurnstileGuard(configService, clsService, logger);

  const createContext = (headers: Record<string, string | string[] | undefined> = {}) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          ip: '203.0.113.10',
        }),
      }),
    }) as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    shouldSkip.mockReturnValue(null);
    extractToken.mockReturnValue('token');
    verifyToken.mockResolvedValue({ ok: true });
  });

  it('allows request when verification succeeds', async () => {
    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(verifyToken).toHaveBeenCalledWith({
      secretKey: 'secret',
      token: 'token',
      remoteIp: '203.0.113.10',
    });
  });

  it('allows request when skip reason is returned', async () => {
    shouldSkip.mockReturnValue('skip_verify_flag');

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it('rejects when token is missing', async () => {
    extractToken.mockReturnValue(undefined);

    await expect(guard.canActivate(createContext())).rejects.toMatchObject({
      response: expect.objectContaining({
        details: "Couldn't verify the request. Complete the bot check and try again.",
      }),
    });
  });
});
