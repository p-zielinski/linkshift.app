import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { DocsAssistantLogRetentionService } from './docs-assistant-log-retention.service';
import { resolveDocsAssistantLogRetentionCutoff } from './docs-assistant-log-retention.util';

describe('DocsAssistantLogRetentionService', () => {
  const configService = { get: jest.fn() };
  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const createDeleteChain = (result: {
    data: Array<{ id: string }> | null;
    error: { message: string } | null;
  }) => {
    const select = jest.fn().mockResolvedValue(result);
    const lt = jest.fn().mockReturnValue({ select });
    const deleteFn = jest.fn().mockReturnValue({ lt });
    const from = jest.fn().mockReturnValue({ delete: deleteFn });

    return { from, deleteFn, lt, select };
  };

  const createService = () =>
    new DocsAssistantLogRetentionService(
      configService as unknown as ConfigService,
      logger as unknown as Logger,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation((key: string) => {
      if (key === 'SUPABASE_URL') {
        return 'https://example.supabase.co';
      }
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
        return 'service-role-key';
      }
      if (key === 'DOCS_ASSISTANT_LOG_RETENTION_DAYS') {
        return '90';
      }
      return undefined;
    });
  });

  it('deletes rows older than the retention cutoff', async () => {
    const referenceDate = new Date('2026-03-22T12:33:11.000Z');
    const chain = createDeleteChain({
      data: [{ id: 'log-1' }, { id: 'log-2' }],
      error: null,
    });

    const service = createService();
    service.onModuleInit();
    (service as unknown as { supabase: { from: jest.Mock } }).supabase = {
      from: chain.from,
    };

    const result = await service.cleanupExpiredLogs(referenceDate);

    expect(result).toEqual({ deleted: 2 });
    expect(chain.from).toHaveBeenCalledWith('agent_search_logs');
    expect(chain.lt).toHaveBeenCalledWith(
      'created_at',
      resolveDocsAssistantLogRetentionCutoff(referenceDate, 90).toISOString(),
    );
    expect(logger.log).toHaveBeenCalledWith(
      'Docs assistant log retention cleanup completed',
      expect.objectContaining({
        deleted: 2,
        retentionDays: 90,
      }),
    );
  });

  it('uses configured retention days', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'SUPABASE_URL') {
        return 'https://example.supabase.co';
      }
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
        return 'service-role-key';
      }
      if (key === 'DOCS_ASSISTANT_LOG_RETENTION_DAYS') {
        return '30';
      }
      return undefined;
    });

    const referenceDate = new Date('2026-03-22T00:00:00.000Z');
    const chain = createDeleteChain({ data: [], error: null });
    const service = createService();
    service.onModuleInit();
    (service as unknown as { supabase: { from: jest.Mock } }).supabase = {
      from: chain.from,
    };

    await service.cleanupExpiredLogs(referenceDate);

    expect(chain.lt).toHaveBeenCalledWith(
      'created_at',
      resolveDocsAssistantLogRetentionCutoff(referenceDate, 30).toISOString(),
    );
  });

  it('returns zero deleted rows when Supabase is not configured', async () => {
    configService.get.mockReturnValue(undefined);
    const service = createService();
    service.onModuleInit();

    const first = await service.cleanupExpiredLogs();
    const second = await service.cleanupExpiredLogs();

    expect(first).toEqual({ deleted: 0 });
    expect(second).toEqual({ deleted: 0 });
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      'Supabase is not configured; docs assistant log retention cleanup skipped',
    );
  });

  it('returns zero deleted rows when delete fails', async () => {
    const chain = createDeleteChain({
      data: null,
      error: { message: 'delete failed' },
    });
    const service = createService();
    service.onModuleInit();
    (service as unknown as { supabase: { from: jest.Mock } }).supabase = {
      from: chain.from,
    };

    const result = await service.cleanupExpiredLogs(new Date('2026-03-22T00:00:00.000Z'));

    expect(result).toEqual({ deleted: 0 });
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to cleanup docs assistant search logs',
      expect.objectContaining({ error: 'delete failed' }),
    );
  });
});
