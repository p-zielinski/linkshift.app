import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { debounce, form, FormField } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { LinkMapEntriesApiService } from '../../core/api/link-map-entries-api.service';
import { LinkMapsApiService } from '../../core/api/link-maps-api.service';
import type { LinkMap, LinkMapEntry } from '../../core/models/link-map.model';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';
import { LinkMapEntryStore } from '../../core/store/link-map-entry.store';
import { LinkMapStore } from '../../core/store/link-map.store';
import { getFilterKey } from '../../core/store/entity/entity-store.utils';
import { extractErrorMessage } from '../../core/store/store-error.utils';
import { ResourceCardComponent } from '../../shared/components/resource-card/resource-card.component';
import { ResourcePageShellComponent } from '../../shared/components/resource-page-shell/resource-page-shell.component';
import { ResourceTableCardComponent } from '../../shared/components/resource-table-card/resource-table-card.component';
import { TablePaginatorComponent } from '../../shared/components/table-paginator/table-paginator.component';
import { LinkMapFormDialogComponent, LinkMapDialogData, LinkMapDialogResult } from './link-map-form-dialog.component';
import {
  LinkMapEntriesImportDialogComponent,
  LinkMapEntriesImportDialogData,
  LinkMapEntriesImportDialogResult,
} from './link-map-entries-import-dialog.component';
import {
  LinkMapEntriesDeleteConfirmDialogComponent,
  LinkMapEntriesDeleteConfirmDialogData,
} from './link-map-entries-delete-confirm-dialog.component';
import {
  LinkMapEntryFormDialogComponent,
  LinkMapEntryDialogData,
  LinkMapEntryDialogResult,
} from './link-map-entry-form-dialog.component';
import { LinkMapEntriesTableComponent } from './components/link-map-entries-table/link-map-entries-table.component';

