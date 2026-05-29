import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'nestjs-pino';
import OpenAI from 'openai';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { InternalServerError } from '@shared/models/error.model';
import { throwHttpException } from '../utils';
import {
  resolveConversationSummary,
  trimConversationSummary,
} from './docs-assistant-conversation.util';
import {
  GeneratorResultSchema,
  parseValidatedJson,
  RouterResultSchema,
  type GeneratorResult,
  type RouterResult,
} from './docs-assistant-json.util';
import { buildUnknownInDocsAnswer } from './docs-assistant-messages';
import { GENERATOR_SYSTEM_PROMPT, ROUTER_SYSTEM_PROMPT } from './docs-assistant-prompts';
import {
  buildNoCatalogMatchResult,
  buildRouterEarlyExitResult,
  isRouterEarlyExitIntent,
  resolveCatalogIdsForDocumentationSearch,
} from './docs-assistant-routing.util';
import { DOCS_ASSISTANT_MAX_CATALOG_PICKS } from './docs-catalog-metadata';
import { DocsCatalogService } from './docs-catalog.service';
import { DocsContentLoaderService } from './docs-content-loader.service';
import type { DocsSearchResultEvent, DocsSearchStreamEvent } from './docs-assistant-stream.model';
import { DocsAssistantPipelineTrace } from './docs-assistant-pipeline-trace.util';

