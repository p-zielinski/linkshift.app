export function parseDocsFragment(fragment: string): string {
  return decodeURIComponent(fragment.replace(/^#/, '').trim());
}

function escapeCssIdent(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

export function findDocsAnchorElement(
  fragment: string,
  contentRoot?: HTMLElement | null,
): HTMLElement | null {
  const id = parseDocsFragment(fragment);
  if (!id) {
    return null;
  }

  const selector = `#${escapeCssIdent(id)}`;
  if (contentRoot) {
    return contentRoot.querySelector<HTMLElement>(selector);
  }

  return document.getElementById(id);
}

const STICKY_HEADER_SELECTORS = [
  'app-documentation-site-shell mat-toolbar',
  'app-documentation-shell .mat-drawer-content mat-toolbar',
];

/**
 * Measures visible sticky header overlap above the scroll container + gap (default 30px).
 */
export function measureDocsAnchorScrollOffset(
  target: HTMLElement,
  scrollContainer?: HTMLElement | null,
): number {
  const gapPx = 30;
  const containerTop = scrollContainer?.getBoundingClientRect().top ?? 0;
  let stickyBottom = containerTop;

  for (const selector of STICKY_HEADER_SELECTORS) {
    for (const element of document.querySelectorAll<HTMLElement>(selector)) {
      const style = getComputedStyle(element);
      if (style.position !== 'sticky' && style.position !== 'fixed') {
        continue;
      }

      const rect = element.getBoundingClientRect();
      if (rect.height > 0 && rect.bottom > stickyBottom) {
        stickyBottom = rect.bottom;
      }
    }
  }

  const measured = stickyBottom - containerTop + gapPx;
  if (measured > gapPx) {
    return measured;
  }

  const marginTop = parseFloat(getComputedStyle(target).scrollMarginTop);
  if (Number.isFinite(marginTop) && marginTop > 0) {
    return marginTop;
  }

  return 106;
}

export function resolveDocsAnchorScrollOffset(
  target: HTMLElement,
  scrollContainer?: HTMLElement | null,
): number {
  return measureDocsAnchorScrollOffset(target, scrollContainer);
}

export function scrollDocsAnchorElement(
  target: HTMLElement,
  scrollContainer?: HTMLElement | null,
): void {
  const topOffset = measureDocsAnchorScrollOffset(target, scrollContainer);

  if (scrollContainer) {
    const targetTop = target.getBoundingClientRect().top;
    const containerTop = scrollContainer.getBoundingClientRect().top;
    const nextTop = scrollContainer.scrollTop + (targetTop - containerTop) - topOffset;

    scrollContainer.scrollTo({
      top: Math.max(0, nextTop),
      behavior: 'auto',
    });
    return;
  }

  target.scrollIntoView({ behavior: 'auto', block: 'start' });
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
