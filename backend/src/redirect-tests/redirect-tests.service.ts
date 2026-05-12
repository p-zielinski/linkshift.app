import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrganizationService } from '../organization/organization.service';
import { QueryResult } from '@shared/models/query-result.model';
import { CacheManagerService, DataType } from '../cache/cache-manager.service';
import { AppEntity, createCustomCuid, throwHttpException } from '../utils';
import { BadRequestError, NotFoundError } from '@shared/models/error.model';
import { ClsService } from 'nestjs-cls';
import { Prisma } from '@prisma/client';
import type {
  CreateRedirectTestDto,
  UpdateRedirectTestDto,
} from '../zod-schames/redirect-test.schemas';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RedirectTestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationService: OrganizationService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  async listTests(
    organizationId: string,
    domainGroupId: string,
    params?: {
      limit?: number;
      search?: string;
      startAfterId?: string;
    },
  ) {
    const { limit = 20, search, startAfterId } = params || {};
    const take = Number(limit);

    const where: Prisma.RedirectTestWhereInput = {
      deletedAt: null,
      organizationId,
      domainGroupId,
      domainGroup: { organizationId, deletedAt: null },
    };

    if (search) {
      where.pathWithQuery = { contains: search, mode: 'insensitive' };
    }

    const startAfter = startAfterId
      ? await this.prisma.redirectTest.findFirst({
          where: {
            ...where,
            id: startAfterId,
          },
          select: { id: true, createdAt: true },
        })
      : null;

    const rows = await this.prisma.redirectTest.findMany({
      where,
      take: take + 1,
      ...(startAfter
        ? {
            cursor: {
              createdAt_id: {
                createdAt: startAfter.createdAt,
                id: startAfter.id,
              },
            },
            skip: 1,
          }
        : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const hasMore = rows.length > take;
    const data = hasMore ? rows.slice(0, take) : rows;
    const nextAfterId = hasMore ? data[data.length - 1]?.id : undefined;

    return new QueryResult({
      data,
      dataType: DataType.REDIRECT_TESTS,
      moreStartingAfterId: nextAfterId,
    });
  }

  async getTestById(id: string, organizationId: string) {
    const test = await this.prisma.redirectTest.findFirst({
      where: {
        id,
        deletedAt: null,
        organizationId,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!test) {
      return throwHttpException(
        new NotFoundError({
          details: `Redirect test with id ${id} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    return test;
  }

  async createTest(organizationId: string, data: CreateRedirectTestDto) {
    await this.organizationService.checkRedirectTestLimit(
      organizationId,
      data.domainGroupId,
    );

    const domainGroup = await this.prisma.domainGroup.findFirst({
      where: {
        id: data.domainGroupId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!domainGroup) {
      return throwHttpException(
        new NotFoundError({
          details: `Domain group with id ${data.domainGroupId} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    const pathWithQuery = this.normalizePathWithQuery(data.pathWithQuery);

    const requestData = this.normalizeRequestData(data.requestData);
    const expectedResult = this.normalizeExpectedResult(data.expectedResult);

    const test = await this.prisma.redirectTest.create({
      data: {
        id: createCustomCuid(AppEntity.RedirectTest, 24),
        organizationId,
        domainGroupId: data.domainGroupId,
        pathWithQuery,
        requestData,
        expectedResult,
      },
    });

    await this.cacheManagerService.setDataExist({
      data: test,
      dataType: DataType.REDIRECT_TESTS,
    });

    return test;
  }

  async updateTest(
    id: string,
    organizationId: string,
    data: UpdateRedirectTestDto,
  ) {
    const existing = await this.prisma.redirectTest.findFirst({
      where: {
        id,
        deletedAt: null,
        organizationId,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          details: `Redirect test with id ${id} not found`,
          requestId: this.clsService.getId(),
        }),
      );
    }

    const updateData: Prisma.RedirectTestUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.pathWithQuery !== undefined) {
      updateData.pathWithQuery = this.normalizePathWithQuery(
        data.pathWithQuery,
      );
    }

    if (data.requestData !== undefined) {
      updateData.requestData = this.normalizeRequestData(data.requestData);
    }

    if (data.expectedResult !== undefined) {
      updateData.expectedResult = this.normalizeExpectedResult(
        data.expectedResult,
      );
    }

    const test = await this.prisma.redirectTest.update({
      where: { id },
      data: updateData,
    });

    await this.cacheManagerService.setDataExist({
      data: test,
      dataType: DataType.REDIRECT_TESTS,
    });

    return test;
  }

  async deleteTest(id: string, organizationId: string) {
    const existing = await this.prisma.redirectTest.findFirst({
      where: {
        id,
        deletedAt: null,
        organizationId,
        domainGroup: { organizationId, deletedAt: null },
      },
    });

    if (!existing) {
      return throwHttpException(
        new NotFoundError({
          requestId: this.clsService.getId(),
          details: `Redirect test with id ${id} not found`,
        }),
      );
    }

    const test = await this.prisma.redirectTest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.cacheManagerService.setDataExist({
      data: test,
      dataType: DataType.REDIRECT_TESTS,
    });
  }

  private normalizePathWithQuery(pathWithQuery: string): string {
    const trimmed = pathWithQuery.trim();
    if (!trimmed) {
      return '/';
    }

    if (/^https?:\/\//i.test(trimmed)) {
      return throwHttpException(
        new BadRequestError({
          requestId: this.clsService.getId(),
          details: 'Domain is not allowed in test path input.',
          relatedObjectParameter: 'pathWithQuery',
        }),
      );
    }

    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  private normalizeRequestData(
    input: CreateRedirectTestDto['requestData'] | undefined,
  ): Prisma.InputJsonValue {
    if (!input) {
      return {};
    }

    const data: Record<string, Prisma.InputJsonValue> = {};
    if (input.method) {
      data.method = input.method;
    }
    if (input.protocol) {
      data.protocol = input.protocol;
    }
    if (input.hostname) {
      data.hostname = input.hostname;
    }
    if (input.ip) {
      data.ip = input.ip;
    }
    if (input.userAgent) {
      data.userAgent = input.userAgent;
    }
    if (input.headers && Object.keys(input.headers).length > 0) {
      data.headers = input.headers;
    }
    if (input.query && Object.keys(input.query).length > 0) {
      data.query = input.query;
    }

    return data;
  }

  private normalizeExpectedResult(
    input: NonNullable<
      | CreateRedirectTestDto['expectedResult']
      | UpdateRedirectTestDto['expectedResult']
    >,
  ): Prisma.InputJsonValue {
    return {
      matched: input.matched,
      statusCode: input.statusCode,
      target: input.target ?? null,
    };
  }
}
