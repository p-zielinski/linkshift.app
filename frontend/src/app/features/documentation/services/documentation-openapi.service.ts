import {
  HttpClient,
} from '@angular/common/http';
import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { take } from 'rxjs/operators';
import { parse as parseYaml } from 'yaml';
import {
  OpenApiDocument,
  OpenApiEndpoint,
  OpenApiTagGroup,
} from '../models/openapi.types';
import {
  groupEndpointsByTag,
  listEndpoints,
  resolveSecuritySchemeDescriptions,
} from '../utils/openapi-resolver';

const OPENAPI_URL = '/linkshift-api-keys.openapi.yaml';
const OPENAPI_SESSION_STORAGE_KEY = 'linkshift.docs.openapi.v1';

type OpenApiLoadState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  document: OpenApiDocument | null;
  error: string;
};

@Injectable({
  providedIn: 'root',
})
export class DocumentationOpenApiService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly state = signal<OpenApiLoadState>({
    status: 'idle',
    document: null,
    error: '',
  });

  readonly status = computed(() => this.state().status);
  readonly loading = computed(() => this.state().status === 'loading');
  readonly ready = computed(() => this.state().status === 'ready');
  readonly error = computed(() => this.state().error);
  readonly document = computed(() => this.state().document);

  readonly endpoints = computed<OpenApiEndpoint[]>(() => {
    const document = this.document();
    if (!document) {
      return [];
    }
    return listEndpoints(document);
  });

  readonly endpointMap = computed(() => {
    const map = new Map<string, OpenApiEndpoint>();
    for (const endpoint of this.endpoints()) {
      map.set(endpoint.id, endpoint);
    }
    return map;
  });

  readonly tagGroups = computed<OpenApiTagGroup[]>(() => {
    const document = this.document();
    if (!document) {
      return [];
    }
    return groupEndpointsByTag(document, this.endpoints());
  });

  readonly apiBaseUrl = computed(() => {
    const document = this.document();
    const configured = document?.servers?.[0]?.url?.trim();
    if (configured) {
      return configured;
    }

    if (isPlatformBrowser(this.platformId) && window.location.origin) {
      return window.location.origin;
    }

    return 'https://linkshift.app';
  });

  readonly globalSecurity = computed(() => {
    const document = this.document();
    if (!document) {
      return [];
    }

    return resolveSecuritySchemeDescriptions(document, document.security ?? []);
  });

  load(): void {
    if (this.state().status === 'loading' || this.state().status === 'ready') {
      return;
    }

    const cachedDocument = this.readFromSessionStorage();
    if (cachedDocument) {
      this.state.set({
        status: 'ready',
        document: cachedDocument,
        error: '',
      });
      return;
    }

    this.state.set({
      status: 'loading',
      document: null,
      error: '',
    });

    this.http
      .get(OPENAPI_URL, { responseType: 'text' })
      .pipe(take(1))
      .subscribe({
        next: (yamlText) => {
          try {
            const document = this.parseDocument(yamlText);
            this.state.set({
              status: 'ready',
              document,
              error: '',
            });
            this.writeToSessionStorage(document);
          } catch (error) {
            this.state.set({
              status: 'error',
              document: null,
              error: this.normalizeError(error),
            });
          }
        },
        error: (error) => {
          this.state.set({
            status: 'error',
            document: null,
            error: this.normalizeError(error),
          });
        },
      });
  }

  getEndpointById(id: string): OpenApiEndpoint | null {
    return this.endpointMap().get(id) ?? null;
  }

  private parseDocument(yamlText: string): OpenApiDocument {
    const parsed = parseYaml(yamlText);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('OpenAPI file is not a valid object');
    }

    const document = parsed as OpenApiDocument;

    if (!document.openapi || !document.paths) {
      throw new Error('OpenAPI file is missing required fields');
    }

    return document;
  }

  private normalizeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unable to load OpenAPI specification';
  }

  private readFromSessionStorage(): OpenApiDocument | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const serialized = sessionStorage.getItem(OPENAPI_SESSION_STORAGE_KEY);
    if (!serialized) {
      return null;
    }

    try {
      const parsed = JSON.parse(serialized);
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      return parsed as OpenApiDocument;
    } catch {
      return null;
    }
  }

  private writeToSessionStorage(document: OpenApiDocument): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      sessionStorage.setItem(OPENAPI_SESSION_STORAGE_KEY, JSON.stringify(document));
    } catch {
      // Ignore storage exceptions (private mode/quota)
    }
  }
}
