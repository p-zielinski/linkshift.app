import {
  Injectable,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const DRAFTS_STORAGE_KEY = 'linkshift.docs.tryMe.drafts.v1';

export type TryMeDraft = {
  pathParamsEditor: string;
  queryEditor: string;
  bodyEditor: string;
  requestError: string;
  responseStatus: number;
  responseStatusText: string;
  responseDurationMs: number;
  responseBody: string;
  responseHeaders: Array<{ name: string; value: string }>;
};

@Injectable({
  providedIn: 'root',
})
export class DocumentationTryMeDraftService {
  private readonly platformId = inject(PLATFORM_ID);

  private drafts = new Map<string, TryMeDraft>();

  constructor() {
    this.readFromSessionStorage();
  }

  getDraft(endpointId: string): TryMeDraft | null {
    return this.drafts.get(endpointId) ?? null;
  }

  setDraft(endpointId: string, draft: TryMeDraft): void {
    this.drafts.set(endpointId, draft);
    this.persist();
  }

  private readFromSessionStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const serialized = sessionStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!serialized) {
      return;
    }

    try {
      const parsed = JSON.parse(serialized);
      if (!parsed || typeof parsed !== 'object') {
        return;
      }

      for (const [endpointId, draft] of Object.entries(parsed)) {
        if (!draft || typeof draft !== 'object') {
          continue;
        }

        this.drafts.set(endpointId, draft as TryMeDraft);
      }
    } catch {
      // Ignore parse errors
    }
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const serialized = JSON.stringify(Object.fromEntries(this.drafts.entries()));
      sessionStorage.setItem(DRAFTS_STORAGE_KEY, serialized);
    } catch {
      // Ignore storage exceptions
    }
  }
}
