import { Component, computed, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { form, required, submit, FormField } from '@angular/forms/signals';
import { RedirectTestStore } from '../../core/store/redirect-test.store';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { RedirectRulesApiService } from '../../core/api/redirect-rules-api.service';
import { CREATE_ENTITY_ID } from '../../core/store/entity/entity-store.utils';
import { HttpMethod } from '../../core/models/http-method.model';
import type { RedirectTest, RedirectTestResult } from '../../core/models/redirect-test.model';
import { RedirectTestResultsStore } from '../../core/store/redirect-test-results.store';
import { firstValueFrom } from 'rxjs';
import {
  buildPathWithQuery,
  buildRequestData,
  splitPathWithQuery,
  stringifyHeaders,
  stringifyQuery,
  ensureLeadingSlash
} from './redirect-test.utils';

const STATUS_CODE_OPTIONS = [301, 302, 307, 308, 404] as const;
const METHOD_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Any method', value: '' },
  { label: 'GET', value: HttpMethod.GET },
  { label: 'POST', value: HttpMethod.POST },
  { label: 'PUT', value: HttpMethod.PUT },
  { label: 'PATCH', value: HttpMethod.PATCH },
  { label: 'DELETE', value: HttpMethod.DELETE },
  { label: 'HEAD', value: HttpMethod.HEAD },
  { label: 'OPTIONS', value: HttpMethod.OPTIONS }
];

const PROTOCOL_OPTIONS = [
  { label: 'Auto', value: '' },
  { label: 'HTTPS', value: 'https' },
  { label: 'HTTP', value: 'http' }
];

type RedirectTestFormModel = {
  domainGroupId: string;
  hostname: string;
  path: string;
  query: string;
  method: string;
  protocol: string;
  ip: string;
  userAgent: string;
  headers: string;
  expectedStatusCode: string;
  expectedTarget: string;
};

export type RedirectTestDialogData = {
  domainGroupId?: string;
  test?: RedirectTest;
};

