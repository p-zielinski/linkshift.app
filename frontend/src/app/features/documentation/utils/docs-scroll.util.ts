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

export const DOCS_PAGE_TOP_ELEMENT_ID = 'docs-page-top';

export function isDocsScrollAtTop(preferred: HTMLElement | null): boolean {
  if (typeof window !== 'undefined' && window.scrollY > DOCS_SCROLL_TOP_EPSILON_PX) {
    return false;
  }

  if (
    typeof document !== 'undefined' &&
    document.documentElement.scrollTop > DOCS_SCROLL_TOP_EPSILON_PX
  ) {
    return false;
  }

  const shell = findDocsShellRoot();
  const container =
    preferred ??
    shell?.querySelector<HTMLElement>('mat-sidenav-content.mat-sidenav-content') ??
    null;

  if (container && container.scrollTop > DOCS_SCROLL_TOP_EPSILON_PX) {
    return false;
  }

  for (const element of findDocsScrolledElements(shell)) {
    if (element.scrollTop > DOCS_SCROLL_TOP_EPSILON_PX) {
      return false;
    }
  }

  return true;
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

/** scrollIntoView picks the correct scrollport (works when scrollTop on sidenav reads 0). */
export function scrollDocsPageTopIntoView(
  behavior: ScrollBehavior = 'auto',
  scrollport?: HTMLElement | null,
): boolean {
  const anchor = findDocsPageTopElement();
  if (!anchor) {
    return false;
  }

  if (scrollport && scrollport.scrollTop <= DOCS_SCROLL_TOP_EPSILON_PX) {
    const scrollportTop = scrollport.getBoundingClientRect().top;
    const anchorTop = anchor.getBoundingClientRect().top;
    if (Math.abs(anchorTop - scrollportTop) <= readDocsAnchorScrollOffsetPx() + DOCS_SCROLL_TOP_EPSILON_PX) {
      return false;
    }
  }

  anchor.scrollIntoView({ block: 'start', inline: 'nearest', behavior });
  return true;
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

/** Reset window, active scrollers, and scroll the page-top anchor into view. */
export function scrollDocsPageToTop(
  preferred: HTMLElement | null,
  options?: DocsScrollToTopOptions,
): DocsScrollResetResult {
  const behavior = options?.behavior ?? 'smooth';
  const emptyResult = {
    skipped: true,
    windowBefore: 0,
    windowAfter: 0,
    targets: [] as DocsScrollResetTarget[],
  };

  if (isDocsScrollAtTop(preferred)) {
    return emptyResult;
  }

  const targets: DocsScrollResetTarget[] = [];
  let windowBefore = 0;
  let windowAfter = 0;

  if (typeof window !== 'undefined') {
    windowBefore = window.scrollY;
    if (windowBefore > DOCS_SCROLL_TOP_EPSILON_PX) {
      window.scrollTo({ top: 0, behavior });
    }
    scrollElementToTop(document.documentElement, behavior);
    scrollElementToTop(document.body, behavior);
    windowAfter = window.scrollY;
  }

  const shell = findDocsShellRoot();
  const seen = new Set<HTMLElement>();

  const addTarget = (element: HTMLElement | null | undefined) => {
    if (!element || seen.has(element) || element.scrollTop <= DOCS_SCROLL_TOP_EPSILON_PX) {
      return;
    }

    seen.add(element);
    const before = element.scrollTop;
    scrollElementToTop(element, behavior);
    targets.push({
      label: describeDocsScrollElement(element),
      before,
      after: element.scrollTop,
    });
  };

  addTarget(preferred);

  for (const element of findDocsScrolledElements(shell)) {
    addTarget(element);
  }

  const scrollport =
    preferred ??
    shell?.querySelector<HTMLElement>('mat-sidenav-content.mat-sidenav-content') ??
    null;

  const pageTopScrolled = scrollDocsPageTopIntoView(behavior, scrollport);
  if (pageTopScrolled) {
    targets.push({
      label: '#docs-page-top.scrollIntoView',
      before: -1,
      after: 0,
    });
  }

  return { skipped: false, windowBefore, windowAfter, targets };
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
