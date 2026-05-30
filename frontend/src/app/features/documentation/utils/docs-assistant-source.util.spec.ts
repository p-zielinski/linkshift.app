import { parseDocsAssistantSource } from './docs-assistant-source.util';

describe('parseDocsAssistantSource', () => {
  it('extracts route from parenthesized docs path', () => {
    const result = parseDocsAssistantSource(
      'Guide: Getting started (/docs/guides/getting-started)',
    );

    expect(result.route).toBe('/docs/guides/getting-started');
    expect(result.label).toBe('Guide: Getting started');
  });

  it('returns null route when path is missing', () => {
    const result = parseDocsAssistantSource('API reference: Domain Groups');

    expect(result.route).toBeNull();
    expect(result.label).toBe('API reference: Domain Groups');
  });
});