@Component({
  selector: 'app-link-map-details-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    FormField,
    ResourcePageShellComponent,
    ResourceCardComponent,
    ResourceTableCardComponent,
    TablePaginatorComponent,
    LinkMapEntriesTableComponent,
  ],
  templateUrl: './link-map-details-page.component.html',
  styleUrl: './link-map-details-page.component.css',
})
export class LinkMapDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly wizardDialog = inject(WizardDialogService);
  private readonly linkMapsApi = inject(LinkMapsApiService);
  private readonly linkMapStore = inject(LinkMapStore);
  private readonly entryStore = inject(LinkMapEntryStore);
  private readonly entryApi = inject(LinkMapEntriesApiService);

  readonly pageLimitOptions = [20, 50, 100];
  readonly pageLimit = signal(20);
  readonly page = signal(1);
  readonly pageCursors = signal<Record<number, string | null>>({ 1: null });

  readonly linkMapId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly linkMap = signal<LinkMap | null>(null);
  readonly mapLoading = signal(true);
  readonly deleteLoading = signal(false);

  readonly selectedIds = signal<Set<string>>(new Set<string>());
  readonly selectedSnapshots = signal<Record<string, LinkMapEntry>>({});

  readonly filterModel = signal({ search: '' });
  readonly filterForm = form(this.filterModel, (f) => {
    debounce(f.search, 350);
  });

  readonly baseFilter = computed(() => {
    const linkMapId = this.linkMapId();
    if (!linkMapId) {
      return null;
    }

    const search = this.filterModel().search.trim();
    return {
      linkMapId,
      ...(search ? { search } : {}),
    };
  });

  readonly filterParams = computed(() => {
    const base = this.baseFilter();
    if (!base) {
      return null;
    }

    const cursor = this.pageCursors()[this.page()];
    return {
      ...base,
      limit: this.pageLimit(),
      ...(cursor ? { startAfterId: cursor } : {}),
    };
  });

  readonly entries = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return [] as LinkMapEntry[];
    }
    return this.entryStore.selectList(filter)();
  });

  readonly listResult = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return null;
    }
    return this.entryStore.selectListResult(filter)();
  });

  readonly loading = computed(() => {
    const filter = this.filterParams();
    if (!filter) {
      return false;
    }
    const key = getFilterKey(filter);
    return !!this.entryStore.isLoading()[key];
  });

  readonly hasNextPage = computed(() => !!this.listResult()?.moreStartingAfterId);

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly selectedEntries = computed(() => {
    const selectedIds = this.selectedIds();
    const snapshots = this.selectedSnapshots();

    return Array.from(selectedIds)
      .map((id) => snapshots[id])
      .filter((entry): entry is LinkMapEntry => !!entry)
      .sort((left, right) => left.key.localeCompare(right.key));
  });

  readonly allCurrentPageSelected = computed(() => {
    const rows = this.entries();
    if (rows.length === 0) {
      return false;
    }

    const selected = this.selectedIds();
    return rows.every((row) => selected.has(row.id));
  });

  readonly someCurrentPageSelected = computed(() => {
    const rows = this.entries();
    if (rows.length === 0) {
      return false;
    }

    const selected = this.selectedIds();
    const selectedRows = rows.filter((row) => selected.has(row.id)).length;
    return selectedRows > 0 && selectedRows < rows.length;
  });

  readonly mapSubtitle = computed(() => {
    const map = this.linkMap();
    if (!map) {
      return 'Manage entries for this link map.';
    }

    const queryMatchLabel = map.queryMatch === 'ignore' ? 'Ignore query' : map.queryMatch;
    const caseLabel = map.caseSensitive ? 'Case-sensitive' : 'Case-insensitive';
    const fallback = map.fallbackDestination ?? 'No fallback';
    return `Query match: ${queryMatchLabel} | ${caseLabel} | Fallback: ${fallback}`;
  });

  private readonly shownStoreErrorSequence = signal(0);

  constructor() {
    if (!this.linkMapId()) {
      this.navigateToList();
      return;
    }

    this.loadLinkMap();

    effect(() => {
      this.baseFilter();
      this.pageLimit();
      this.page.set(1);
      this.pageCursors.set({ 1: null });
    });

    effect(() => {
      const filter = this.filterParams();
      if (!filter) {
        return;
      }
      this.entryStore.searchList(filter);
    });

    effect(() => {
      const result = this.listResult();
      const currentPage = this.page();
      if (!result?.moreStartingAfterId) {
        return;
      }
      const nextCursor = result.moreStartingAfterId;

      this.pageCursors.update((cursors) => {
        const nextPage = currentPage + 1;
        if (cursors[nextPage] === nextCursor) {
          return cursors;
        }
        return { ...cursors, [nextPage]: nextCursor };
      });
    });

    effect(() => {
      const entries = this.entries();
      if (entries.length === 0) {
        return;
      }

      this.selectedSnapshots.update((current) => {
        const next = { ...current };
        for (const entry of entries) {
          next[entry.id] = entry;
        }
        return next;
      });
    });

    effect(() => {
      const sequence = this.entryStore.errorSequence();
      if (!sequence || sequence <= this.shownStoreErrorSequence()) {
        return;
      }

      const message = this.entryStore.lastError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: 4000 });
      }
      this.entryStore.clearError();
      this.shownStoreErrorSequence.set(sequence);
    });
  }

  goBack(): void {
    this.navigateToList();
  }

  openEditMapDialog(): void {
    const map = this.linkMap();
    if (!map) {
      return;
    }

    const dialogRef = this.wizardDialog.openWizard<
      LinkMapFormDialogComponent,
      LinkMapDialogData,
      LinkMapDialogResult
    >(LinkMapFormDialogComponent, {
      linkMapId: map.id,
      domainGroupId: map.domainGroupId,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.loadLinkMap();
      }
    });
  }

  openAddEntryDialog(): void {
    const map = this.linkMap();
    if (!map) {
      return;
    }

    const dialogRef = this.wizardDialog.openWizard<
      LinkMapEntryFormDialogComponent,
      LinkMapEntryDialogData,
      LinkMapEntryDialogResult
    >(LinkMapEntryFormDialogComponent, {
      linkMapId: map.id,
      caseSensitive: map.caseSensitive,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.clearSearchAndForceRefresh();
      }
    });
  }

  openEditEntryDialog(entry: LinkMapEntry): void {
    const map = this.linkMap();
    if (!map) {
      return;
    }

    const dialogRef = this.wizardDialog.openWizard<
      LinkMapEntryFormDialogComponent,
      LinkMapEntryDialogData,
      LinkMapEntryDialogResult
    >(LinkMapEntryFormDialogComponent, {
      linkMapId: map.id,
      caseSensitive: map.caseSensitive,
      entry,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.clearSearchAndForceRefresh();
      }
    });
  }

  openImportDialog(): void {
    const map = this.linkMap();
    if (!map) {
      return;
    }

    const dialogRef = this.wizardDialog.openWizard<
      LinkMapEntriesImportDialogComponent,
      LinkMapEntriesImportDialogData,
      LinkMapEntriesImportDialogResult
    >(LinkMapEntriesImportDialogComponent, {
      linkMapId: map.id,
      caseSensitive: map.caseSensitive,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      if (result.importedCount > 0) {
        this.clearSearchAndForceRefresh();
      }
    });
  }

  async confirmDeleteSelected(): Promise<void> {
    if (this.selectedCount() === 0 || this.deleteLoading()) {
      return;
    }

    const map = this.linkMap();
    if (!map) {
      return;
    }

    const entries = this.selectedEntries();
    const dialogRef = this.wizardDialog.openWizard<
      LinkMapEntriesDeleteConfirmDialogComponent,
      LinkMapEntriesDeleteConfirmDialogData,
      boolean
    >(LinkMapEntriesDeleteConfirmDialogComponent, {
      entries,
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) {
      return;
    }

    this.deleteLoading.set(true);
    try {
      const entryIds = Array.from(this.selectedIds());
      await firstValueFrom(
        this.entryApi.deleteMany({
          linkMapId: map.id,
          entryIds,
        }),
      );
      this.selectedIds.set(new Set<string>());
      this.selectedSnapshots.set({});
      this.clearSearchAndForceRefresh();
      this.snackBar.open('Entries deleted.', 'Dismiss', { duration: 3000 });
    } catch (error) {
      this.snackBar.open(extractErrorMessage(error, 'Unable to delete selected entries.'), 'Dismiss', {
        duration: 4000,
      });
    } finally {
      this.deleteLoading.set(false);
    }
  }

  onToggleAll(checked: boolean): void {
    const rows = this.entries();
    this.selectedIds.update((current) => {
      const next = new Set(current);
      for (const row of rows) {
        if (checked) {
          next.add(row.id);
        } else {
          next.delete(row.id);
        }
      }
      return next;
    });
  }

  onToggleOne(event: { id: string; checked: boolean }): void {
    this.selectedIds.update((current) => {
      const next = new Set(current);
      if (event.checked) {
        next.add(event.id);
      } else {
        next.delete(event.id);
      }
      return next;
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  onPageLimitChange(limit: number): void {
    this.pageLimit.set(limit);
    this.page.set(1);
    this.pageCursors.set({ 1: null });
  }

  private async loadLinkMap(): Promise<void> {
    const linkMapId = this.linkMapId();
    if (!linkMapId) {
      this.navigateToList();
      return;
    }

    this.mapLoading.set(true);
    try {
      const map = await firstValueFrom(this.linkMapsApi.get(linkMapId));
      this.linkMap.set(map);
      this.linkMapStore.searchDetails(map.id, true);
    } catch (error) {
      this.snackBar.open(extractErrorMessage(error, 'Link map not found.'), 'Dismiss', {
        duration: 4000,
      });
      this.navigateToList();
    } finally {
      this.mapLoading.set(false);
    }
  }

  private clearSearchAndForceRefresh(): void {
    this.filterModel.update((model) => ({ ...model, search: '' }));
    this.page.set(1);
    this.pageCursors.set({ 1: null });

    this.selectedIds.set(new Set<string>());
    this.selectedSnapshots.set({});

    const filter = {
      linkMapId: this.linkMapId(),
      limit: this.pageLimit(),
    };

    this.entryStore.invalidateList();
    this.entryStore.searchList(filter, true);
    this.loadLinkMap();
  }

  private navigateToList(): void {
    this.router.navigate(['/link-maps']);
  }
}
