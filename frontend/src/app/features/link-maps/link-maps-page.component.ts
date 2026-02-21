import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { form, required, FormField } from '@angular/forms/signals';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { LinkMapStore } from '../../core/store/link-map.store';
import type { LinkMap } from '../../core/models/link-map.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LinkMapFormDialogComponent, LinkMapDialogResult } from './link-map-form-dialog.component';
import { getFilterKey } from '../../core/store/entity/entity-store.utils';

@Component({
  selector: 'app-link-maps-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    FormField,
    PageHeaderComponent,
  ],
  templateUrl: './link-maps-page.component.html',
  styleUrl: './link-maps-page.component.css',
})
export class LinkMapsPageComponent {
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly linkMapStore = inject(LinkMapStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly columns = ['name', 'queryMatch', 'caseSensitive', 'fallback', 'actions'];

  filterModel = signal({ domainGroupId: '' });
  filterForm = form(this.filterModel, (f) => {
    required(f.domainGroupId);
  });

  readonly linkMaps = computed(() => {
    const groupId = this.activeGroupId();
    if (!groupId) {
      return [] as LinkMap[];
    }
    return this.linkMapStore.selectList({ domainGroupId: groupId })();
  });
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
        this.snackBar.open(this.linkMapStore.lastError() ?? 'Unable to delete link map.', 'Dismiss', {
          duration: 4000,
        });
        this.linkMapStore.clearError();
        return;
      }

      this.snackBar.open('Link map deleted.', 'Dismiss', { duration: 3000 });
    });

    effect(() => {
      const groups = this.domainGroups();
      if (groups.length === 1 && !this.filterModel().domainGroupId) {
        this.filterModel.update((model) => ({
          ...model,
          domainGroupId: groups[0].id,
        }));
      }
    });

    effect(() => {
      const groupId = this.activeGroupId();
      if (!groupId) {
        this.listErrorSequence.set(null);
        return;
      }
      this.listErrorSequence.set(this.linkMapStore.errorSequence());
      this.linkMapStore.searchList({ domainGroupId: groupId });
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
        this.snackBar.open(this.linkMapStore.lastError() ?? 'Unable to load link maps.', 'Dismiss', {
          duration: 4000,
        });
        this.linkMapStore.clearError();
      }
      this.listErrorSequence.set(null);
    });
  }

  openCreateDialog(): void {
    if (!this.activeGroupId()) {
      this.snackBar.open('Select a domain group before creating a link map.', 'Dismiss', {
        duration: 4000,
      });
      return;
    }

    const dialogRef = this.dialog.open(LinkMapFormDialogComponent, {
      width: 'min(960px, 96vw)',
      maxWidth: '96vw',
      data: { domainGroupId: this.activeGroupId() },
    });

    dialogRef.afterClosed().subscribe((result: LinkMapDialogResult | boolean) => {
      if (typeof result !== 'boolean' && result?.saved) {
        this.linkMapStore.searchList({ domainGroupId: this.activeGroupId() }, true);
      }
    });
  }

  openEditDialog(map: LinkMap): void {
    const dialogRef = this.dialog.open(LinkMapFormDialogComponent, {
      width: 'min(960px, 96vw)',
      maxWidth: '96vw',
      data: { linkMapId: map.id, domainGroupId: map.domainGroupId },
    });

    dialogRef.afterClosed().subscribe((result: LinkMapDialogResult | boolean) => {
      if (typeof result !== 'boolean' && result?.saved) {
        this.linkMapStore.searchList({ domainGroupId: this.activeGroupId() }, true);
      }
    });
  }

  deleteMap(map: LinkMap): void {
    this.linkMapStore.clearError();
    this.deleteErrorSequence.set(this.linkMapStore.errorSequence());
    this.pendingDeleteId.set(map.id);
    this.deleteLoadingSeen.set(false);
    this.linkMapStore.remove(map.id);
  }

  formatQueryMatch(map: LinkMap): string {
    if (map.queryMatch === 'ignore') {
      return 'Ignore';
    }
    if (map.queryMatch === 'subset') {
      return 'Subset';
    }
    return 'Exact';
  }

  queryMatchIcon(map: LinkMap): string {
    if (map.queryMatch === 'ignore') {
      return 'search_off';
    }
    if (map.queryMatch === 'subset') {
      return 'filter_alt';
    }
    return 'manage_search';
  }

  queryMatchTooltip(map: LinkMap): string {
    if (map.queryMatch === 'ignore') {
      return 'Query match: ignore (path only)';
    }
    if (map.queryMatch === 'subset') {
      return 'Query match: subset (extra params allowed)';
    }
    return 'Query match: exact (path + query)';
  }

}
