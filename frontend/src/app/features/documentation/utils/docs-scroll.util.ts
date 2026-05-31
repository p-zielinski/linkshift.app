export function parseDocsFragment(fragment: string): string {
  return decodeURIComponent(fragment.replace(/^#/, '').trim());
}

export function findDocsAnchorElement(
  fragment: string,
  contentRoot?: HTMLElement | null,
): HTMLElement | null {
  const id = parseDocsFragment(fragment);
  if (!id) {
    return null;
  }

  if (contentRoot) {
    return contentRoot.querySelector<HTMLElement>(`[id="${escapeAttrValue(id)}"]`);
  }

  return document.getElementById(id);
}

function escapeAttrValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** Matches docs shell `@media (min-width: 768px)` (Tailwind `md`). */
export const DOCS_ANCHOR_WIDE_MIN_WIDTH_PX = 768;

/** Fixed px — wide screens (small gap below site toolbar). */
export const DOCS_ANCHOR_SCROLL_OFFSET_WIDE_PX = 15;

/** Fixed px — narrow screens (sticky in-drawer toolbar). */
export const DOCS_ANCHOR_SCROLL_OFFSET_NARROW_PX = 70;

const DOCS_SCROLL_MIN_DELTA_PX = 1;

/** Treat as "at top" — avoids micro-jumps from redundant scroll calls. */
export const DOCS_SCROLL_TOP_EPSILON_PX = 2;

export type DocsAnchorScrollResult = {
  scrolled: boolean;
  scrollTopBefore: number;
  scrollTopAfter: number;
  computedNextTop: number;
  offsetPx: number;
  containerTop: number;
  targetTop: number;
  scrollHeight: number;
  clientHeight: number;
};

export function isDocsAnchorWideViewport(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }

  return window.matchMedia(`(min-width: ${DOCS_ANCHOR_WIDE_MIN_WIDTH_PX}px)`).matches;
}

export function readDocsAnchorScrollOffsetPx(): number {
  return isDocsAnchorWideViewport()
    ? DOCS_ANCHOR_SCROLL_OFFSET_WIDE_PX
    : DOCS_ANCHOR_SCROLL_OFFSET_NARROW_PX;
}

function isVerticallyScrollable(element: HTMLElement): boolean {
  const overflowY = getComputedStyle(element).overflowY;
  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') {
    return false;
  }

  return element.scrollHeight > element.clientHeight;
}

/**
 * Prefer the registered docs scrollport when it contains the target; otherwise walk ancestors.
 */
export function findDocsScrollContainer(
  target: HTMLElement,
  registered?: HTMLElement | null,
): HTMLElement | null {
  if (registered?.contains(target)) {
    return registered;
  }

  let node: HTMLElement | null = target.parentElement;
  while (node) {
    if (isVerticallyScrollable(node)) {
      return node;
    }
    node = node.parentElement;
  }

  return registered?.contains(target) ? registered : null;
}

function scrollTargetInContainer(
  target: HTMLElement,
  scrollContainer: HTMLElement,
): DocsAnchorScrollResult {
  const offsetPx = readDocsAnchorScrollOffsetPx();
  const scrollTopBefore = scrollContainer.scrollTop;
  const containerTop = scrollContainer.getBoundingClientRect().top;
  const targetTop = target.getBoundingClientRect().top;
  const computedNextTop = Math.max(
    0,
    scrollTopBefore + (targetTop - containerTop) - offsetPx,
  );

  const alreadyAligned =
    Math.abs(targetTop - containerTop - offsetPx) <= DOCS_SCROLL_MIN_DELTA_PX;

  scrollContainer.scrollTo({ top: computedNextTop, behavior: 'auto' });

  const scrollTopAfter = scrollContainer.scrollTop;

  return {
    scrolled:
      alreadyAligned ||
      Math.abs(scrollTopAfter - scrollTopBefore) > DOCS_SCROLL_MIN_DELTA_PX,
    scrollTopBefore,
    scrollTopAfter,
    computedNextTop,
    offsetPx,
    containerTop,
    targetTop,
    scrollHeight: scrollContainer.scrollHeight,
    clientHeight: scrollContainer.clientHeight,
  };
}

