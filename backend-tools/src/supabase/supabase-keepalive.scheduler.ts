import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Prevents Supabase free-tier projects from pausing after ~7 days without API activity. */
export const SUPABASE_KEEPALIVE_CRON = '0 */6 * * *';

@Injectable()
export class SupabaseKeepaliveScheduler implements OnModuleInit {
  private supabase: SupabaseClient | null = null;
  private supabaseNotConfiguredLogged = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  onModuleInit(): void {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')?.trim();
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')?.trim();
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      void this.pingSupabase('startup');
    }
  }

  @Cron(SUPABASE_KEEPALIVE_CRON)
  async pingOnSchedule(): Promise<void> {
    await this.pingSupabase('cron');
  }

  async pingSupabase(source: 'startup' | 'cron'): Promise<{ ok: boolean }> {
    if (!this.supabase) {
      this.logSupabaseNotConfigured();
      return { ok: false };
    }

    const { error } = await this.supabase
      .from('agent_search_logs')
      .select('id', { head: true, count: 'exact' });

    if (error) {
      this.logger.error('Supabase keepalive ping failed', {
        source,
        error: error.message,
      });
      return { ok: false };
    }

    this.logger.debug('Supabase keepalive ping succeeded', { source });
    return { ok: true };
  }

  private logSupabaseNotConfigured(): void {
    if (this.supabaseNotConfiguredLogged) {
      return;
    }

    this.supabaseNotConfiguredLogged = true;
    this.logger.warn('Supabase is not configured; keepalive pings skipped');
  }
}
