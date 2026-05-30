import type { Logger } from 'nestjs-pino';
import type { DocsSearchStage } from './docs-assistant-stream.model';

export type DocsAssistantPipelineOutcome =
  | 'empty_question'
  | 'early_exit'
  | 'no_catalog_match'
  | 'completed';

export type DocsAssistantTraceStage = DocsSearchStage;

export class DocsAssistantPipelineTrace {
  private readonly stageStartedAt = new Map<DocsAssistantTraceStage, number>();
  readonly stageDurationMs: Partial<Record<DocsAssistantTraceStage, number>> = {};
  private readonly pipelineStartedAt = Date.now();

  constructor(
    private readonly logger: Logger,
    private readonly requestId: string | undefined,
  ) {}

  startStage(stage: DocsAssistantTraceStage): void {
    this.stageStartedAt.set(stage, Date.now());
    this.logger.log('Docs assistant stage started', this.baseFields(stage));
  }

  completeStage(stage: DocsAssistantTraceStage, details: Record<string, unknown> = {}): number {
    const startedAt = this.stageStartedAt.get(stage);
    const durationMs = startedAt === undefined ? 0 : Date.now() - startedAt;
    this.stageDurationMs[stage] = durationMs;

    this.logger.log('Docs assistant stage completed', {
      ...this.baseFields(stage),
      durationMs,
      ...details,
    });

    return durationMs;
  }

  completePipeline(
    outcome: DocsAssistantPipelineOutcome,
    details: Record<string, unknown> = {},
  ): void {
    this.logger.log('Docs assistant pipeline completed', {
      requestId: this.requestId,
      outcome,
      totalDurationMs: Date.now() - this.pipelineStartedAt,
      stageDurationMs: { ...this.stageDurationMs },
      ...details,
    });
  }

  private baseFields(stage: DocsAssistantTraceStage): Record<string, unknown> {
    return {
      requestId: this.requestId,
      stage,
    };
  }
}
