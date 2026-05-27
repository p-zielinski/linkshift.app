import {
  findDocsAnchorElement,
  isDocsSiteMobileViewport,
  measureDocsAnchorScrollMarginTop,
  measureDocsAnchorScrollOffset,
  measureDocsStickyChromeBottom,
  parseDocsFragment,
  scrollDocsAnchorElement,
} from './docs-scroll.util';
import { buildDocsMarkdownHtml } from './docs-markdown-html.util';

describe('docs-scroll.util', () => {
  it('parses hash fragments', () => {
    expect(parseDocsFragment('#conditional-routing-syntax')).toBe(
      'conditional-routing-syntax',
    );
  });

  it('finds anchors inside markdown content root', () => {
    const root = document.createElement('article');
    root.innerHTML = '<h2 id="conditional-routing-syntax">Conditional routing syntax</h2>';

    const target = findDocsAnchorElement('conditional-routing-syntax', root);

    expect(target?.textContent).toContain('Conditional routing syntax');
  });

  it('finds anchors with double-hyphen github ids via getElementById', () => {
    const root = document.createElement('article');
    const html = buildDocsMarkdownHtml('## Link maps + redirect rules');
    root.innerHTML = html;

    const target = findDocsAnchorElement('link-maps--redirect-rules', root);

    expect(target?.id).toBe('link-maps--redirect-rules');
  });

  it('returns null until anchor exists in content root', () => {
    const root = document.createElement('article');
    root.innerHTML = '<p>Loading…</p>';

    expect(findDocsAnchorElement('late-anchor', root)).toBeNull();

    root.innerHTML = '<h2 id="late-anchor">Late anchor</h2>';

    expect(findDocsAnchorElement('late-anchor', root)?.id).toBe('late-anchor');
  });

  it('accounts for site toolbar when scroll container starts below it', () => {
    const siteToolbar = document.createElement('mat-toolbar');
    siteToolbar.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        width: 100,
        height: 64,
        bottom: 64,
        right: 100,
      }) as DOMRect;

    const host = document.createElement('app-documentation-site-shell');
    host.append(siteToolbar);
    document.body.append(host);

    const container = document.createElement('div');
    container.getBoundingClientRect = () =>
      ({
        top: 64,
        left: 0,
        width: 100,
        height: 500,
        bottom: 564,
        right: 100,
      }) as DOMRect;

    const heading = document.createElement('h2');

    expect(measureDocsStickyChromeBottom()).toBe(64);
    expect(measureDocsAnchorScrollOffset(heading, container)).toBe(30);

    host.remove();
  });

  it('accounts for site toolbar overlaying scroll container top', () => {
    const siteToolbar = document.createElement('mat-toolbar');
    siteToolbar.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        width: 100,
        height: 64,
        bottom: 64,
        right: 100,
      }) as DOMRect;

    const host = document.createElement('app-documentation-site-shell');
    host.append(siteToolbar);
    document.body.append(host);

    const container = document.createElement('div');
    container.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        width: 100,
        height: 500,
        bottom: 500,
        right: 100,
      }) as DOMRect;

    const heading = document.createElement('h2');

    expect(measureDocsAnchorScrollOffset(heading, container)).toBe(94);

    host.remove();
  });

  it('includes gap when measuring scroll offset from scroll-margin', () => {
    const heading = document.createElement('h2');
    heading.style.scrollMarginTop = '90px';
    document.body.append(heading);

    expect(measureDocsAnchorScrollOffset(heading)).toBe(90);

    heading.remove();
  });

  it('computes scroll-margin from toolbar overlapping the scrollport', () => {
    const siteToolbar = document.createElement('mat-toolbar');
    siteToolbar.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        width: 100,
        height: 72,
        bottom: 72,
        right: 100,
      }) as DOMRect;

    const host = document.createElement('app-documentation-site-shell');
    host.append(siteToolbar);
    document.body.append(host);

    const container = document.createElement('div');
    container.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        width: 100,
        height: 500,
        bottom: 500,
        right: 100,
      }) as DOMRect;

    const marginTop = measureDocsAnchorScrollMarginTop(container);

    expect(measureDocsStickyChromeBottom()).toBe(72);
    expect(marginTop).toBe(72 + (isDocsSiteMobileViewport() ? 10 : 16));

    host.remove();
  });

  it('scrolls via scrollIntoView with temporary scroll-margin on the heading', () => {
    const container = document.createElement('div');
    container.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        width: 100,
        height: 500,
        bottom: 500,
        right: 100,
      }) as DOMRect;

    const target = document.createElement('h2');
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;

    scrollDocsAnchorElement(target, container);

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' });
    expect(target.style.scrollMarginTop).toBe('');
  });

  it('falls back to window scroll when no scroll container is provided', () => {
    const target = document.createElement('h2');
    target.getBoundingClientRect = () =>
      ({
        top: 200,
        left: 0,
        width: 100,
        height: 24,
        bottom: 224,
        right: 100,
      }) as DOMRect;
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    scrollDocsAnchorElement(target, null);

    expect(scrollTo).toHaveBeenCalled();
    scrollTo.mockRestore();
  });
});
