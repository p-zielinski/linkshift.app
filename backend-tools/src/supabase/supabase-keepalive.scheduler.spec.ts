import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { SupabaseKeepaliveScheduler } from './supabase-keepalive.scheduler';

describe('SupabaseKeepaliveScheduler', () => {
  const configService = { get: jest.fn() };
  const logger = {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const createSelectChain = (result: { error: { message: string } | null }) => {
    const select = jest.fn().mockResolvedValue(result);
    const from = jest.fn().mockReturnValue({ select });
    return { from, select };
  };

  const createScheduler = () =>
    new SupabaseKeepaliveScheduler(
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
      return undefined;
    });
  });

  it('pings agent_search_logs with a head count query', async () => {
    const chain = createSelectChain({ error: null });
    const scheduler = createScheduler();
    (scheduler as unknown as { supabase: { from: jest.Mock } }).supabase = {
      from: chain.from,
    };

    const result = await scheduler.pingSupabase('cron');

    expect(result).toEqual({ ok: true });
    expect(chain.from).toHaveBeenCalledWith('agent_search_logs');
    expect(chain.select).toHaveBeenCalledWith('id', { head: true, count: 'exact' });
    expect(logger.debug).toHaveBeenCalledWith('Supabase keepalive ping succeeded', {
      source: 'cron',
    });
  });

  it('returns ok false when ping fails', async () => {
    const chain = createSelectChain({ error: { message: 'connection refused' } });
    const scheduler = createScheduler();
    (scheduler as unknown as { supabase: { from: jest.Mock } }).supabase = {
      from: chain.from,
    };

    const result = await scheduler.pingSupabase('startup');

    expect(result).toEqual({ ok: false });
    expect(logger.error).toHaveBeenCalledWith('Supabase keepalive ping failed', {
      source: 'startup',
      error: 'connection refused',
    });
  });

  it('skips ping when Supabase is not configured', async () => {
    configService.get.mockReturnValue(undefined);
    const scheduler = createScheduler();
    scheduler.onModuleInit();

    const first = await scheduler.pingSupabase('cron');
    const second = await scheduler.pingSupabase('cron');

    expect(first).toEqual({ ok: false });
    expect(second).toEqual({ ok: false });
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith('Supabase is not configured; keepalive pings skipped');
  });
});
