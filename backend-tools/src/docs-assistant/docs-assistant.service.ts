import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import OpenAI from 'openai';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { InternalServerError } from '@shared/models/error.model';
import { throwHttpException } from '../utils';
import {
  CriticResultSchema,
  type CriticResult,
  parseValidatedJson,
  RouterResultSchema,
  type RouterResult,
} from './docs-assistant-json.util';
import {
  CRITIC_SYSTEM_PROMPT,
  GENERATOR_SYSTEM_PROMPT,
  ROUTER_SYSTEM_PROMPT,
} from './docs-assistant-prompts';
import { rankCatalogIdsByQuestion } from './docs-catalog-metadata';
import { DocsCatalogService } from './docs-catalog.service';
import { DocsContentLoaderService } from './docs-content-loader.service';

export interface DocsSearchResult {
  answer: string;
  sources: string[];
  logId: string | null;
}

@Injectable()
export class DocsAssistantService implements OnModuleInit {
  private openai: OpenAI | null = null;
  private supabase: SupabaseClient | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly catalogService: DocsCatalogService,
    private readonly contentLoader: DocsContentLoaderService,
    private readonly clsService: ClsService,
    private readonly logger: Logger,
  ) {}

  onModuleInit(): void {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')?.trim();
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')?.trim();
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async processAgentSearch(question: string): Promise<DocsSearchResult> {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return { answer: '', sources: [], logId: null };
    }

    this.ensureOpenAiConfigured();

    const startTime = Date.now();
    const catalogEntries = this.catalogService.getEntries();
    const catalog = catalogEntries.map((entry) => ({
      catalogId: entry.catalogId,
      kind: entry.kind,
      userFacingRef: entry.userFacingRef,
      summary: entry.summary,
    }));

    const routerData = await this.runRouter(trimmedQuestion, catalog);

    if (routerData.intent === 'CONVERSATION') {
      return {
        answer: routerData.directReply?.trim() || 'Hi — ask me anything about LinkShift documentation.',
        sources: [],
        logId: null,
      };
    }

    let catalogIds = routerData.suggestedCatalogIds;
    if (catalogIds.length === 0) {
      catalogIds = rankCatalogIdsByQuestion(trimmedQuestion, catalog);
      if (catalogIds.length > 0) {
        this.logger.warn('Docs assistant router returned no catalog ids; used keyword fallback', {
          requestId: this.clsService.getId(),
          catalogIds,
        });
      }
    }

    const selectedEntries = this.catalogService.getByIds(catalogIds);
    const sources = selectedEntries.map((entry) => entry.userFacingRef);
    const context = this.contentLoader.loadContext(selectedEntries);

    let finalAnswer = await this.runGenerator(trimmedQuestion, context);
    const criticData = await this.runCritic(trimmedQuestion, finalAnswer);
    const criticNotes = criticData.criticNotes;

    if (!criticData.isValid) {
      finalAnswer = `${finalAnswer}\n\n*This answer may be incomplete — the team will review it.*`;
    }

    const logId = await this.persistSearchLog({
      question: trimmedQuestion,
      answer: finalAnswer,
      sourcesUsed: sources,
      criticNotes,
      executionTimeMs: Date.now() - startTime,
    });

    return {
      answer: finalAnswer,
      sources,
      logId,
    };
  }

  async saveRating(logId: string, rating: number): Promise<{ success: boolean }> {
    if (!this.supabase) {
      this.logger.warn('Supabase is not configured; rating ignored', {
        requestId: this.clsService.getId(),
        logId,
      });
      return { success: false };
    }

    const { error } = await this.supabase
      .from('agent_search_logs')
      .update({ rating })
      .eq('id', logId);

    if (error) {
      this.logger.error('Failed to save docs assistant rating', {
        requestId: this.clsService.getId(),
        logId,
        error: error.message,
      });
      return { success: false };
    }

    return { success: true };
  }

  private ensureOpenAiConfigured(): void {
    if (this.openai) {
      return;
    }

    return throwHttpException(
      new InternalServerError({
        requestId: this.clsService.getId() ?? 'missing_request_id',
        details: 'Documentation assistant is not configured (missing OPENAI_API_KEY).',
      }),
    );
  }

  private async runRouter(
    question: string,
    catalog: Array<{
      catalogId: string;
      kind: string;
      userFacingRef: string;
      summary: string;
    }>,
  ): Promise<RouterResult> {
    const fallback: RouterResult = {
      intent: 'DOCUMENTATION_SEARCH',
      directReply: null,
      suggestedCatalogIds: [],
    };

    return this.createValidatedJsonCompletion({
      model: this.routerModel(),
      systemPrompt: ROUTER_SYSTEM_PROMPT,
      userPayload: { question, catalog },
      schema: RouterResultSchema,
      fallback,
      stage: 'router',
    });
  }

  private async runGenerator(question: string, context: string): Promise<string> {
    if (!context.trim()) {
      return "I couldn't find that in the official LinkShift documentation.";
    }

    const response = await this.openai!.chat.completions.create({
      model: this.generatorModel(),
      messages: [
        { role: 'system', content: GENERATOR_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Documentation context:\n${context}\n\nUser question: ${question}`,
        },
      ],
    });

    return response.choices[0]?.message?.content?.trim() || '';
  }

  private async runCritic(question: string, answer: string): Promise<CriticResult> {
    const fallback: CriticResult = {
      isValid: false,
      criticNotes: 'Critic response could not be parsed.',
    };

    return this.createValidatedJsonCompletion({
      model: this.criticModel(),
      systemPrompt: CRITIC_SYSTEM_PROMPT,
      userPayload: { question, answer },
      schema: CriticResultSchema,
      fallback,
      stage: 'critic',
    });
  }

  private async createValidatedJsonCompletion<T>({
    model,
    systemPrompt,
    userPayload,
    schema,
    fallback,
    stage,
  }: {
    model: string;
    systemPrompt: string;
    userPayload: unknown;
    schema: import('zod').ZodType<T>;
    fallback: T;
    stage: 'router' | 'critic';
  }): Promise<T> {
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const raw = await this.createJsonCompletion({ model, systemPrompt, userPayload });
      const parsed = parseValidatedJson(raw, schema);

      if (parsed.ok) {
        return parsed.data;
      }

      this.logger.warn('Docs assistant JSON validation failed', {
        requestId: this.clsService.getId(),
        stage,
        attempt,
        error: parsed.error,
      });
    }

    this.logger.warn('Docs assistant using stage fallback after JSON failures', {
      requestId: this.clsService.getId(),
      stage,
    });

    return fallback;
  }

  private async createJsonCompletion({
    model,
    systemPrompt,
    userPayload,
  }: {
    model: string;
    systemPrompt: string;
    userPayload: unknown;
  }): Promise<string> {
    const response = await this.openai!.chat.completions.create({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userPayload) },
      ],
    });

    return response.choices[0]?.message?.content ?? '{}';
  }

  private async persistSearchLog(payload: {
    question: string;
    answer: string;
    sourcesUsed: string[];
    criticNotes: string | null;
    executionTimeMs: number;
  }): Promise<string | null> {
    if (!this.supabase) {
      this.logger.warn('Supabase is not configured; search log skipped', {
        requestId: this.clsService.getId(),
      });
      return null;
    }

    const { data, error } = await this.supabase
      .from('agent_search_logs')
      .insert({
        question: payload.question,
        answer: payload.answer,
        sources_used: payload.sourcesUsed,
        critic_notes: payload.criticNotes,
        execution_time_ms: payload.executionTimeMs,
      })
      .select('id')
      .single();

    if (error) {
      this.logger.error('Failed to persist docs assistant search log', {
        requestId: this.clsService.getId(),
        error: error.message,
      });
      return null;
    }

    return data?.id ?? null;
  }

  private routerModel(): string {
    return this.configService.get<string>('DOCS_ASSISTANT_ROUTER_MODEL')?.trim() || 'gpt-5.4-nano';
  }

  private generatorModel(): string {
    return this.configService.get<string>('DOCS_ASSISTANT_GENERATOR_MODEL')?.trim() || 'gpt-5.4-mini';
  }

  private criticModel(): string {
    return this.configService.get<string>('DOCS_ASSISTANT_CRITIC_MODEL')?.trim() || 'gpt-5.4-nano';
  }
}
