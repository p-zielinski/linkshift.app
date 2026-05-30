import {
  DOCS_ASSISTANT_DEFAULT_MODEL_PRICING_USD_PER_1M,
  estimateLlmUsageCostUsd,
  parseDocsAssistantModelPricingJson,
  resolveModelTokenPricingUsdPer1M,
  roundEstimatedCostUsd,
} from './docs-assistant-token-cost.util';

describe('docs-assistant-token-cost.util', () => {
  it('parses valid model pricing JSON', () => {
    const parsed = parseDocsAssistantModelPricingJson(
      '{"gpt-5.4-nano":{"input":0.2,"output":0.5}}',
    );

    expect(parsed).toEqual({
      'gpt-5.4-nano': { input: 0.2, output: 0.5 },
    });
  });

  it('returns null for invalid pricing JSON', () => {
    expect(parseDocsAssistantModelPricingJson('not-json')).toBeNull();
    expect(parseDocsAssistantModelPricingJson('[]')).toBeNull();
    expect(parseDocsAssistantModelPricingJson('{"m":{"input":-1,"output":1}}')).toBeNull();
  });

  it('resolves known model pricing with override precedence', () => {
    const overrides = { 'gpt-5.4-mini': { input: 9, output: 9 } };

    expect(resolveModelTokenPricingUsdPer1M('gpt-5.4-mini', overrides)).toEqual(overrides['gpt-5.4-mini']);
    expect(resolveModelTokenPricingUsdPer1M('gpt-5.4-nano', overrides)).toEqual(
      DOCS_ASSISTANT_DEFAULT_MODEL_PRICING_USD_PER_1M['gpt-5.4-nano'],
    );
  });

  it('estimates cost from prompt and completion tokens', () => {
    const cost = estimateLlmUsageCostUsd([
      {
        stage: 'router',
        model: 'gpt-5.4-nano',
        promptTokens: 1_000_000,
        completionTokens: 0,
        totalTokens: 1_000_000,
      },
      {
        stage: 'generator',
        model: 'gpt-5.4-mini',
        promptTokens: 0,
        completionTokens: 1_000_000,
        totalTokens: 1_000_000,
      },
    ]);

    expect(cost).toBe(1.1);
  });

  it('rounds estimated USD to six decimal places', () => {
    expect(roundEstimatedCostUsd(0.123456789)).toBe(0.123457);
  });
});
