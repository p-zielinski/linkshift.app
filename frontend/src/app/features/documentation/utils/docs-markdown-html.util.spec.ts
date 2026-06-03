import {
  buildDocsMarkdownHtml,
  injectHeadingIdsInHtml,
  preprocessCustomDirectiveBlocks,
} from './docs-markdown-html.util';

describe('docs-markdown-html.util', () => {
  it('injects heading ids into html strings', () => {
    const html = '<h2>Destinations are static URLs</h2>';
    const withIds = injectHeadingIdsInHtml(html);

    expect(withIds).toContain('id="destinations-are-static-urls"');
    expect(withIds).toContain('Destinations are static URLs');
  });

  it('does not duplicate ids when already present', () => {
    const html =
      '<h2 id="destinations-are-static-urls">Destinations are static URLs</h2>';
    const withIds = injectHeadingIdsInHtml(html);

    expect(withIds.match(/id="/g)?.length).toBe(1);
  });

  describe('custom directive blocks', () => {
    it('renders warning infobox as semantic aside with type class', () => {
      const markdown = `Intro paragraph.

:::warning
Your plan limit applies here.
:::

Next paragraph.`;

      const html = buildDocsMarkdownHtml(markdown);

      expect(html).toContain(
        '<aside class="docs-infobox docs-infobox--warning" role="note">',
      );
      expect(html).toContain('Your plan limit applies here.');
      expect(html).toContain('</aside>');
      expect(html).toContain('<p>Intro paragraph.</p>');
    });

    it('renders success, error, and info infobox variants', () => {
      const markdown = `:::success
Rule saved.
:::

:::error
Domain must be verified.
:::

:::info
Optional context for authors.
:::`;

      const html = buildDocsMarkdownHtml(markdown);

      expect(html).toContain('docs-infobox--success');
      expect(html).toContain('docs-infobox--error');
      expect(html).toContain('docs-infobox--info');
      expect(html).toContain('Rule saved.');
      expect(html).toContain('Domain must be verified.');
    });

    it('parses markdown inside infobox bodies', () => {
      const markdown = `:::warning
**Bold** and a list:

- one
- two
:::`;

      const html = buildDocsMarkdownHtml(markdown);

      expect(html).toContain('<strong>Bold</strong>');
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>one</li>');
    });

    it('keeps ai-hidden blocks in the DOM with hidden class', () => {
      const markdown = `Visible intro.

:::ai-hidden
Secret routing hint for retrieval.
:::

:::ai-only
Longer context block only for ingestion.
:::`;

      const html = buildDocsMarkdownHtml(markdown);

      expect(html).toContain('class="docs-ai-hidden"');
      expect(html).toContain('data-docs-ai-block="ai-hidden"');
      expect(html).toContain('data-docs-ai-block="ai-only"');
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('Secret routing hint for retrieval.');
      expect(html).toContain('Longer context block only for ingestion.');
      expect(html).toContain('<p>Visible intro.</p>');
    });

    it('renders empty infobox bodies without throwing', () => {
      const markdown = `:::warning
:::`;

      const html = buildDocsMarkdownHtml(markdown);

      expect(html).toContain('docs-infobox--warning');
      expect(html).toContain('</aside>');
    });

    it('leaves unknown directive fences unchanged for authors to spot', () => {
      const markdown = `:::tip
Not a supported type.
:::`;

      const preprocessed = preprocessCustomDirectiveBlocks(markdown);

      expect(preprocessed).toContain(':::tip');
      expect(preprocessed).not.toContain('docs-infobox');
    });

    it('does not treat nested directive fences as separate blocks', () => {
      const markdown = `:::warning
outer
:::info
inner
:::
:::`;

      const html = buildDocsMarkdownHtml(markdown);

      expect(html).toContain('docs-infobox--warning');
      expect(html).not.toContain('docs-infobox--info');
      expect(html).toContain(':::info');
    });

    it('does not render hidden-on-purpose fenced blocks', () => {
      const markdown = `Public line.

:::hidden-on-purpose
**UNMETERED** internal tier note.
:::

Another public line.`;

      const html = buildDocsMarkdownHtml(markdown);

      expect(html).toContain('Public line');
      expect(html).toContain('Another public line');
      expect(html).not.toContain('UNMETERED');
      expect(html).not.toContain('hidden-on-purpose');
    });

    it('preprocesses multiple directive blocks in one pass', () => {
      const markdown = `:::warning
First warning.
:::

:::ai-hidden
Hidden note.
:::`;

      const preprocessed = preprocessCustomDirectiveBlocks(markdown);

      expect(preprocessed).toContain('docs-infobox--warning');
      expect(preprocessed).toContain('docs-ai-hidden');
      expect(preprocessed).not.toContain(':::warning');
      expect(preprocessed).not.toContain(':::ai-hidden');
    });
  });
});
