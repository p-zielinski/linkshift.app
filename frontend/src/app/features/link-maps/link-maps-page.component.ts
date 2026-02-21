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
import { LinkMapsApiService } from '../../core/api/link-maps-api.service';
import type { LinkMap } from '../../core/models/link-map.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LinkMapFormDialogComponent, LinkMapDialogResult } from './link-map-form-dialog.component';
import { firstValueFrom } from 'rxjs';

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
  private readonly linkMapsApi = inject(LinkMapsApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly columns = ['name', 'queryMatch', 'caseSensitive', 'fallback', 'actions'];

  filterModel = signal({ domainGroupId: '' });
  filterForm = form(this.filterModel, (f) => {
    required(f.domainGroupId);
  });

  readonly linkMaps = signal<LinkMap[]>([]);
  readonly loading = signal(false);

  readonly activeGroupId = computed(() => this.filterModel().domainGroupId || '');

  constructor() {
    this.domainGroupStore.searchList();

    effect(() => {
      const groupId = this.activeGroupId();
      if (!groupId) {
        this.linkMaps.set([]);
        return;
      }
      this.loadLinkMaps(groupId);
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
        this.loadLinkMaps(this.activeGroupId());
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
        this.loadLinkMaps(this.activeGroupId());
      }
    });
  }

  async deleteMap(map: LinkMap): Promise<void> {
    try {
      await firstValueFrom(this.linkMapsApi.delete(map.id));
      this.loadLinkMaps(this.activeGroupId());
      this.snackBar.open('Link map deleted.', 'Dismiss', { duration: 3000 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete link map.';
      this.snackBar.open(message, 'Dismiss', { duration: 4000 });
    }
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

  private async loadLinkMaps(groupId: string): Promise<void> {
    this.loading.set(true);
    try {
      const maps = await firstValueFrom(this.linkMapsApi.list({ domainGroupId: groupId }));
      this.linkMaps.set(maps);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load link maps.';
      this.snackBar.open(message, 'Dismiss', { duration: 4000 });
      this.linkMaps.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
