import {
  DOCS_ANCHOR_SCROLL_OFFSET_NARROW_PX,
  DOCS_ANCHOR_SCROLL_OFFSET_WIDE_PX,
  findDocsAnchorElement,
  findDocsScrolledElements,
  findDocsScrollContainer,
  parseDocsFragment,
  readDocsAnchorScrollOffsetPx,
  isDocsScrollAtTop,
  scrollDocsAnchorElement,
  scrollDocsMainBodyToTop,
  scrollDocsPageToTop,
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

  it('does not resolve a global id outside the provided content root', () => {
    const other = document.createElement('h2');
    other.id = 'shared-id';
    document.body.append(other);

    const root = document.createElement('article');
    root.innerHTML = '<p>No anchor here</p>';

    expect(findDocsAnchorElement('shared-id', root)).toBeNull();

    other.remove();
  });

  it('returns null until anchor exists in content root', () => {
    const root = document.createElement('article');
    root.innerHTML = '<p>Loading…</p>';

    expect(findDocsAnchorElement('late-anchor', root)).toBeNull();

    root.innerHTML = '<h2 id="late-anchor">Late anchor</h2>';

    expect(findDocsAnchorElement('late-anchor', root)?.id).toBe('late-anchor');
  });

  it('uses fixed px offsets per viewport', () => {
    expect(DOCS_ANCHOR_SCROLL_OFFSET_WIDE_PX).toBe(15);
    expect(DOCS_ANCHOR_SCROLL_OFFSET_NARROW_PX).toBe(70);
    expect(readDocsAnchorScrollOffsetPx()).toBe(15);
  });

  it('prefers registered scroll container when it contains the target', () => {
    const registered = document.createElement('div');
    const inner = document.createElement('div');
    const target = document.createElement('h2');
    registered.append(inner, target);
    document.body.append(registered);

    expect(findDocsScrollContainer(target, registered)).toBe(registered);

    registered.remove();
  });

  it('scrolls scrollport via explicit scrollTop math', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollTop', {
      writable: true,
      value: 0,
    });
    Object.defineProperty(container, 'scrollHeight', { value: 2000 });
    Object.defineProperty(container, 'clientHeight', { value: 500 });
    container.getBoundingClientRect = () =>
      ({
        top: 80,
        left: 0,
        width: 100,
        height: 500,
        bottom: 580,
        right: 100,
      }) as DOMRect;
    container.scrollTo = ((options?: ScrollToOptions) => {
      container.scrollTop = options?.top ?? 0;
    }) as typeof container.scrollTo;

    const target = document.createElement('h2');
    target.getBoundingClientRect = () =>
      ({
        top: 480,
        left: 0,
        width: 100,
        height: 24,
        bottom: 504,
        right: 100,
      }) as DOMRect;

    container.append(target);
    document.body.append(container);

    const result = scrollDocsAnchorElement(target, container);

    expect(container.scrollTop).toBe(385);
    expect(result.scrollTopAfter).toBe(385);
    expect(result.scrolled).toBe(true);
    expect(result.offsetPx).toBe(15);

    container.remove();
  });

  it('does not call scrollIntoView on the heading', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollTop', { writable: true, value: 0 });
    Object.defineProperty(container, 'scrollHeight', { value: 2000 });
    Object.defineProperty(container, 'clientHeight', { value: 500 });
    container.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        width: 100,
        height: 500,
        bottom: 500,
        right: 100,
      }) as DOMRect;
    container.scrollTo = ((options?: ScrollToOptions) => {
      container.scrollTop = options?.top ?? 0;
    }) as typeof container.scrollTo;

    const target = document.createElement('h2');
    target.getBoundingClientRect = () =>
      ({
        top: 400,
        left: 0,
        width: 100,
        height: 24,
        bottom: 424,
        right: 100,
      }) as DOMRect;
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;
    container.append(target);

    scrollDocsAnchorElement(target, container);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('skips scroll when docs main body is already at the top', () => {
    const body = document.createElement('div');
    body.className = 'docs-main-body-scroll';
    Object.defineProperty(body, 'scrollTop', { writable: true, value: 0 });
    document.body.append(body);

    expect(isDocsScrollAtTop(body)).toBe(true);

    const result = scrollDocsMainBodyToTop(body);
    expect(result.skipped).toBe(true);
    expect(result.targets).toHaveLength(0);

    body.remove();
  });

  it('ignores sidebar scroll when collecting scrolled elements', () => {
    const shell = document.createElement('div');
    shell.className = 'docs-shell';

    const sidebar = document.createElement('mat-sidenav');
    sidebar.className = 'docs-sidebar mat-drawer';
    const sidebarScroll = document.createElement('div');
    sidebarScroll.className = 'docs-sidebar-nav-scroll';
    Object.defineProperty(sidebarScroll, 'scrollTop', { writable: true, value: 500 });
    sidebar.append(sidebarScroll);

    const sidenavContent = document.createElement('mat-sidenav-content');
    sidenavContent.className = 'mat-sidenav-content mat-drawer-content';
    Object.defineProperty(sidenavContent, 'scrollTop', { writable: true, value: 120 });

    shell.append(sidebar, sidenavContent);
    document.body.append(shell);

    const scrolled = findDocsScrolledElements(shell);

    expect(scrolled).toContain(sidenavContent);
    expect(scrolled).not.toContain(sidebarScroll);

    shell.remove();
  });

  it('resets main body scroll but preserves sidebar scroll position', () => {
    const shell = document.createElement('div');
    shell.className = 'docs-shell';

    const sidebar = document.createElement('mat-sidenav');
    sidebar.className = 'docs-sidebar mat-drawer';
    const sidebarScroll = document.createElement('div');
    sidebarScroll.className = 'docs-sidebar-nav-scroll';
    Object.defineProperty(sidebarScroll, 'scrollTop', { writable: true, value: 500 });
    sidebar.append(sidebarScroll);

    const mainBody = document.createElement('div');
    mainBody.className = 'docs-main-body-scroll';
    Object.defineProperty(mainBody, 'scrollTop', { writable: true, value: 420 });
    Object.defineProperty(mainBody, 'scrollHeight', { value: 2000 });
    Object.defineProperty(mainBody, 'clientHeight', { value: 500 });
    mainBody.scrollTo = ((options?: ScrollToOptions) => {
      mainBody.scrollTop = options?.top ?? 0;
    }) as typeof mainBody.scrollTo;

    shell.append(sidebar, mainBody);
    document.body.append(shell);

    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    scrollDocsMainBodyToTop(mainBody);

    expect(mainBody.scrollTop).toBe(0);
    expect(sidebarScroll.scrollTop).toBe(500);
    expect(scrollTo).not.toHaveBeenCalled();

    scrollTo.mockRestore();
    shell.remove();
  });

  it('scrolls only the docs main body, not window', () => {
    const mainBody = document.createElement('div');
    mainBody.className = 'docs-main-body-scroll';
    Object.defineProperty(mainBody, 'scrollTop', { writable: true, value: 420 });
    Object.defineProperty(mainBody, 'scrollHeight', { value: 2000 });
    Object.defineProperty(mainBody, 'clientHeight', { value: 500 });
    mainBody.scrollTo = ((options?: ScrollToOptions) => {
      mainBody.scrollTop = options?.top ?? 0;
    }) as typeof mainBody.scrollTo;

    document.body.append(mainBody);

    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 180 });

    const result = scrollDocsMainBodyToTop(mainBody);

    expect(result.skipped).toBe(false);
    expect(mainBody.scrollTop).toBe(0);
    expect(result.targets).toHaveLength(1);
    expect(scrollTo).not.toHaveBeenCalled();

    scrollTo.mockRestore();
    mainBody.remove();
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
