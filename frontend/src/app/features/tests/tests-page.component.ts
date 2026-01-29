import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { form, FormField } from '@angular/forms/signals';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { RedirectRulesApiService } from '../../core/api/redirect-rules-api.service';
import type { RedirectSimulationResult } from '../../core/models/redirect-rule.model';
import { firstValueFrom } from 'rxjs';

type TestFormModel = {
  domainGroupId: string;
  path: string;
  query: string;
};

@Component({
  selector: 'app-tests-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    FormField,
    PageHeaderComponent,
  ],
  templateUrl: './tests-page.component.html',
  styleUrl: './tests-page.component.css',
})
export class TestsPageComponent {
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly redirectRulesApi = inject(RedirectRulesApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly busy = signal(false);
  readonly result = signal<RedirectSimulationResult | null>(null);

  readonly formModel = signal<TestFormModel>({
    domainGroupId: '',
    path: '',
    query: '',
  });

  readonly form = form(this.formModel, () => {});

  readonly selectedGroupId = computed(() => this.formModel().domainGroupId);
  readonly hasDomainGroups = computed(() => this.domainGroups().length > 0);
  readonly canRun = computed(() => {
    const model = this.formModel();
    return !!model.domainGroupId && model.path.trim().length > 0 && !this.busy();
  });

  constructor() {
    this.domainGroupStore.searchList();

    effect(() => {
      const groups = this.domainGroups();
      const current = this.selectedGroupId();
      const hasCurrent = groups.some((group) => group.id === current);

      if (!current && groups.length === 1) {
        this.formModel.update((model) => ({
          ...model,
          domainGroupId: groups[0].id,
        }));
        return;
      }

      if (current && !hasCurrent) {
        this.formModel.update((model) => ({
          ...model,
          domainGroupId: groups.length === 1 ? groups[0].id : '',
        }));
      }
    });
  }

  async runTest(): Promise<void> {
    const model = this.formModel();
    if (!model.domainGroupId) {
      this.snackBar.open('Select a domain group first.', 'Dismiss', {
        duration: 3000,
      });
      return;
    }
    const path = model.path.trim();
    if (!path) {
      this.snackBar.open('Provide a path to test.', 'Dismiss', {
        duration: 3000,
      });
      return;
    }

    const fullPath = this.buildPathWithQuery(path, model.query);
    this.busy.set(true);
    try {
      const response = await firstValueFrom(
        this.redirectRulesApi.simulate([
          {
            domainGroupId: model.domainGroupId,
            path: fullPath,
            method: 'GET',
          },
        ]),
      );

      const result = response?.results?.[0] ?? null;
      this.result.set(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Simulation failed.';
      this.snackBar.open(message, 'Dismiss', {
        duration: 4000,
      });
    } finally {
      this.busy.set(false);
    }
  }

  private buildPathWithQuery(path: string, query: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const trimmedQuery = query.trim().replace(/^\?/, '');
    if (!trimmedQuery) {
      return normalizedPath;
    }
    return `${normalizedPath}?${trimmedQuery}`;
  }
}
