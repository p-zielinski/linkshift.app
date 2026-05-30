import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Matches Material sidenav close duration (see `.mat-drawer-transition .mat-drawer`). */
export const DOCS_ASSISTANT_DRAWER_CLOSE_MS = 500;

function routePath(url: string): string {
  return url.split('?')[0]?.split('#')[0] ?? url;
}

@Injectable({
  providedIn: 'root',
})
export class DocsAssistantDrawerService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private unmountContentTimer: ReturnType<typeof setTimeout> | undefined;

  /** Drives mat-sidenav `[opened]`. */
  readonly open = signal(false);

  /**
   * Keeps `app-docs-assistant` mounted until the sidenav close animation finishes
   * (see `(closed)` on the drawer and {@link DOCS_ASSISTANT_DRAWER_CLOSE_MS}).
   */
  readonly contentMounted = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearUnmountTimer();
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationStart => event instanceof NavigationStart),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        if (!this.open()) {
          return;
        }

        const nextPath = routePath(event.url);
        const currentPath = routePath(this.router.url);
        if (nextPath !== currentPath) {
          this.closeDrawer();
        }
      });
  }

  openDrawer(): void {
    this.clearUnmountTimer();
    this.contentMounted.set(true);
    this.open.set(true);
  }

  closeDrawer(): void {
    if (!this.open() && !this.contentMounted()) {
      return;
    }

    this.open.set(false);
    this.scheduleContentUnmount();
  }

  /** Call from mat-sidenav `(closed)` after the slide-out animation completes. */
  onDrawerAnimationClosed(): void {
    this.unmountContentAfterClose();
  }

  /** Immediate teardown (e.g. shell destroy) — skips the close animation. */
  forceClose(): void {
    this.clearUnmountTimer();
    this.open.set(false);
    this.contentMounted.set(false);
  }

  toggleDrawer(): void {
    if (this.open()) {
      this.closeDrawer();
      return;
    }

    this.openDrawer();
  }

  setOpen(open: boolean): void {
    if (open) {
      this.openDrawer();
      return;
    }

    this.closeDrawer();
  }

  private scheduleContentUnmount(): void {
    this.clearUnmountTimer();
    this.unmountContentTimer = setTimeout(() => {
      this.unmountContentAfterClose();
    }, DOCS_ASSISTANT_DRAWER_CLOSE_MS);
  }

  private unmountContentAfterClose(): void {
    this.clearUnmountTimer();
    if (!this.open()) {
      this.contentMounted.set(false);
    }
  }

  private clearUnmountTimer(): void {
    if (this.unmountContentTimer !== undefined) {
      clearTimeout(this.unmountContentTimer);
      this.unmountContentTimer = undefined;
    }
  }
}
