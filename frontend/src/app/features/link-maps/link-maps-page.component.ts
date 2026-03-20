import { Component, computed, effect, inject, signal } from '@angular/core';
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
import { DomainGroupSelectComponent } from '../../shared/components/domain-group-select/domain-group-select.component';
import { LinkMapsTableComponent } from './components/link-maps-table/link-maps-table.component';
import { WizardDialogService } from '../../core/services/wizard-dialog.service';

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
    DomainGroupSelectComponent,
    LinkMapsTableComponent,
  ],
  templateUrl: './link-maps-page.component.html',
  styleUrl: './link-maps-page.component.css',
})
export class LinkMapsPageComponent {
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly linkMapStore = inject(LinkMapStore);
  private readonly wizardDialog = inject(WizardDialogService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly domainGroups = this.domainGroupStore.selectList();

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

    const dialogRef = this.wizardDialog.openWizard<
      LinkMapFormDialogComponent,
      LinkMapDialogData,
      LinkMapDialogResult
    >(LinkMapFormDialogComponent, {
      domainGroupId: this.activeGroupId(),
    });

    dialogRef.afterClosed().subscribe((result) => {
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
    });

    dialogRef.afterClosed().subscribe((result) => {
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
