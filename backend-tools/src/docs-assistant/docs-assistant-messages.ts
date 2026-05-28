/** Lead sentence when docs context does not support a confident answer. */
export const DOCS_ASSISTANT_UNKNOWN_IN_DOCS_LEAD =
  "I don't have enough in the official LinkShift documentation to answer that confidently.";

export function buildUnknownInDocsAnswer(sourcesChecked: string[] = []): string {
  const lines = [DOCS_ASSISTANT_UNKNOWN_IN_DOCS_LEAD];

  if (sourcesChecked.length > 0) {
    lines.push('', 'I checked these docs sections:', ...sourcesChecked.map((source) => `- ${source}`));
  }

  lines.push(
    '',
    'Try rephrasing with a specific feature (redirect rules, link maps, domain groups), an API method and path (for example `GET /api/v1/redirect-rules`), or the setup step you are stuck on.',
  );

  return lines.join('\n');
}
