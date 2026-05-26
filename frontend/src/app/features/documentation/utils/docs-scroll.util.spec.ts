import {
  findDocsAnchorElement,
  measureDocsAnchorScrollOffset,
  parseDocsFragment,
  scrollDocsAnchorElement,
} from './docs-scroll.util';

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

  it('returns null until anchor exists in content root', () => {
    const root = document.createElement('article');
    root.innerHTML = '<p>Loading…</p>';

    expect(findDocsAnchorElement('late-anchor', root)).toBeNull();

    root.innerHTML = '<h2 id="late-anchor">Late anchor</h2>';

    expect(findDocsAnchorElement('late-anchor', root)?.id).toBe('late-anchor');
  });

  it('includes gap when measuring scroll offset from scroll-margin', () => {
    const heading = document.createElement('h2');
    heading.style.scrollMarginTop = '90px';
    document.body.append(heading);

    expect(measureDocsAnchorScrollOffset(heading)).toBe(90);

    heading.remove();
  });

  it('scrolls with offset inside a scroll container', () => {
    const container = document.createElement('div');
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo as unknown as typeof container.scrollTo;
    container.getBoundingClientRect = () =>
      ({
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        bottom: 100,
        right: 100,
      }) as DOMRect;

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
    target.style.scrollMarginTop = '50px';

    scrollDocsAnchorElement(target, container);

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        top: 150,
        behavior: 'auto',
      }),
    );
  });
});
