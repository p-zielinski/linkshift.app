export type DocsAssistantLlmStage = 'router' | 'generator';

export type DocsAssistantLlmUsageRecord = {
  stage: DocsAssistantLlmStage;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type DocsAssistantLlmUsageTotals = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  byStage: DocsAssistantLlmUsageRecord[];
};
