import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  DOCS_ASSISTANT_LOG_RETENTION_DAYS,
  resolveDocsAssistantLogRetentionCutoff,
} from './docs-assistant-log-retention.util';

@Injectable()
export class DocsAssistantLogRetentionService implements OnModuleInit {
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
    }
  }

  async cleanupExpiredLogs(referenceDate = new Date()): Promise<{ deleted: number }> {
    if (!this.supabase) {
      this.logSupabaseNotConfigured();
      return { deleted: 0 };
    }

    const retentionDays = this.resolveRetentionDays();
    const cutoffIso = resolveDocsAssistantLogRetentionCutoff(
      referenceDate,
      retentionDays,
    ).toISOString();

    const { data, error } = await this.supabase
      .from('agent_search_logs')
      .delete()
      .lt('created_at', cutoffIso)
      .select('id');

    if (error) {
      this.logger.error('Failed to cleanup docs assistant search logs', {
        error: error.message,
        cutoff: cutoffIso,
        retentionDays,
      });
      return { deleted: 0 };
    }

    const deleted = data?.length ?? 0;
    this.logger.log('Docs assistant log retention cleanup completed', {
      deleted,
      cutoff: cutoffIso,
      retentionDays,
    });

    return { deleted };
  }

  private logSupabaseNotConfigured(): void {
    if (this.supabaseNotConfiguredLogged) {
      return;
    }

    this.supabaseNotConfiguredLogged = true;
    this.logger.warn(
      'Supabase is not configured; docs assistant log retention cleanup skipped',
    );
  }

  private resolveRetentionDays(): number {
    const configured = this.configService.get<string>('DOCS_ASSISTANT_LOG_RETENTION_DAYS');
    const value = Number(configured ?? DOCS_ASSISTANT_LOG_RETENTION_DAYS);
    if (!Number.isFinite(value)) {
      return DOCS_ASSISTANT_LOG_RETENTION_DAYS;
    }

    return Math.max(1, Math.floor(value));
  }
}
