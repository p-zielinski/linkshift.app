import type { DocsAssistantLlmUsageRecord } from './docs-assistant-llm-usage.model';

export type ModelTokenPricingUsdPer1M = {
  input: number;
  output: number;
};

/** Defaults for docs-assistant models; override via DOCS_ASSISTANT_MODEL_PRICING_JSON. */
export const DOCS_ASSISTANT_DEFAULT_MODEL_PRICING_USD_PER_1M: Record<string, ModelTokenPricingUsdPer1M> =
  {
    'gpt-5.4-nano': { input: 0.1, output: 0.4 },
    'gpt-5.4-mini': { input: 0.25, output: 1.0 },
  };

export const DOCS_ASSISTANT_FALLBACK_PRICING_USD_PER_1M: ModelTokenPricingUsdPer1M = {
  input: 0.25,
  output: 1.0,
};

export function parseDocsAssistantModelPricingJson(
  raw: string | undefined,
): Record<string, ModelTokenPricingUsdPer1M> | null {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }

  const result: Record<string, ModelTokenPricingUsdPer1M> = {};

  for (const [model, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      continue;
    }

    const input = (value as { input?: unknown }).input;
    const output = (value as { output?: unknown }).output;
    if (typeof input !== 'number' || typeof output !== 'number' || input < 0 || output < 0) {
      continue;
    }

    result[model.trim()] = { input, output };
  }

  return Object.keys(result).length > 0 ? result : null;
}

export function resolveModelTokenPricingUsdPer1M(
  model: string,
  overrides: Record<string, ModelTokenPricingUsdPer1M> | null,
): ModelTokenPricingUsdPer1M {
  const normalized = model.trim();
  return (
    overrides?.[normalized] ??
    DOCS_ASSISTANT_DEFAULT_MODEL_PRICING_USD_PER_1M[normalized] ??
    DOCS_ASSISTANT_FALLBACK_PRICING_USD_PER_1M
  );
}

export function estimateLlmUsageCostUsd(
  records: DocsAssistantLlmUsageRecord[],
  pricingOverrides: Record<string, ModelTokenPricingUsdPer1M> | null = null,
): number {
  let total = 0;

  for (const record of records) {
    const pricing = resolveModelTokenPricingUsdPer1M(record.model, pricingOverrides);
    total +=
      (record.promptTokens / 1_000_000) * pricing.input +
      (record.completionTokens / 1_000_000) * pricing.output;
  }

  return roundEstimatedCostUsd(total);
}

export function roundEstimatedCostUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}
