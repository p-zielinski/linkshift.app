import {
  DOCS_ASSISTANT_LOG_RETENTION_DAYS,
  resolveDocsAssistantLogRetentionCutoff,
} from './docs-assistant-log-retention.util';

describe('docs-assistant-log-retention.util', () => {
  it('uses a 90-day retention window by default', () => {
    expect(DOCS_ASSISTANT_LOG_RETENTION_DAYS).toBe(90);
  });

  it('returns midnight UTC cutoff 90 days before the reference date', () => {
    const referenceDate = new Date('2026-06-08T15:42:11.123Z');
    const cutoff = resolveDocsAssistantLogRetentionCutoff(referenceDate);

    expect(cutoff.toISOString()).toBe('2026-03-10T00:00:00.000Z');
  });

  it('supports custom retention day overrides', () => {
    const referenceDate = new Date('2026-01-15T08:00:00.000Z');
    const cutoff = resolveDocsAssistantLogRetentionCutoff(referenceDate, 30);

    expect(cutoff.toISOString()).toBe('2025-12-16T00:00:00.000Z');
  });
});
