import {
  normalizeDocsAssistantSourceRoute,
  parseDocsAssistantSource,
} from './docs-assistant-source.util';

describe('normalizeDocsAssistantSourceRoute', () => {
  it('rewrites legacy dashboard guide paths to manifest routes', () => {
    expect(
      normalizeDocsAssistantSourceRoute('/docs/guides/dashboard/domain-groups-in-dashboard'),
    ).toBe('/docs/guides/domain-groups-in-dashboard');
  });

  it('leaves other docs paths unchanged', () => {
    expect(normalizeDocsAssistantSourceRoute('/docs/guides/link-maps')).toBe('/docs/guides/link-maps');
  });
});

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

  it('normalizes legacy dashboard guide paths in citations', () => {
    const result = parseDocsAssistantSource(
      'Guide: Domain groups (/docs/guides/dashboard/domain-groups-in-dashboard)',
    );

    expect(result.route).toBe('/docs/guides/domain-groups-in-dashboard');
  });
});
