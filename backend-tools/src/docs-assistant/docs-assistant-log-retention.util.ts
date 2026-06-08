export const DOCS_ASSISTANT_LOG_RETENTION_DAYS = 90;

export function resolveDocsAssistantLogRetentionCutoff(
  referenceDate: Date,
  retentionDays = DOCS_ASSISTANT_LOG_RETENTION_DAYS,
): Date {
  const cutoff = new Date(referenceDate);
  cutoff.setUTCDate(cutoff.getUTCDate() - retentionDays);
  cutoff.setUTCHours(0, 0, 0, 0);
  return cutoff;
}
