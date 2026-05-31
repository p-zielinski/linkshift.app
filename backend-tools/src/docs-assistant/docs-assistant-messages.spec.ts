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
      `${DOCS_ASSISTANT_UNKNOWN_IN_DOCS_LEAD}\n\nTry rephrasing with a specific feature and where you are working (for example redirect rules in the dashboard, or \`POST /api/v1/redirect-rules\` if you are automating), or the exact setup step you are stuck on.`,
    );
  });
});
