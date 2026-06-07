import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export type DashboardMode = 'campaign' | 'advanced';

const STORAGE_KEY = 'linkshift-dashboard-mode';

@Injectable({
  providedIn: 'root',
})
export class DashboardModeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly modeState = signal<DashboardMode>(this.readStoredMode());

  readonly mode = this.modeState.asReadonly();
  readonly isCampaignMode = computed(() => this.modeState() === 'campaign');
  readonly isAdvancedMode = computed(() => this.modeState() === 'advanced');

  /** Campaign pages allow "All sites" on more pages; advanced mode still uses the page-level switcher in ResourcePageShell. */
  readonly showPageLevelWorkspaceFilter = computed(() => !this.isAdvancedMode());

  setMode(mode: DashboardMode): void {
    this.modeState.set(mode);
    this.persistMode(mode);
  }

  isCampaign(): boolean {
    return this.modeState() === 'campaign';
  }

  isAdvanced(): boolean {
    return this.modeState() === 'advanced';
  }

  toggleMode(): void {
    this.setMode(this.isCampaign() ? 'advanced' : 'campaign');
  }

  enterAdvancedMode(router: Router, path: string): Promise<boolean> {
    this.setMode('advanced');
    return router.navigateByUrl(path);
  }

  defaultLandingPath(): string {
    return this.isCampaign() ? '/overview' : '/dashboard';
  }

  private readStoredMode(): DashboardMode {
    if (!isPlatformBrowser(this.platformId)) {
      return 'campaign';
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'campaign' || stored === 'advanced') {
      return stored;
    }

    return 'campaign';
  }

  private persistMode(mode: DashboardMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, mode);
  }
}
