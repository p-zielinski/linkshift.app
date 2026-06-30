import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { WizardDialogService } from '../../../core/services/wizard-dialog.service';
import { DashboardModeService } from '../../../core/layout/dashboard-mode.service';
import { CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY } from '../../campaign-connect-domain/campaign-connect-domain.util';
import { CampaignConnectDomainService } from '../../campaign-connect-domain/campaign-connect-domain.service';
import { DashboardDialogQueueService } from './dashboard-dialog-queue.service';
import {
  DashboardOnboardingDialogComponent,
  type DashboardOnboardingDialogData,
  type DashboardOnboardingDialogResult,
} from '../components/dashboard-onboarding-dialog/dashboard-onboarding-dialog.component';

export const DASHBOARD_ONBOARDING_WINDOW_MS = 24 * 60 * 60 * 1000;
export const DASHBOARD_OPEN_CREATE_QUERY = 'openCreate';

/** Query params that open a dashboard dialog and must not be interrupted by onboarding. */
export const DASHBOARD_ONBOARDING_DEFER_QUERY_INTENTS: readonly string[] = [
  DASHBOARD_OPEN_CREATE_QUERY,
  CAMPAIGN_OPEN_CONNECT_DOMAIN_QUERY,
];

function parseRouterUrl(routerUrl: string): { path: string; query: URLSearchParams } {
  const [pathPart, queryPart] = routerUrl.split('?');
  return { path: pathPart ?? routerUrl, query: new URLSearchParams(queryPart ?? '') };
}

export function hasDashboardDialogQueryIntent(routerUrl: string): boolean {
  const { query } = parseRouterUrl(routerUrl);
  return DASHBOARD_ONBOARDING_DEFER_QUERY_INTENTS.some((key) => query.get(key) === '1');
}

export function isOnboardingLandingRoute(routerUrl: string, isCampaign: boolean): boolean {
  const { path } = parseRouterUrl(routerUrl);
  if (isCampaign) {
    return path === '/overview' || path === '/home';
  }
  return path === '/dashboard';
}

export function shouldDeferOnboardingForRoute(routerUrl: string, isCampaign: boolean): boolean {
  if (hasDashboardDialogQueryIntent(routerUrl)) {
    return true;
  }
  return !isOnboardingLandingRoute(routerUrl, isCampaign);
}
/** Any confirm or skip dismissal (not only confirmed completion). */
export const DASHBOARD_ONBOARDING_STORAGE_KEY = 'dashboard-onboarding-confirmed';
/** Flip to `true` while testing to force the onboarding wizard on every eligible visit. */
export const DASHBOARD_ONBOARDING_SHOW_ALWAYS = false;

@Injectable({ providedIn: 'root' })
export class DashboardOnboardingService {
  private readonly wizardDialog = inject(WizardDialogService);
  private readonly dialogQueue = inject(DashboardDialogQueueService);
  private readonly dashboardModeService = inject(DashboardModeService);
  private readonly router = inject(Router);
  private readonly campaignConnectDomain = inject(CampaignConnectDomainService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  shouldOpen(userCreatedAt: string): boolean {
    if (!this.isBrowser) {
      return false;
    }
    if (DASHBOARD_ONBOARDING_SHOW_ALWAYS) {
      return true;
    }
    if (localStorage.getItem(DASHBOARD_ONBOARDING_STORAGE_KEY) === 'true') {
      return false;
    }

    const createdAt = Date.parse(userCreatedAt);
    if (Number.isNaN(createdAt)) {
      return false;
    }

    return Date.now() - createdAt <= DASHBOARD_ONBOARDING_WINDOW_MS;
  }

  shouldDeferOnboarding(routerUrl: string): boolean {
    return shouldDeferOnboardingForRoute(routerUrl, this.dashboardModeService.isCampaign());
  }

  open(
    options?: Partial<DashboardOnboardingDialogData>,
  ): MatDialogRef<DashboardOnboardingDialogComponent, DashboardOnboardingDialogResult> {
    const dialogData: DashboardOnboardingDialogData = {
      campaignMode: this.dashboardModeService.isCampaign(),
      ...options,
    };

    const dialogRef = this.dialogQueue.openBlocking(() =>
      this.wizardDialog.openWizard<
        DashboardOnboardingDialogComponent,
        DashboardOnboardingDialogData,
        DashboardOnboardingDialogResult
      >(
        DashboardOnboardingDialogComponent,
        dialogData,
        0,
        { disableClose: false },
      ),
    );

    void this.handleDialogClosed(dialogRef);

    return dialogRef;
  }

  private async handleDialogClosed(
    dialogRef: MatDialogRef<DashboardOnboardingDialogComponent, DashboardOnboardingDialogResult>,
  ): Promise<void> {
    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!this.isBrowser || DASHBOARD_ONBOARDING_SHOW_ALWAYS) {
      return;
    }

    if (result?.openConnectDomain) {
      await this.handleConnectDomainHandoff(result.connectDomainData);
      return;
    }

    this.markDismissed();

    if (result?.openCreate) {
      void this.router.navigate(['/links'], { queryParams: { openCreate: '1' } });
      return;
    }

    if (result?.navigateTo) {
      void this.router.navigateByUrl(result.navigateTo);
    }
  }

  private async handleConnectDomainHandoff(
    connectDomainData: DashboardOnboardingDialogResult['connectDomainData'],
  ): Promise<void> {
    const connectRef = this.campaignConnectDomain.openDialog(connectDomainData);
    const connectResult = await firstValueFrom(connectRef.afterClosed());

    if (connectResult?.openCreateLink) {
      this.markDismissed();
      void this.router.navigate(['/links'], { queryParams: { openCreate: '1' } });
      return;
    }

    if (connectResult?.connected) {
      await this.handleDialogClosed(
        this.open({ subdomainChoiceCompleted: true, initialStepId: 'next' }),
      );
      return;
    }

    await this.handleDialogClosed(this.open());
  }

  markDismissed(): void {
    if (!this.isBrowser || DASHBOARD_ONBOARDING_SHOW_ALWAYS) {
      return;
    }
    localStorage.setItem(DASHBOARD_ONBOARDING_STORAGE_KEY, 'true');
  }
}
