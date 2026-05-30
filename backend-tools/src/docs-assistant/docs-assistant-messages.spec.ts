import { buildUnknownInDocsAnswer, DOCS_ASSISTANT_UNKNOWN_IN_DOCS_LEAD } from './docs-assistant-messages';

describe('docs-assistant-messages', () => {
  it('builds unknown answer with sources and rephrase hints', () => {
    const answer = buildUnknownInDocsAnswer(['Guide: Link maps (/docs/guides/link-maps)']);

    expect(answer).toContain(DOCS_ASSISTANT_UNKNOWN_IN_DOCS_LEAD);
    expect(answer).toContain('Guide: Link maps (/docs/guides/link-maps)');
    expect(answer).toContain('Try rephrasing');
  });

  it('builds unknown answer without sources list when none were checked', () => {
    const answer = buildUnknownInDocsAnswer();

    expect(answer).toBe(
      `${DOCS_ASSISTANT_UNKNOWN_IN_DOCS_LEAD}\n\nTry rephrasing with a specific feature (redirect rules, link maps, domain groups), an API method and path (for example \`GET /api/v1/redirect-rules\`), or the setup step you are stuck on.`,
    );
  });
});
