import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DocsNavDrawerService {
  /** Drives docs sidebar `[opened]` on mobile. */
  readonly open = signal(false);

  toggle(): void {
    this.open.update((opened) => !opened);
  }

  close(): void {
    this.open.set(false);
  }

  setOpen(open: boolean): void {
    this.open.set(open);
  }
}
