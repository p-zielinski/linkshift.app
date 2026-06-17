import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { LinkMapStore } from '../../core/store/link-map.store';
import type { LinkMap } from '../../core/models/link-map.model';
import { LinkMapFormDialogComponent, LinkMapDialogResult, type LinkMapDialogData } from './link-map-form-dialog.component';
import { getFilterKey } from '../../core/store/entity/entity-store.utils';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { ResourceCardComponent } from '../../shared/components/resource-card/resource-card.component';
import { ResourceTableCardComponent } from '../../shared/components/resource-table-card/resource-table-card.component';
import { attachPageWorkspaceFilter } from '../../core/layout/attach-page-workspace.util';
import { LinkMapsTableComponent } from './components/link-maps-table/link-maps-table.component';
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { DomainGroupFilterPersistenceService } from '../../core/services/domain-group-filter-persistence.service';
import { DashboardModeService } from '../../core/layout/dashboard-mode.service';
import { areRowsEqualByIdAndUpdatedAt } from '../../core/utils/signal-list-equality.util';
import { needsCursorListFetch } from '../../core/utils/cursor-list-pagination.util';

@Component({
  selector: 'app-link-maps-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    ResourcePageShellComponent,
    ResourceCardComponent,
    ResourceTableCardComponent,
    LinkMapsTableComponent,
    TablePaginatorComponent,
  ],
  templateUrl: './link-maps-page.component.html',
  styleUrl: './link-maps-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkMapsPageComponent {
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly linkMapStore = inject(LinkMapStore);
  private readonly wizardDialog = inject(WizardDialogService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly domainGroupFilterPersistence = inject(DomainGroupFilterPersistenceService);
  private readonly dashboardMode = inject(DashboardModeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly showPageLevelWorkspaceFilter = this.dashboardMode.showPageLevelWorkspaceFilter;
  readonly domainGroups = this.domainGroupStore.selectList();

  filterModel = signal({ domainGroupId: '' });
  filterForm = form(this.filterModel, (f) => {
    required(f.domainGroupId);
  });

  readonly pageLimitOptions = [10, 20, 50];
  readonly pageLimit = signal(20);
  readonly page = signal(1);

  readonly linkMaps = computed(() => {
    const groupId = this.activeGroupId();
    if (!groupId) {
      return [] as LinkMap[];
    }
    return this.linkMapStore.selectList({ domainGroupId: groupId })();
  });
  readonly totalLinkMaps = computed(() => this.linkMaps().length);
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalLinkMaps() / this.pageLimit())),
  );
  readonly pagedLinkMaps = computed(
    () => {
      const limit = this.pageLimit();
      const page = this.page();
      const start = (page - 1) * limit;
      return this.linkMaps().slice(start, start + limit);
    },
    { equal: areRowsEqualByIdAndUpdatedAt },
  );
  readonly hasNextPage = computed(() => this.page() < this.pageCount());
  readonly loading = computed(() => {
    const groupId = this.activeGroupId();
    if (!groupId) {
      return false;
    }
    const key = getFilterKey({ domainGroupId: groupId });
    return !!this.linkMapStore.isLoading()[key];
  });

  readonly activeGroupId = computed(() => this.filterModel().domainGroupId || '');

  private readonly pendingDeleteId = signal<string | null>(null);
  private readonly deleteErrorSequence = signal(0);
  private readonly deleteLoadingSeen = signal(false);
  private readonly listErrorSequence = signal<number | null>(null);

  constructor() {
    this.domainGroupStore.searchList();
    this.domainGroupFilterPersistence.bind(this.filterModel, this.domainGroups, {
      syncFromDashboardContext: computed(() => this.dashboardMode.isAdvanced()),
    });

    attachPageWorkspaceFilter({
      destroyRef: this.destroyRef,
      filterModel: () => this.filterModel(),
      updateFilterModel: (domainGroupId) => {
        this.filterModel.update((model) => ({ ...model, domainGroupId }));
      },
      groups: this.domainGroups,
      allowEmptySelection: this.showPageLevelWorkspaceFilter,
    });

    effect(() => {
      const pendingId = this.pendingDeleteId();
      if (!pendingId) {
        return;
      }

      const loading = this.linkMapStore.isLoading()[pendingId] ?? false;
      if (loading) {
        if (!this.deleteLoadingSeen()) {
          this.deleteLoadingSeen.set(true);
        }
        return;
      }

      if (!this.deleteLoadingSeen()) {
        return;
      }

      const hadError = this.linkMapStore.errorSequence() > this.deleteErrorSequence();
      this.pendingDeleteId.set(null);
      this.deleteLoadingSeen.set(false);

      if (hadError) {
        this.snackBar.open(this.linkMapStore.lastError() ?? "Couldn't delete link map.", 'Dismiss', {
          duration: 4000,
        });
        this.linkMapStore.clearError();
        return;
      }

      this.snackBar.open('Link map deleted.', 'Dismiss', { duration: 3000 });
    });

    effect(() => {
      const groupId = this.activeGroupId();
      if (!groupId) {
        untracked(() => this.listErrorSequence.set(null));
        return;
      }

      const filter = { domainGroupId: groupId };
      const listResult = this.linkMapStore.selectListResult(filter)();
      const expiration = this.linkMapStore.selectListExpiration(filter)();

      untracked(() => {
        this.listErrorSequence.set(this.linkMapStore.errorSequence());
        if (needsCursorListFetch(listResult, expiration)) {
          this.linkMapStore.searchList(filter);
        }
      });
    });

    effect(() => {
      const sequenceAtLoad = this.listErrorSequence();
      if (sequenceAtLoad === null) {
        return;
      }
      if (this.loading()) {
        return;
      }
      if (this.linkMapStore.errorSequence() > sequenceAtLoad) {
        this.snackBar.open(this.linkMapStore.lastError() ?? "Couldn't load link maps.", 'Dismiss', {
          duration: 4000,
        });
        this.linkMapStore.clearError();
      }
      this.listErrorSequence.set(null);
    });

    effect(() => {
      const maxPage = this.pageCount();
      if (this.page() > maxPage) {
        this.page.set(maxPage);
      }
    });

    effect(() => {
      this.activeGroupId();
      this.page.set(1);
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  onPageLimitChange(limit: number): void {
    this.pageLimit.set(limit);
    this.page.set(1);
  }

  openCreateDialog(): void {
    if (!this.activeGroupId()) {
      this.snackBar.open('Select a domain group before creating a link map.', 'Dismiss', {
        duration: 4000,
      });
      return;
    }

    const dialogRef = this.wizardDialog.openWizard<
      LinkMapFormDialogComponent,
      LinkMapDialogData,
      LinkMapDialogResult
    >(LinkMapFormDialogComponent, {
      domainGroupId: this.activeGroupId(),
    }, 0, { size: 'compact' });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result?.saved) {
        this.linkMapStore.searchList({ domainGroupId: this.activeGroupId() }, true);
      }
    });
  }

  openEditDialog(map: LinkMap): void {
    const dialogRef = this.wizardDialog.openWizard<
      LinkMapFormDialogComponent,
      LinkMapDialogData,
      LinkMapDialogResult
    >(LinkMapFormDialogComponent, {
      linkMapId: map.id,
      domainGroupId: map.domainGroupId,
    }, 0, { size: 'compact' });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result?.saved) {
        this.linkMapStore.searchList({ domainGroupId: this.activeGroupId() }, true);
      }
    });
  }

  openManagePage(map: LinkMap): void {
    this.router.navigate(['/link-maps', map.id]);
  }

  deleteMap(map: LinkMap): void {
    this.linkMapStore.clearError();
    this.deleteErrorSequence.set(this.linkMapStore.errorSequence());
    this.pendingDeleteId.set(map.id);
    this.deleteLoadingSeen.set(false);
    this.linkMapStore.remove(map.id);
  }

}
