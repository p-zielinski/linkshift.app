import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DocsAssistantDrawerService {
  readonly open = signal(false);

  openDrawer(): void {
    this.open.set(true);
  }

  closeDrawer(): void {
    this.open.set(false);
  }

  toggleDrawer(): void {
    this.open.update((value) => !value);
  }

  setOpen(open: boolean): void {
    this.open.set(open);
  }
}