export function scrollDocsAnchorElement(
  target: HTMLElement,
  scrollContainer?: HTMLElement | null,
): DocsAnchorScrollResult {
  const resolved = scrollContainer
    ? findDocsScrollContainer(target, scrollContainer)
    : null;

  if (resolved) {
    return scrollTargetInContainer(target, resolved);
  }

  const offsetPx = readDocsAnchorScrollOffsetPx();
  const scrollTopBefore = window.scrollY;
  const targetTop = target.getBoundingClientRect().top;
  const computedNextTop = Math.max(0, scrollTopBefore + targetTop - offsetPx);
  window.scrollTo({ top: computedNextTop, behavior: 'auto' });
  const scrollTopAfter = window.scrollY;

  return {
    scrolled: Math.abs(scrollTopAfter - scrollTopBefore) > DOCS_SCROLL_MIN_DELTA_PX,
    scrollTopBefore,
    scrollTopAfter,
    computedNextTop,
    offsetPx,
    containerTop: 0,
    targetTop,
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: window.innerHeight,
  };
}

export function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export function findDocsShellRoot(): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.querySelector<HTMLElement>('.docs-shell');
}

/** Docs nav drawer — scroll position must survive route changes. */
export const DOCS_SIDEBAR_SELECTOR = '.docs-sidebar';

/** Scrollable nav list inside the docs sidebar (position preserved on route change). */
export const DOCS_SIDEBAR_NAV_SCROLL_SELECTOR = '.docs-sidebar-nav-scroll';

/** Scrollable docs page body (not the sidebar, not document/window). */
export const DOCS_MAIN_BODY_SCROLL_SELECTOR = '.docs-main-body-scroll';

export const DOCS_MAIN_BODY_SCROLL_ID = 'docs-main-body-scroll';

/** @deprecated Use DOCS_MAIN_BODY_SCROLL_ID */
export const DOCS_MAIN_SCROLL_ID = DOCS_MAIN_BODY_SCROLL_ID;

export function findDocsMainBodyScroller(shell: HTMLElement | null = findDocsShellRoot()): HTMLElement | null {
  const docsShell =
    shell?.classList.contains('docs-shell') ?
      shell
    : (shell?.querySelector<HTMLElement>('.docs-shell') ?? null);

  if (!docsShell) {
    return null;
  }

  return (
    docsShell.querySelector<HTMLElement>(DOCS_MAIN_BODY_SCROLL_SELECTOR) ??
    document.getElementById(DOCS_MAIN_BODY_SCROLL_ID)
  );
}

/** @deprecated Use findDocsMainBodyScroller */
export function findDocsMainContentRoot(shell: HTMLElement | null): HTMLElement | null {
  return findDocsMainBodyScroller(shell);
}

export function findDocsSidebarNavScroller(): HTMLElement | null {
  return findDocsShellRoot()?.querySelector<HTMLElement>(DOCS_SIDEBAR_NAV_SCROLL_SELECTOR) ?? null;
}

export function readDocsSidebarNavScrollTop(): number | null {
  const scroller = findDocsSidebarNavScroller();
  return scroller ? scroller.scrollTop : null;
}

export function restoreDocsSidebarNavScrollTop(scrollTop: number | null): void {
  if (scrollTop === null) {
    return;
  }

  const scroller = findDocsSidebarNavScroller();
  if (scroller) {
    scroller.scrollTop = scrollTop;
  }
}

export function isInsideDocsSidebar(element: HTMLElement): boolean {
  return element.closest(DOCS_SIDEBAR_SELECTOR) !== null;
}

/** Docs site shell locks document scroll; only the main column should reset. */
export function isDocsSiteScrollLocked(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  if (document.body.style.overflow === 'hidden') {
    return true;
  }

  return getComputedStyle(document.body).overflowY === 'hidden';
}

export const DOCS_PAGE_TOP_ELEMENT_ID = 'docs-page-top';

export function isDocsMainBodyAtTop(body: HTMLElement | null): boolean {
  if (!body) {
    return true;
  }

  return body.scrollTop <= DOCS_SCROLL_TOP_EPSILON_PX;
}

