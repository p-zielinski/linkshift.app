import { Test, TestingModule } from '@nestjs/testing';
import { RedirectRulesController } from './redirect-rules.controller';
import { RedirectService } from '../redirect/redirect.service';
import { ClsService } from 'nestjs-cls';
import { AuthGuard } from '../auth/auth.guard';
import {
  BadRequestException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import * as redirectRuleSchemas from '../zod-schames/redirect-rule.schemas';

describe('RedirectRulesController', () => {
  let controller: RedirectRulesController;
  let redirectService: RedirectService;

  const mockRedirectService = {
    listRules: jest.fn(),
    getRuleById: jest.fn(),
    createRule: jest.fn(),
    updateRule: jest.fn(),
    deleteRule: jest.fn(),
  };

  const mockClsService = {
    getId: jest.fn().mockReturnValue('req-123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedirectRulesController],
      providers: [
        {
          provide: RedirectService,
          useValue: mockRedirectService,
        },
        {
          provide: ClsService,
          useValue: mockClsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RedirectRulesController>(RedirectRulesController);
    redirectService = module.get<RedirectService>(RedirectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a valid string-based rule', async () => {
      const organizationId = 'org-1';
      const dto: redirectRuleSchemas.CreateRedirectRuleDto = {
        source: '/exact-path',
        destination: 'https://example.com',
        domainGroupId: 'group-1',
        statusCode: 301,
        priority: 1,
      };

      const expectedRule = {
        id: 'rule-1',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRedirectService.createRule.mockResolvedValue(expectedRule);

      const result = await controller.create(organizationId, dto);

      expect(mockRedirectService.createRule).toHaveBeenCalledWith(
        organizationId,
        dto,
      );
      expect(result).toEqual(expectedRule);
    });

    it('should correctly handle a RegExp rule passed as string', async () => {
      const organizationId = 'org-1';
      const dto: redirectRuleSchemas.CreateRedirectRuleDto = {
        source: '/^\\/api\\/(.+)$/i', // Regex string
        destination: 'https://api.new.com/$1',
        domainGroupId: 'group-1',
        statusCode: 301,
        priority: 1,
      };

      const expectedRule = {
        id: 'rule-2',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRedirectService.createRule.mockResolvedValue(expectedRule);

      const result = await controller.create(organizationId, dto);

      expect(mockRedirectService.createRule).toHaveBeenCalledWith(
        organizationId,
        dto,
      );
      expect(result.source).toBe('/^\\/api\\/(.+)$/i');
    });

    it('should throw BadRequestError when service throws BadRequestException (validation fails)', async () => {
      const organizationId = 'org-1';
      const dto: redirectRuleSchemas.CreateRedirectRuleDto = {
        source: '/broken-regex/(',
        destination: 'https://example.com',
        domainGroupId: 'group-1',
        statusCode: 301,
        priority: 1,
      };

      mockRedirectService.createRule.mockRejectedValue(
        new BadRequestException({ message: 'Validation failed' }),
      );

      await expect(controller.create(organizationId, dto)).rejects.toThrow(
        HttpException,
      );

      // Verify expected call despite failure
      expect(mockRedirectService.createRule).toHaveBeenCalledWith(
        organizationId,
        dto,
      );
    });

    it('should throw NotFoundError when service throws NotFoundException (domain group not found)', async () => {
      const organizationId = 'org-1';
      const dto: redirectRuleSchemas.CreateRedirectRuleDto = {
        source: '/path',
        destination: 'https://example.com',
        domainGroupId: 'non-existent',
        statusCode: 301,
        priority: 1,
      };

      mockRedirectService.createRule.mockRejectedValue(
        new NotFoundException('DomainGroup not found'),
      );

      await expect(controller.create(organizationId, dto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('update', () => {
    it('should update an existing rule', async () => {
      const organizationId = 'org-1';
      const id = 'rule-1';
      const dto: redirectRuleSchemas.UpdateRedirectRuleDto = {
        source: '/updated-path',
      };
      const expectedRule = {
        id,
        source: '/updated-path',
        destination: 'https://example.com',
        domainGroupId: 'group-1',
        statusCode: 301,
        priority: 1,
      };

      mockRedirectService.updateRule.mockResolvedValue(expectedRule);

      const result = await controller.update(id, organizationId, dto);

      expect(mockRedirectService.updateRule).toHaveBeenCalledWith(
        id,
        organizationId,
        dto,
      );
      expect(result).toEqual(expectedRule);
    });

    it('should throw NotFoundError if rule to update not found', async () => {
      mockRedirectService.updateRule.mockRejectedValue(
        new NotFoundException('Rule not found'),
      );
      await expect(controller.update('bad-id', 'org-1', {})).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getById', () => {
    it('should return a rule by id', async () => {
      const organizationId = 'org-1';
      const id = 'rule-1';
      const mockRule = { id, source: '/a' };
      mockRedirectService.getRuleById.mockResolvedValue(mockRule);

      const result = await controller.getById(id, organizationId);

      expect(mockRedirectService.getRuleById).toHaveBeenCalledWith(
        id,
        organizationId,
      );
      expect(result).toEqual(mockRule);
    });

    it('should throw NotFoundError if rule not found', async () => {
      mockRedirectService.getRuleById.mockRejectedValue(
        new NotFoundException('Rule not found'),
      );
      await expect(controller.getById('bad-id', 'org-1')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a rule', async () => {
      const organizationId = 'org-1';
      const id = 'rule-1';
      mockRedirectService.deleteRule.mockResolvedValue(undefined);

      const result = await controller.delete(id, organizationId);

      expect(mockRedirectService.deleteRule).toHaveBeenCalledWith(
        id,
        organizationId,
      );
      expect(result).toBe(undefined);
    });

    it('should throw NotFoundError if rule to delete not found', async () => {
      mockRedirectService.deleteRule.mockRejectedValue(
        new NotFoundException('Rule not found'),
      );
      await expect(controller.delete('bad-id', 'org-1')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
