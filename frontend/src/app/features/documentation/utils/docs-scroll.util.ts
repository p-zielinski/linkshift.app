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

  const byId = document.getElementById(id);
  if (byId) {
    if (!contentRoot || contentRoot.contains(byId)) {
      return byId;
    }
  }

  if (!contentRoot) {
    return null;
  }

  return contentRoot.querySelector<HTMLElement>(`[id="${escapeAttrValue(id)}"]`);
}

function escapeAttrValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

const DOCS_TOOLBAR_SELECTORS = [
  'app-documentation-site-shell mat-toolbar',
  'app-documentation-shell .mat-drawer-content mat-toolbar',
];

/** Matches `MOBILE_BREAKPOINT` in documentation-site-shell (Tailwind `md` = 768px). */
export const DOCS_SITE_MOBILE_MAX_WIDTH_PX = 767;

const DOCS_ANCHOR_GAP_PX = 30;
const DOCS_ANCHOR_OFFSET_FALLBACK_PX = 106;
const DOCS_ANCHOR_MOBILE_EXTRA_GAP_PX = 10;
const DOCS_ANCHOR_DESKTOP_EXTRA_GAP_PX = 16;

export function isDocsSiteMobileViewport(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(`(max-width: ${DOCS_SITE_MOBILE_MAX_WIDTH_PX}px)`).matches;
}

export function measureDocsAnchorExtraGapPx(): number {
  return isDocsSiteMobileViewport()
    ? DOCS_ANCHOR_MOBILE_EXTRA_GAP_PX
    : DOCS_ANCHOR_DESKTOP_EXTRA_GAP_PX;
}

/**
 * scroll-margin-top so scrollIntoView clears sticky chrome overlapping the drawer scrollport.
 * Site toolbar (desktop) sits outside mat-drawer-content; overlap = chrome bottom − container top.
 */
export function measureDocsAnchorScrollMarginTop(scrollContainer: HTMLElement): number {
  const gapPx = measureDocsAnchorExtraGapPx();
  const chromeBottom = measureDocsStickyChromeBottom();
  const containerTop = scrollContainer.getBoundingClientRect().top;
  const overlapPx = chromeBottom - containerTop + gapPx;

  return Math.max(gapPx, overlapPx);
}

/**
 * Bottom edge (viewport coords) of visible docs chrome: site toolbar + in-drawer mobile toolbar.
 */
export function measureDocsStickyChromeBottom(): number {
  let chromeBottom = 0;

  for (const selector of DOCS_TOOLBAR_SELECTORS) {
    for (const element of document.querySelectorAll<HTMLElement>(selector)) {
      const rect = element.getBoundingClientRect();
      if (rect.height <= 0 || rect.bottom <= 0) {
        continue;
      }

      chromeBottom = Math.max(chromeBottom, rect.bottom);
    }
  }

  return chromeBottom;
}

/**
 * Scroll offset inside the docs scroll container so the heading clears sticky toolbars + gap.
 */
export function measureDocsAnchorScrollOffset(
  target: HTMLElement,
  scrollContainer?: HTMLElement | null,
): number {
  const scrollMarginTop = parseFloat(getComputedStyle(target).scrollMarginTop);
  if (Number.isFinite(scrollMarginTop) && scrollMarginTop > 0) {
    return scrollMarginTop;
  }

  const chromeBottom = measureDocsStickyChromeBottom();
  const containerTop = scrollContainer?.getBoundingClientRect().top ?? 0;
  const fromChrome = chromeBottom + DOCS_ANCHOR_GAP_PX - containerTop;

  if (chromeBottom > 0) {
    return Math.max(DOCS_ANCHOR_GAP_PX, fromChrome);
  }

  if (fromChrome > DOCS_ANCHOR_GAP_PX) {
    return fromChrome;
  }

  return DOCS_ANCHOR_OFFSET_FALLBACK_PX;
}

export function resolveDocsAnchorScrollOffset(
  target: HTMLElement,
  scrollContainer?: HTMLElement | null,
): number {
  return measureDocsAnchorScrollOffset(target, scrollContainer);
}

function withTemporaryScrollMarginTop(
  target: HTMLElement,
  marginTopPx: number,
  scroll: () => void,
): void {
  const previous = target.style.scrollMarginTop;
  target.style.scrollMarginTop = `${marginTopPx}px`;

  try {
    scroll();
  } finally {
    if (previous) {
      target.style.scrollMarginTop = previous;
    } else {
      target.style.removeProperty('scroll-margin-top');
    }
  }
}

export function scrollDocsAnchorElement(
  target: HTMLElement,
  scrollContainer?: HTMLElement | null,
): void {
  if (scrollContainer) {
    const marginTopPx = measureDocsAnchorScrollMarginTop(scrollContainer);
    withTemporaryScrollMarginTop(target, marginTopPx, () => {
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
    return;
  }

  const topOffset = measureDocsAnchorScrollOffset(target, null);
  const viewportTop = window.scrollY + target.getBoundingClientRect().top - topOffset;
  window.scrollTo({ top: Math.max(0, viewportTop), behavior: 'auto' });
}

export function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export async function scrollToDocsAnchorWhenReady(
  fragment: string,
  options?: {
    contentRoot?: HTMLElement | null;
    scrollContainer?: HTMLElement | null;
    timeoutMs?: number;
    delayMs?: number;
  },
): Promise<boolean> {
  const timeoutMs = options?.timeoutMs ?? 15_000;
  const delayMs = options?.delayMs ?? 50;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const target = findDocsAnchorElement(fragment, options?.contentRoot);
    if (target) {
      await waitForNextPaint();
      scrollDocsAnchorElement(target, options?.scrollContainer);
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return false;
}

/** Re-scroll on a schedule — needed after full page refresh when layout settles late. */
export async function repeatDocsAnchorScroll(
  fragment: string,
  options?: {
    contentRoot?: HTMLElement | null;
    scrollContainer?: HTMLElement | null;
    delaysMs?: number[];
  },
): Promise<void> {
  const delaysMs = options?.delaysMs ?? [0, 100, 250, 500, 1000, 1500];

  for (const delayMs of delaysMs) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const target = findDocsAnchorElement(fragment, options?.contentRoot);
    if (!target) {
      continue;
    }

    await waitForNextPaint();
    scrollDocsAnchorElement(target, options?.scrollContainer);
  }
}

export function observeDocsAnchorAndScroll(
  fragment: string,
  contentRoot: HTMLElement,
  options?: {
    scrollContainer?: HTMLElement | null;
    timeoutMs?: number;
  },
): () => void {
  const timeoutMs = options?.timeoutMs ?? 15_000;
  let done = false;

  const finish = (observer: MutationObserver, timer: ReturnType<typeof setTimeout>) => {
    if (done) {
      return;
    }
    done = true;
    observer.disconnect();
    clearTimeout(timer);
  };

  const tryScroll = async (observer: MutationObserver, timer: ReturnType<typeof setTimeout>) => {
    const target = findDocsAnchorElement(fragment, contentRoot);
    if (!target) {
      return;
    }

    finish(observer, timer);
    await waitForNextPaint();
    scrollDocsAnchorElement(target, options?.scrollContainer);
  };

  const observer = new MutationObserver(() => {
    void tryScroll(observer, timer);
  });

  const timer = setTimeout(() => finish(observer, timer), timeoutMs);

  void tryScroll(observer, timer);

  observer.observe(contentRoot, {
    childList: true,
    subtree: true,
  });

  return () => finish(observer, timer);
}