/** @deprecated Use isDocsMainBodyAtTop */
export function isDocsScrollAtTop(preferred: HTMLElement | null): boolean {
  const body = preferred ?? findDocsMainBodyScroller();
  return isDocsMainBodyAtTop(body);
}

export function scrollElementToTop(
  element: HTMLElement,
  behavior: ScrollBehavior = 'auto',
): void {
  if (element.scrollTop <= DOCS_SCROLL_TOP_EPSILON_PX && behavior !== 'smooth') {
    return;
  }

  const previousBehavior = element.style.scrollBehavior;
  element.style.scrollBehavior = 'auto';

  if (behavior === 'smooth') {
    if (typeof element.scrollTo === 'function') {
      element.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } else {
    element.scrollTop = 0;
    if (typeof element.scrollTo === 'function') {
      element.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  element.style.scrollBehavior = previousBehavior;
}

/** Elements that currently hold vertical scroll offset inside docs (and document root). */
export function findDocsScrolledElements(root: HTMLElement | null): HTMLElement[] {
  const scrolled: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();

  const add = (element: HTMLElement | null | undefined) => {
    if (!element || seen.has(element)) {
      return;
    }

    seen.add(element);
    scrolled.push(element);
  };

  if (typeof document !== 'undefined') {
    if (document.documentElement.scrollTop > 0) {
      add(document.documentElement);
    }
    if (document.body.scrollTop > 0) {
      add(document.body);
    }
  }

  if (!root) {
    return scrolled;
  }

  const visit = (node: HTMLElement) => {
    if (isInsideDocsSidebar(node)) {
      return;
    }

    if (node.scrollTop > 0) {
      add(node);
    }

    for (const child of node.children) {
      if (child instanceof HTMLElement) {
        visit(child);
      }
    }
  };

  visit(root);
  return scrolled;
}

export function findDocsPageTopElement(): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.getElementById(DOCS_PAGE_TOP_ELEMENT_ID);
}

export type DocsScrollResetTarget = {
  label: string;
  before: number;
  after: number;
};

export type DocsScrollResetResult = {
  skipped: boolean;
  windowBefore: number;
  windowAfter: number;
  targets: DocsScrollResetTarget[];
};

export type DocsScrollToTopOptions = {
  behavior?: ScrollBehavior;
};

/** Scroll only the docs main body column; never window or sidebar. */
export function scrollDocsMainBodyToTop(
  body: HTMLElement | null,
  options?: DocsScrollToTopOptions,
): DocsScrollResetResult {
  const behavior = options?.behavior ?? 'auto';
  const emptyResult = {
    skipped: true,
    windowBefore: 0,
    windowAfter: 0,
    targets: [] as DocsScrollResetTarget[],
  };

  if (!body || isDocsMainBodyAtTop(body)) {
    return emptyResult;
  }

  const before = body.scrollTop;
  body.scrollTop = 0;

  if (behavior === 'smooth' && typeof body.scrollTo === 'function') {
    body.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (typeof body.scrollTo === 'function') {
    body.scrollTo({ top: 0, behavior: 'auto' });
  }

  return {
    skipped: false,
    windowBefore: 0,
    windowAfter: 0,
    targets: [
      {
        label: describeDocsScrollElement(body),
        before,
        after: body.scrollTop,
      },
    ],
  };
}

/** @deprecated Use scrollDocsMainBodyToTop */
export function scrollDocsPageToTop(
  preferred: HTMLElement | null,
  options?: DocsScrollToTopOptions,
): DocsScrollResetResult {
  const body = preferred ?? findDocsMainBodyScroller();
  return scrollDocsMainBodyToTop(body, options);
}

/** @deprecated Use scrollDocsPageToTop */
export function resetDocsScrollPositions(
  preferred: HTMLElement | null,
  options?: DocsScrollToTopOptions,
): DocsScrollResetResult {
  return scrollDocsPageToTop(preferred, options);
}

function describeDocsScrollElement(element: HTMLElement): string {
  const id = element.id ? `#${element.id}` : '';
  const className = element.className?.toString().trim().split(/\s+/).slice(0, 2).join('.');
  return `${element.tagName.toLowerCase()}${id}${className ? `.${className}` : ''}`;
}
