import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const DISMISS_STORAGE_KEY = 'linkshift.sunset-banner.dismissed';
export const GITHUB_REPO_URL = 'https://github.com/p-zielinski/linkshift.app';

@Component({
  selector: 'app-sunset-banner',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './sunset-banner.component.html',
  styleUrl: './sunset-banner.component.css',
})
export class SunsetBannerComponent {
  readonly githubRepoUrl = GITHUB_REPO_URL;
  readonly visible = signal(false);

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      this.visible.set(sessionStorage.getItem(DISMISS_STORAGE_KEY) !== '1');
    } catch {
      this.visible.set(true);
    }
  }

  dismiss(): void {
    this.visible.set(false);
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      sessionStorage.setItem(DISMISS_STORAGE_KEY, '1');
    } catch {
      // sessionStorage may be unavailable; hide for this view only
    }
  }
}
