import {
  estimateLlmUsageCostUsd,
  parseDocsAssistantModelPricingJson,
  type ModelTokenPricingUsdPer1M,
} from './docs-assistant-token-cost.util';
import type {
  DocsAssistantLlmStage,
  DocsAssistantLlmUsageRecord,
  DocsAssistantLlmUsageTotals,
} from './docs-assistant-llm-usage.model';

export class DocsAssistantLlmUsageTracker {
  private readonly records: DocsAssistantLlmUsageRecord[] = [];
  private readonly pricingOverrides: Record<string, ModelTokenPricingUsdPer1M> | null;

  constructor(pricingJson: string | undefined) {
    this.pricingOverrides = parseDocsAssistantModelPricingJson(pricingJson);
  }

  record(
    stage: DocsAssistantLlmStage,
    model: string,
    usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined,
  ): void {
    if (!usage) {
      return;
    }

    const promptTokens = usage.prompt_tokens ?? 0;
    const completionTokens = usage.completion_tokens ?? 0;
    if (promptTokens === 0 && completionTokens === 0) {
      return;
    }

    this.records.push({
      stage,
      model: model.trim(),
      promptTokens,
      completionTokens,
      totalTokens: usage.total_tokens ?? promptTokens + completionTokens,
    });
  }

  getTotals(): DocsAssistantLlmUsageTotals | null {
    if (this.records.length === 0) {
      return null;
    }

    const promptTokens = this.records.reduce((sum, row) => sum + row.promptTokens, 0);
    const completionTokens = this.records.reduce((sum, row) => sum + row.completionTokens, 0);

    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      estimatedCostUsd: estimateLlmUsageCostUsd(this.records, this.pricingOverrides),
      byStage: [...this.records],
    };
  }
}
