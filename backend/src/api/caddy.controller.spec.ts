import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { CHECK_DOMAIN_OUTCOME } from '../security/check-domain-outcome.constants';
import { CheckDomainAccessService } from '../security/check-domain-access.service';
import { RedirectService } from '../redirect/redirect.service';
import { CaddyController } from './caddy.controller';

describe('CaddyController', () => {
  let controller: CaddyController;

  const mockRedirectService = {
    getDomainAllowCheck: jest.fn(),
  };

  const mockCheckDomainAccessService = {
    isAllowedRequest: jest.fn().mockReturnValue(true),
    normalizeClientIp: jest.fn((ip?: string) => ip ?? null),
  };

  const mockClsService = {
    getId: jest.fn().mockReturnValue('req-123'),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    setContext: jest.fn(),
  };

  const allowedRequest = { ip: '10.0.0.5' } as { ip: string };
  const blockedRequest = { ip: '8.8.8.8' } as { ip: string };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaddyController],
      providers: [
        {
          provide: RedirectService,
          useValue: mockRedirectService,
        },
        {
          provide: CheckDomainAccessService,
          useValue: mockCheckDomainAccessService,
        },
        {
          provide: ClsService,
          useValue: mockClsService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<CaddyController>(CaddyController);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockCheckDomainAccessService.isAllowedRequest.mockReturnValue(true);
    mockCheckDomainAccessService.normalizeClientIp.mockImplementation(
      (ip?: string) => ip ?? null,
    );
  });

  describe('checkDomain', () => {
    it('throws ForbiddenException for blocked client IP before domain lookup', async () => {
      mockCheckDomainAccessService.isAllowedRequest.mockReturnValue(false);
      mockCheckDomainAccessService.normalizeClientIp.mockReturnValue('8.8.8.8');

      await expect(
        controller.checkDomain(blockedRequest, 'example.com'),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockRedirectService.getDomainAllowCheck).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Caddy domain check blocked by IP allowlist',
        {
          requestId: 'req-123',
          clientIp: '8.8.8.8',
        },
      );
    });

    it('throws BadRequestException when domain query param is missing', async () => {
      await expect(
        controller.checkDomain(allowedRequest, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockRedirectService.getDomainAllowCheck).not.toHaveBeenCalled();
    });

    it('returns allowed true and logs structured outcome for permitted host', async () => {
      mockRedirectService.getDomainAllowCheck.mockResolvedValue({
        allowed: true,
        outcome: CHECK_DOMAIN_OUTCOME.allowed,
        hostType: 'subdomain',
      });

      const result = await controller.checkDomain(
        allowedRequest,
        'Demo.LinkShift.App',
      );

      expect(mockRedirectService.getDomainAllowCheck).toHaveBeenCalledWith(
        'demo.linkshift.app',
      );
      expect(result).toEqual({ allowed: true });
      expect(mockLogger.log).toHaveBeenCalledWith('Caddy domain check', {
        requestId: 'req-123',
        domain: 'demo.linkshift.app',
        allowed: true,
        checkDomainOutcome: CHECK_DOMAIN_OUTCOME.allowed,
        hostType: 'subdomain',
      });
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException and logs warn with outcome when denied', async () => {
      mockRedirectService.getDomainAllowCheck.mockResolvedValue({
        allowed: false,
        outcome: CHECK_DOMAIN_OUTCOME.dns_pending,
        hostType: 'custom',
      });

      await expect(
        controller.checkDomain(allowedRequest, 'example.com'),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockLogger.warn).toHaveBeenCalledWith('Caddy domain check denied', {
        requestId: 'req-123',
        domain: 'example.com',
        allowed: false,
        checkDomainOutcome: CHECK_DOMAIN_OUTCOME.dns_pending,
        hostType: 'custom',
      });
    });
  });
});