@Component({
  selector: 'app-redirect-test-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatStepperModule,
    MatSnackBarModule,
    FormField
  ],
  templateUrl: './redirect-test-form-dialog.component.html',
  styleUrl: './redirect-test-form-dialog.component.css'
})
export class RedirectTestFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RedirectTestFormDialogComponent>);
  private readonly data = inject<RedirectTestDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly redirectTestStore = inject(RedirectTestStore);
  private readonly redirectTestResultsStore = inject(RedirectTestResultsStore);
  private readonly redirectRulesApi = inject(RedirectRulesApiService);
  private readonly domainGroupStore = inject(DomainGroupStore);
  private readonly domainStore = inject(DomainStore);
  private readonly snackBar = inject(MatSnackBar);

  readonly domainGroups = this.domainGroupStore.selectList();
  readonly domains = this.domainStore.selectList();
  readonly test = this.data?.test ?? null;
  readonly isEdit = !!this.test;
  readonly dialogTitle = this.isEdit ? 'Edit redirect test' : 'Create redirect test';
  readonly submitLabel = this.isEdit ? 'Save' : 'Create';
  readonly statusCodeOptions = STATUS_CODE_OPTIONS;
  readonly methodOptions = METHOD_OPTIONS;
  readonly protocolOptions = PROTOCOL_OPTIONS;

  private readonly initialPathState = splitPathWithQuery(this.test?.pathWithQuery ?? '');
  private readonly initialQuery =
    stringifyQuery(this.test?.requestData?.query) || this.initialPathState.query;

  formModel = signal<RedirectTestFormModel>({
    domainGroupId: this.test?.domainGroupId ?? this.data?.domainGroupId ?? '',
    hostname: this.test?.requestData?.hostname ?? '',
    path: this.initialPathState.path || '/',
    query: this.initialQuery,
    method: this.test?.requestData?.method ?? '',
    protocol: this.test?.requestData?.protocol ?? '',
    ip: this.test?.requestData?.ip ?? '',
    userAgent: this.test?.requestData?.userAgent ?? '',
    headers: stringifyHeaders(this.test?.requestData?.headers),
    expectedStatusCode: String(this.test?.expectedResult?.statusCode ?? 302),
    expectedTarget: this.test?.expectedResult?.target ?? ''
  });

  form = form(this.formModel, (f) => {
    required(f.domainGroupId);
    required(f.path);
    required(f.expectedStatusCode);
  });

  readonly expectedStatusCode = computed(() => Number(this.formModel().expectedStatusCode));
  readonly expectedRequiresTarget = computed(() => this.expectedStatusCode() !== 404);
  readonly pendingSubmit = signal(false);
  readonly submitKey = signal(CREATE_ENTITY_ID);
  readonly submitErrorSequence = signal(0);
  readonly submitLoadingSeen = signal(false);
  readonly simulating = signal(false);
  readonly simulatedResult = signal<RedirectTestResult | null>(null);
  private readonly simulationKey = computed(() => {
    const model = this.formModel();
    return JSON.stringify({
      domainGroupId: model.domainGroupId,
      hostname: model.hostname,
      path: model.path,
      query: model.query,
      method: model.method,
      protocol: model.protocol,
      ip: model.ip,
      userAgent: model.userAgent,
      headers: model.headers
    });
  });
  private readonly lastSimulationKey = signal<string | null>(null);
  readonly pathHasDomain = computed(() =>
    /^https?:\/\//i.test(this.formModel().path.trim())
  );
  readonly groupMap = computed(() => {
    const map: Record<string, string> = {};
    for (const group of this.domainGroups()) {
      map[group.id] = group.name;
    }
    return map;
  });
  readonly selectedGroupLabel = computed(() => {
    const id = this.formModel().domainGroupId;
    return this.groupMap()[id] ?? id;
  });
  readonly domainsForGroup = computed(() => {
    const groupId = this.formModel().domainGroupId;
    if (!groupId) {
      return [];
    }
    return this.domains().filter((domain) => domain.domainGroupId === groupId);
  });
  readonly hostnameOptions = computed(() =>
    this.domainsForGroup().map((domain) => domain.name)
  );
  readonly scopeValid = computed(() => {
    const model = this.formModel();
    return (
      !!model.domainGroupId &&
      model.path.trim().length > 0 &&
      !this.pathHasDomain()
    );
  });
  readonly expectationValid = computed(() => {
    const model = this.formModel();
    if (!this.isValidStatusCode(model.expectedStatusCode)) {
      return false;
    }
    if (this.expectedRequiresTarget() && !model.expectedTarget.trim()) {
      return false;
    }
    return true;
  });
  readonly simulateDisabled = computed(() => {
    const model = this.formModel();
    return (
      this.simulating() ||
      !model.domainGroupId ||
      !model.path.trim() ||
      this.pathHasDomain()
    );
  });

  readonly canSubmit = computed(() => {
    const model = this.formModel();
    if (!model.domainGroupId || !model.path.trim() || !model.expectedStatusCode) {
      return false;
    }
    if (this.pathHasDomain()) {
      return false;
    }
    if (this.expectedRequiresTarget() && !model.expectedTarget.trim()) {
      return false;
    }
    if (!this.isValidStatusCode(model.expectedStatusCode)) {
      return false;
    }
    return true;
  });

  readonly submitDisabled = computed(
    () => !this.canSubmit() || this.form().submitting() || this.pendingSubmit()
  );

  constructor() {
    this.domainGroupStore.searchList();
    this.domainStore.searchList();
    effect(
      () => {
        if (!this.pendingSubmit()) {
          return;
        }

        const key = this.submitKey();
        const loading = this.redirectTestStore.isLoading()[key] ?? false;
        if (loading) {
          if (!this.submitLoadingSeen()) {
            this.submitLoadingSeen.set(true);
          }
          return;
        }

        if (!this.submitLoadingSeen()) {
          return;
        }

        const hadError = this.redirectTestStore.errorSequence() !== this.submitErrorSequence();
        this.pendingSubmit.set(false);
        this.submitLoadingSeen.set(false);
        this.submitKey.set(CREATE_ENTITY_ID);

        if (!hadError) {
          if (this.isEdit && this.test) {
            this.redirectTestResultsStore.clearByIds([this.test.id]);
          }
          this.dialogRef.close(true);
        }
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      const groups = this.domainGroups();
      const current = this.formModel().domainGroupId;
      const hasCurrent = groups.some((group) => group.id === current);

      if (!current && groups.length === 1) {
        this.formModel.update((model) => ({
          ...model,
          domainGroupId: groups[0].id
        }));
        return;
      }

      if (current && !hasCurrent) {
        this.formModel.update((model) => ({
          ...model,
          domainGroupId: groups.length === 1 ? groups[0].id : ''
        }));
      }
    });

    effect(() => {
      const options = this.hostnameOptions();
      const currentHostname = this.formModel().hostname;

      if (currentHostname && !options.includes(currentHostname)) {
        this.formModel.update((model) => ({
          ...model,
          hostname: ''
        }));
      }
    });

    effect(() => {
      const key = this.simulationKey();
      if (this.lastSimulationKey() && this.lastSimulationKey() !== key) {
        this.simulatedResult.set(null);
        this.lastSimulationKey.set(null);
      }
    });

    effect(() => {
      if (!this.expectedRequiresTarget()) {
        this.formModel.update((model) => ({
          ...model,
          expectedTarget: ''
        }));
      }
    });
  }

  async simulateExpected(): Promise<void> {
    const model = this.formModel();
    if (!model.domainGroupId || !model.path.trim()) {
      this.snackBar.open('Provide a domain group and path to simulate.', 'Dismiss', {
        duration: 3000
      });
      return;
    }

    this.simulating.set(true);
    try {
      const requestData = buildRequestData({
        method: model.method,
        protocol: model.protocol,
        hostname: model.hostname,
        ip: model.ip,
        userAgent: model.userAgent,
        headers: model.headers,
        query: model.query
      });
      const entry = {
        domainGroupId: model.domainGroupId,
        hostname: requestData.hostname,
        path: ensureLeadingSlash(model.path.trim()),
        method: requestData.method,
        protocol: requestData.protocol,
        ip: requestData.ip,
        userAgent: requestData.userAgent,
        headers: requestData.headers,
        query: requestData.query
      };

      const response = await firstValueFrom(this.redirectRulesApi.simulate([entry]));
      const result = response?.results?.[0];
      if (!result) {
        throw new Error('Simulation failed to return a result.');
      }

      const expectedStatusCode = result.statusCode;
      this.formModel.update((current) => ({
        ...current,
        expectedStatusCode: String(expectedStatusCode),
        expectedTarget: result.target ?? ''
      }));

      this.simulatedResult.set({
        matched: result.matched,
        statusCode: result.statusCode,
        target: result.target ?? null
      });
      this.lastSimulationKey.set(this.simulationKey());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Simulation failed.';
      this.snackBar.open(message, 'Dismiss', { duration: 4000 });
    } finally {
      this.simulating.set(false);
    }
  }

  async onSubmit(event?: Event): Promise<void> {
    event?.preventDefault();
    await submit(this.form, async (formValue) => {
      const value = formValue().value();
      const pathWithQuery = buildPathWithQuery(value.path, value.query);
      const requestData = buildRequestData({
        method: value.method,
        protocol: value.protocol,
        hostname: value.hostname,
        ip: value.ip,
        userAgent: value.userAgent,
        headers: value.headers,
        query: value.query
      });

      const statusCode = Number(value.expectedStatusCode);
      const expectedResult: RedirectTestResult = {
        matched: statusCode !== 404,
        statusCode,
        target: statusCode === 404 ? null : value.expectedTarget.trim() || null
      };

      const payload = {
        pathWithQuery,
        requestData,
        expectedResult
      };

      const key = this.isEdit && this.test ? this.test.id : CREATE_ENTITY_ID;
      this.submitKey.set(key);
      this.submitErrorSequence.set(this.redirectTestStore.errorSequence());
      this.submitLoadingSeen.set(false);
      this.pendingSubmit.set(true);

      if (this.isEdit && this.test) {
        this.redirectTestStore.upsert({
          id: this.test.id,
          entity: payload
        });
      } else {
        this.redirectTestStore.upsert({
          entity: {
            ...payload,
            domainGroupId: value.domainGroupId
          }
        });
      }
      return undefined;
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private isValidStatusCode(value: string): boolean {
    const parsed = Number(value);
    return STATUS_CODE_OPTIONS.includes(parsed as (typeof STATUS_CODE_OPTIONS)[number]);
  }
}
