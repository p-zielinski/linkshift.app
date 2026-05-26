import {
  buildDocRouteLookup,
  normalizeDocsMarkdownLinks,
} from './docs-markdown-links.util';

const PAGES = [
  {
    sourcePath: 'shared/docs/pages/overview.md',
    route: '/docs',
  },
  {
    sourcePath: 'shared/docs/pages/guides/getting-started.md',
    route: '/docs/guides/getting-started',
  },
  {
    sourcePath: 'shared/docs/pages/intro/what-is-linkshift.md',
    route: '/docs/intro/what-is-linkshift',
  },
];

describe('docs-markdown-links.util', () => {
  const lookup = buildDocRouteLookup(PAGES);

  it('resolves relative links from overview', () => {
    const input = 'Read [intro](./intro/what-is-linkshift.md) and [start](./guides/getting-started.md).';
    const output = normalizeDocsMarkdownLinks(
      input,
      lookup,
      'shared/docs/pages/overview.md',
    );

    expect(output).toContain('](/docs/intro/what-is-linkshift)');
    expect(output).toContain('](/docs/guides/getting-started)');
  });

  it('resolves parent-relative links from guides', () => {
    const input = 'See [overview](../overview.md#troubleshooting-matrix-live-redirects).';
    const output = normalizeDocsMarkdownLinks(
      input,
      lookup,
      'shared/docs/pages/guides/getting-started.md',
    );

    expect(output).toContain('](/docs#troubleshooting-matrix-live-redirects)');
  });

  it('leaves external and in-app links unchanged', () => {
    const input =
      '[API](https://example.com) and [docs](/docs/reference) and [repo](backend/docs/x.md).';
    const output = normalizeDocsMarkdownLinks(
      input,
      lookup,
      'shared/docs/pages/overview.md',
    );

    expect(output).toBe(input);
  });
});
