import { DestroyRef, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export function registerStoreRefreshOnVisibility(
  destroyRef: DestroyRef,
  callback: () => void,
): void {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return;
  }

  const handler = () => {
    if (document.visibilityState === 'visible') {
      callback();
    }
  };

  document.addEventListener('visibilitychange', handler);
  destroyRef.onDestroy(() => {
    document.removeEventListener('visibilitychange', handler);
  });
}