function toSearchResultEvent(
  event: Omit<DocsSearchResultEvent, 'conversationSummary'> & {
    conversationSummary?: string | null;
  },
): DocsSearchResultEvent {
  return {
    ...event,
    conversationSummary: trimConversationSummary(event.conversationSummary) ?? null,
  };
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

  async *processAgentSearchStream(
    question: string,
    conversationSummary: string | null = null,
  ): AsyncGenerator<DocsSearchStreamEvent> {
    const trimmedQuestion = question.trim();
    const priorSummary = trimConversationSummary(conversationSummary);
    const trace = new DocsAssistantPipelineTrace(this.logger, this.clsService.getId());

    if (!trimmedQuestion) {
      trace.completePipeline('empty_question');
      yield toSearchResultEvent({
        type: 'result',
        answer: '',
        sources: [],
        logId: null,
        conversationSummary: priorSummary,
      });
      return;
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

    yield { type: 'status', stage: 'routing' };
    trace.startStage('routing');

    const routerData = await this.runRouter(trimmedQuestion, priorSummary, catalog);

    trace.completeStage('routing', {
      model: this.routerModel(),
      intent: routerData.intent,
      suggestedCatalogIds: routerData.suggestedCatalogIds,
      suggestedCatalogIdsCount: routerData.suggestedCatalogIds.length,
    });

    if (isRouterEarlyExitIntent(routerData.intent)) {
      trace.completePipeline('early_exit', {
        intent: routerData.intent,
      });
      const earlyExit = buildRouterEarlyExitResult(routerData);
      yield toSearchResultEvent({
        type: 'result',
        answer: earlyExit.answer,
        sources: [],
        logId: null,
        conversationSummary: resolveConversationSummary(priorSummary, routerData.conversationSummary),
      });
      return;
    }

    const routerSuggestedIds = routerData.suggestedCatalogIds;
    const catalogIds = resolveCatalogIdsForDocumentationSearch(
      trimmedQuestion,
      routerSuggestedIds,
      catalog,
      (ids) => this.trimCatalogPicks(ids),
    );
    const usedKeywordFallback = routerSuggestedIds.length === 0 && catalogIds.length > 0;

    if (usedKeywordFallback) {
      this.logger.warn('Docs assistant router returned no catalog ids; used keyword fallback', {
        requestId: this.clsService.getId(),
        catalogIds,
      });
    }

    if (catalogIds.length === 0) {
      trace.completePipeline('no_catalog_match', {
        intent: routerData.intent,
        routerSuggestedIds,
      });
      const noMatch = buildNoCatalogMatchResult(routerData);
      yield toSearchResultEvent({
        type: 'result',
        answer: noMatch.answer,
        sources: [],
        logId: null,
        conversationSummary: resolveConversationSummary(priorSummary, routerData.conversationSummary),
      });
      return;
    }

    yield { type: 'status', stage: 'reading' };
    trace.startStage('reading');

    const selectedEntries = this.catalogService.getByIds(catalogIds);
    const sources = selectedEntries.map((entry) => entry.userFacingRef);
    const context = this.contentLoader.loadContext(selectedEntries);

    trace.completeStage('reading', {
      catalogIds,
      sourceCount: sources.length,
      sources,
      contextChars: context.length,
      usedKeywordFallback,
    });

    yield { type: 'status', stage: 'drafting' };
    trace.startStage('drafting');

    const generatorResult = await this.runGenerator(trimmedQuestion, context, sources, priorSummary);

    trace.completeStage('drafting', {
      model: this.generatorModel(),
      answerLengthChars: generatorResult.answer.length,
      skippedLlm: !context.trim(),
    });

    const logId = await this.persistSearchLog({
      question: trimmedQuestion,
      answer: generatorResult.answer,
      sourcesUsed: sources,
      executionTimeMs: Date.now() - startTime,
    });

    trace.completePipeline('completed', {
      intent: routerData.intent,
      catalogIds,
      sourceCount: sources.length,
      usedKeywordFallback,
      logId,
    });

    yield toSearchResultEvent({
      type: 'result',
      answer: generatorResult.answer,
      sources,
      logId,
      conversationSummary: generatorResult.conversationSummary,
    });
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

  private trimCatalogPicks(catalogIds: string[]): string[] {
    return catalogIds.slice(0, DOCS_ASSISTANT_MAX_CATALOG_PICKS);
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
    conversationSummary: string | null,
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
      conversationSummary: null,
    };

    return this.createValidatedJsonCompletion({
      model: this.routerModel(),
      systemPrompt: ROUTER_SYSTEM_PROMPT,
      userPayload: { question, conversationSummary, catalog },
      schema: RouterResultSchema,
      fallback,
      stage: 'router',
    });
  }

  private async runGenerator(
    question: string,
    context: string,
    sourcesChecked: string[],
    conversationSummary: string | null,
  ): Promise<{ answer: string; conversationSummary: string | null }> {
    const previousSummary = trimConversationSummary(conversationSummary);
    const fallbackAnswer = buildUnknownInDocsAnswer(sourcesChecked);

    if (!context.trim()) {
      return {
        answer: fallbackAnswer,
        conversationSummary: previousSummary,
      };
    }

    const fallback: GeneratorResult = {
      answer: fallbackAnswer,
      conversationSummary: previousSummary ?? '',
    };

    const result = await this.createValidatedJsonCompletion({
      model: this.generatorModel(),
      systemPrompt: this.generatorSystemPrompt(),
      userPayload: this.buildGeneratorUserPayload(
        question,
        context,
        sourcesChecked,
        previousSummary,
      ),
      schema: GeneratorResultSchema,
      fallback,
      stage: 'generator',
    });

    return {
      answer: result.answer.trim() || fallbackAnswer,
      conversationSummary: resolveConversationSummary(previousSummary, result.conversationSummary),
    };
  }

  private generatorSystemPrompt(): string {
    const extra = this.configService.get<string>('DOCS_ASSISTANT_EXTRA_INSTRUCTIONS')?.trim();
    if (!extra) {
      return GENERATOR_SYSTEM_PROMPT;
    }

    return `${GENERATOR_SYSTEM_PROMPT}\n\nAdditional instructions:\n${extra}`;
  }

  private buildGeneratorUserPayload(
    question: string,
    context: string,
    sourcesChecked: string[],
    conversationSummary: string | null,
  ): Record<string, unknown> {
    return {
      conversationSummary,
      sourcesChecked,
      documentationContext: context,
      question,
    };
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
    stage: 'router' | 'generator';
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
        critic_notes: null,
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

}
