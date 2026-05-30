import { injectHeadingIdsInHtml } from './docs-markdown-html.util';

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
});
