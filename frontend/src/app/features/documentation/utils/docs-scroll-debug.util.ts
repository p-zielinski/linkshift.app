const DOCS_SCROLL_DEBUG_KEY = 'linkshift.docsScrollDebug';

export function isDocsScrollDebugEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(DOCS_SCROLL_DEBUG_KEY) === '1';
  } catch {
    return false;
  }
}

export function docsScrollDebug(message: string, detail?: Record<string, unknown>): void {
  if (!isDocsScrollDebugEnabled()) {
    return;
  }

  if (detail) {
    console.debug(`[LinkShift Docs scroll] ${message}`, detail);
    return;
  }

  console.debug(`[LinkShift Docs scroll] ${message}`);
}
