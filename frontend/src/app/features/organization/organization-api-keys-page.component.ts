import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { ResourceTableCardComponent } from '../../shared/components/resource-table-card/resource-table-card.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ApiKeyStore } from '../../core/store/api-key.store';
import { DEFAULT_LIST_KEY } from '../../core/store/entity/entity-store.utils';
import { OrganizationUsageStore } from '../../core/store/organization-usage.store';
import { AuthStore } from '../../core/store/auth.store';
import { APP_CONFIG } from '../../core/config/app-runtime-config';
import { OrganizationConfiguration, OrganizationPlan } from '@shared/models/organization-config.model';
import type { ApiKey } from '../../core/models/api-key.model';
import {
  ApiKeyDialogData,
  ApiKeyDialogResult,
  ApiKeyFormDialogComponent,
} from './api-key-form-dialog.component';
import { OrganizationApiKeysTableComponent } from './components/organization-api-keys-table/organization-api-keys-table.component';
import {
  ApiKeyCreatedDialogComponent,
  ApiKeyCreatedDialogData,
} from './api-key-created-dialog.component';
import { UNMETERED_PLAN_LIMITS } from '@shared/models/plan-limits.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-organization-api-keys-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    ResourcePageShellComponent,
    ResourceTableCardComponent,
    OrganizationApiKeysTableComponent,
    RouterLink,
  ],
  templateUrl: './organization-api-keys-page.component.html',
})
export class OrganizationApiKeysPageComponent {
  private readonly apiKeyStore = inject(ApiKeyStore);
  private readonly usageStore = inject(OrganizationUsageStore);
  private readonly authStore = inject(AuthStore);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly shownStoreErrorSequence = signal(0);

  readonly keys = this.apiKeyStore.selectList();
  readonly loading = computed(() => this.apiKeyStore.isLoading()[DEFAULT_LIST_KEY] ?? false);

  readonly config = computed(() => {
    const org = this.authStore.organization();
    const orgConfig = OrganizationConfiguration.fromJson(org?.configuration ?? {});
    if (orgConfig.activeSubscription.plan === OrganizationPlan.UNMETERED) {
      orgConfig.activeSubscription.limits = UNMETERED_PLAN_LIMITS;
    }
    return orgConfig;
  });
  readonly limits = computed(() => this.config().activeSubscription.limits);
  readonly usage = computed(() => this.usageStore.usage());

  readonly apiKeyLimit = computed(() => this.limits().maxApiKeys);
  readonly apiKeyLimitLabel = computed(() =>
    this.apiKeyLimit() === null ? 'Unlimited' : String(this.apiKeyLimit()),
  );
  readonly apiCallsPerMinute = computed(() => this.limits().apiKeyCallsPerMinute);
  readonly apiKeyCount = computed(() => this.keys().length);
  readonly apiKeyLimitReached = computed(() => {
    const limit = this.apiKeyLimit();
    if (limit === null) {
      return false;
    }
    return this.apiKeyCount() >= limit;
  });
  readonly apiServerUrl = computed(() => this.appConfig.APP_BASE_URL.replace(/\/+$/, ''));
  readonly openApiSpecPath = '/linkshift-api-keys.openapi.yaml';

  readonly canCreate = computed(() => {
    const limit = this.apiKeyLimit();
    if (limit === null) {
      return true;
    }
    return this.keys().length < limit;
  });

  readonly createTooltip = computed(() => {
    if (this.canCreate()) {
      return '';
    }
    const limit = this.apiKeyLimit();
    if (limit === null) {
      return '';
    }
    return `API key quota reached (${this.keys().length}/${limit}).`;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.apiKeyStore.searchList();
      this.usageStore.loadUsage();
    }

    effect(() => {
      const sequence = this.apiKeyStore.errorSequence();
      if (!sequence || sequence <= this.shownStoreErrorSequence()) {
        return;
      }

      const message = this.apiKeyStore.lastError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: 4500 });
      }
      this.apiKeyStore.clearError();
      this.shownStoreErrorSequence.set(sequence);
    });
  }

  openCreateDialog(): void {
    if (!this.canCreate()) {
      const message = this.createTooltip() || 'API key limit reached.';
      this.snackBar.open(message, 'Dismiss', { duration: 4500 });
      return;
    }

    const dialogRef = this.dialog.open<
      ApiKeyFormDialogComponent,
      ApiKeyDialogData,
      ApiKeyDialogResult
    >(ApiKeyFormDialogComponent, {
      width: 'min(560px, 94vw)',
      maxWidth: '94vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result?.saved) {
        return;
      }

      this.apiKeyStore.searchList(undefined, true);
      this.usageStore.invalidateUsage();
      this.usageStore.loadUsage(true);

      if (result.createdKey) {
        this.openCreatedKeyDialog(result.createdKey);
      } else {
        this.snackBar.open('API key created.', 'Dismiss', { duration: 3500 });
      }
    });
  }

  openEditDialog(apiKey: ApiKey): void {
    const dialogRef = this.dialog.open<
      ApiKeyFormDialogComponent,
      ApiKeyDialogData,
      ApiKeyDialogResult
    >(ApiKeyFormDialogComponent, {
      width: 'min(560px, 94vw)',
      maxWidth: '94vw',
      data: { apiKey },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result?.saved) {
        return;
      }

      this.apiKeyStore.searchList(undefined, true);
      this.snackBar.open('API key updated.', 'Dismiss', { duration: 3200 });
    });
  }

  confirmDelete(apiKey: ApiKey): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete API key',
        message:
          'This API key will stop working immediately across the API. This action cannot be undone.',
        confirmLabel: 'Delete',
        tone: 'warning',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.apiKeyStore.remove(apiKey.id);
    });
  }

  private openCreatedKeyDialog(createdKey: string): void {
    this.dialog.open<ApiKeyCreatedDialogComponent, ApiKeyCreatedDialogData>(
      ApiKeyCreatedDialogComponent,
      {
        width: 'min(640px, 94vw)',
        maxWidth: '94vw',
        disableClose: false,
        data: {
          key: createdKey,
        },
      },
    );
  }
}
