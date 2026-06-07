import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import { AuthGuard } from '../auth/auth.guard';
import { ApiOrUserAuthGuard } from '../auth/api-or-user-auth.guard';
import { LinksListService } from '../links/links-list.service';
import { DataType } from '../cache/cache-manager.service';
import { QueryResult } from '@shared/models/query-result.model';
import { LinksController } from './links.controller';

describe('LinksController', () => {
  let controller: LinksController;

  const mockLinksListService = {
    list: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LinksController],
      providers: [
        {
          provide: LinksListService,
          useValue: mockLinksListService,
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
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LinksController>(LinksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('uses AuthGuard and not ApiOrUserAuthGuard', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        LinksController.prototype.list,
      ) as unknown[];

      expect(guards).toContain(AuthGuard);
      expect(guards).not.toContain(ApiOrUserAuthGuard);
    });

    it('delegates to LinksListService.list', async () => {
      const organizationId = 'org-1';
      const query = {
        limit: 20,
        domainGroupId: 'dmg_abc123',
        linkMapId: 'lmp_def456',
        search: 'summer',
      };
      const expectedResult = new QueryResult({
        data: [],
        dataType: DataType.LINKS_LIST,
        moreStartingAfterId: undefined,
      });

      mockLinksListService.list.mockResolvedValue(expectedResult);

      const result = await controller.list(organizationId, query);

      expect(mockLinksListService.list).toHaveBeenCalledWith(
        organizationId,
        query,
      );
      expect(result).toEqual(expectedResult);
      expect(mockLogger.log).toHaveBeenCalledWith('Links list requested', {
        requestId: 'req-123',
        organizationId,
        domainGroupId: query.domainGroupId,
        linkMapId: query.linkMapId,
        limit: query.limit,
        hasSearch: true,
        hasCursor: false,
      });
    });

    it('logs hasCursor when startAfterId is present', async () => {
      const organizationId = 'org-1';
      const query = {
        limit: 20,
        startAfterId: 'lme_entry123456789012345678901',
      };
      const expectedResult = new QueryResult({
        data: [],
        dataType: DataType.LINKS_LIST,
        moreStartingAfterId: undefined,
      });

      mockLinksListService.list.mockResolvedValue(expectedResult);

      await controller.list(organizationId, query);

      expect(mockLogger.log).toHaveBeenCalledWith('Links list requested', {
        requestId: 'req-123',
        organizationId,
        domainGroupId: undefined,
        linkMapId: undefined,
        limit: query.limit,
        hasSearch: false,
        hasCursor: true,
      });
    });
  });
});
