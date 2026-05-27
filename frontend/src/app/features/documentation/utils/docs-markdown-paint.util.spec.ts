import { shouldRewriteDocsMarkdownDom } from './docs-markdown-paint.util';

describe('docs-markdown-paint.util', () => {
  const htmlA = '<h1 id="a">Page A</h1>';
  const htmlB = '<h1 id="b">Page B</h1>';

  it('skips when html was already painted', () => {
    expect(shouldRewriteDocsMarkdownDom(htmlA, htmlA, htmlA)).toBe(false);
  });

  it('skips hydration when prerendered dom matches next html', () => {
    expect(shouldRewriteDocsMarkdownDom(htmlA, '', htmlA)).toBe(false);
  });

  it('rewrites when route changes and dom still shows previous page', () => {
    expect(shouldRewriteDocsMarkdownDom(htmlB, htmlA, htmlA)).toBe(true);
  });

  it('rewrites when dom is empty', () => {
    expect(shouldRewriteDocsMarkdownDom(htmlA, '', '')).toBe(true);
  });
});
