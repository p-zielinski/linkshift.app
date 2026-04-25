import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  untracked,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import qs from 'qs';
import {
  OpenApiDocument,
  OpenApiEndpoint,
  OpenApiMediaTypeObject,
  OpenApiParameterObject,
} from '../models/openapi.types';
import { DocumentationTryMeSessionService } from '../services/documentation-try-me-session.service';
import {
  DocumentationTryMeDraftService,
  TryMeDraft,
} from '../services/documentation-try-me-draft.service';
import { JsonCodeEditorComponent } from './json-code-editor.component';
import {
  buildExampleFromSchema,
  collectPropertySuggestions,
  PropertySuggestion,
} from '../utils/openapi-schema-tree';
import { resolveSchema } from '../utils/openapi-resolver';
import { APP_CONFIG } from '../../../core/config/app-runtime-config';

@Component({
  selector: 'app-api-try-me',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    JsonCodeEditorComponent,
  ],
  templateUrl: './api-try-me.component.html',
  styleUrl: './api-try-me.component.css',
})
export class ApiTryMeComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly session = inject(DocumentationTryMeSessionService);
  private readonly drafts = inject(DocumentationTryMeDraftService);
  private readonly appConfig = inject(APP_CONFIG);

  readonly endpoint = input.required<OpenApiEndpoint>();
  readonly document = input.required<OpenApiDocument>();
  readonly defaultBaseUrl = input.required<string>();
  readonly apiServerUrl = computed(() => this.appConfig.APP_BASE_URL.replace(/\/+$/, ''));

  readonly pathParamsEditor = signal('{}');
  readonly queryEditor = signal('{}');
  readonly bodyEditor = signal('{}');

  readonly requestError = signal('');
  readonly running = signal(false);
  readonly responseStatus = signal(0);
  readonly responseStatusText = signal('');
  readonly responseDurationMs = signal(0);
  readonly responseBody = signal('');
  readonly responseHeaders = signal<Array<{ name: string; value: string }>>([]);
  readonly hydratedEndpointId = signal('');

  readonly pathParameters = computed(() =>
    this.endpoint().parameters.filter((parameter) => parameter.in === 'path'),
  );

  readonly queryParameters = computed(() =>
    this.endpoint().parameters.filter((parameter) => parameter.in === 'query'),
  );

  readonly requestSchema = computed(() => {
    const mediaType =
      this.endpoint().requestBody?.content?.['application/json'] ??
      firstMediaType(this.endpoint().requestBody?.content);

    return mediaType?.schema;
  });

  readonly bodySuggestions = computed(() =>
    collectPropertySuggestions(this.document(), this.requestSchema()),
  );

  readonly querySuggestions = computed<PropertySuggestion[]>(() =>
    this.queryParameters().map((parameter) => ({
      label: parameter.name,
      detail: resolveParameterType(parameter),
    })),
  );
  readonly pathSuggestions = computed<PropertySuggestion[]>(() =>
    this.pathParameters().map((parameter) => ({
      label: parameter.name,
      detail: resolveParameterType(parameter),
    })),
  );

  constructor() {
    effect(() => {
      const endpointId = this.endpoint().id;
      const draft = this.readDraft(endpointId);

      if (draft) {
        this.pathParamsEditor.set(draft.pathParamsEditor);
        this.queryEditor.set(draft.queryEditor);
        this.bodyEditor.set(draft.bodyEditor);
        this.requestError.set(draft.requestError);
        this.responseStatus.set(draft.responseStatus);
        this.responseStatusText.set(draft.responseStatusText);
        this.responseDurationMs.set(draft.responseDurationMs);
        this.responseBody.set(draft.responseBody);
        this.responseHeaders.set(draft.responseHeaders);
        this.hydratedEndpointId.set(endpointId);
        return;
      }

      const document = this.document();
      const endpoint = this.endpoint();

      const pathDefaults = this.makeParameterDefaults(
        document,
        endpoint.parameters.filter((parameter) => parameter.in === 'path'),
      );
      const queryDefaults = this.makeParameterDefaults(
        document,
        endpoint.parameters.filter((parameter) => parameter.in === 'query' && parameter.required),
      );
      const bodyDefault = this.makeBodyDefault(document, endpoint);

      this.pathParamsEditor.set(formatJson(pathDefaults));
      this.queryEditor.set(formatJson(queryDefaults));
      this.bodyEditor.set(formatJson(bodyDefault));

      this.responseStatus.set(0);
      this.responseStatusText.set('');
      this.responseDurationMs.set(0);
      this.responseBody.set('');
      this.responseHeaders.set([]);
      this.requestError.set('');
      this.hydratedEndpointId.set(endpointId);
    });

    effect(() => {
      const endpointId = this.endpoint().id;
      if (this.hydratedEndpointId() !== endpointId) {
        return;
      }

      const draft: TryMeDraft = {
        pathParamsEditor: this.pathParamsEditor(),
        queryEditor: this.queryEditor(),
        bodyEditor: this.bodyEditor(),
        requestError: this.requestError(),
        responseStatus: this.responseStatus(),
        responseStatusText: this.responseStatusText(),
        responseDurationMs: this.responseDurationMs(),
        responseBody: this.responseBody(),
        responseHeaders: this.responseHeaders(),
      };

      untracked(() => {
        this.drafts.setDraft(endpointId, draft);
      });
    });
  }

  async runRequest(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.requestError.set('Try me is available in browser only');
      return;
    }

    this.requestError.set('');

    const endpoint = this.endpoint();
    const baseUrl = this.apiServerUrl();
    if (!baseUrl) {
      this.requestError.set('Base URL is required');
      return;
    }

    let pathParams: Record<string, unknown> = {};
    let queryObject: Record<string, unknown> = {};
    let bodyPayload: unknown = undefined;

    try {
      pathParams = parseJsonObject(this.pathParamsEditor(), 'Path params');
      queryObject = parseJsonObject(this.queryEditor(), 'Query');
      bodyPayload = parseJsonValue(this.bodyEditor(), 'Body');
    } catch (error) {
      this.requestError.set(error instanceof Error ? error.message : 'Invalid JSON payload');
      return;
    }

    const path = applyPathParams(endpoint.path, pathParams);
    if (!path) {
      this.requestError.set('Path params are missing required values');
      return;
    }

    const url = toUrl(baseUrl, path);
    if (!url) {
      this.requestError.set('Base URL is invalid');
      return;
    }

    const queryString = qs.stringify(queryObject, {
      arrayFormat: 'repeat',
      encodeValuesOnly: true,
      allowDots: false,
    });

    if (queryString) {
      url.search = queryString;
    }

    const headers: Record<string, string> = {
      Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
    };

    const apiKey = this.session.apiKey().trim();
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    const hasJsonRequestBody = !!this.requestSchema();
    const method = endpoint.method.toUpperCase();
    let requestBodyText: string | undefined;

    if (hasJsonRequestBody && method !== 'GET' && method !== 'HEAD') {
      requestBodyText = JSON.stringify(bodyPayload ?? {}, null, 2);
      headers['Content-Type'] = 'application/json';
    }

    this.running.set(true);
    this.responseStatus.set(0);
    this.responseStatusText.set('');
    this.responseBody.set('');
    this.responseHeaders.set([]);

    const startedAt = performance.now();

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: requestBodyText,
      });

      const elapsed = Math.round(performance.now() - startedAt);
      this.responseDurationMs.set(elapsed);
      this.responseStatus.set(response.status);
      this.responseStatusText.set(response.statusText);

      this.responseHeaders.set(
        Array.from(response.headers.entries()).map(([name, value]) => ({
          name,
          value,
        })),
      );

      const text = await response.text();
      this.responseBody.set(formatResponseBody(text, response.headers.get('content-type')));
    } catch (error) {
      this.requestError.set(error instanceof Error ? error.message : 'Request execution failed');
    } finally {
      this.running.set(false);
    }
  }

  setApiKey(value: string): void {
    this.session.setApiKey(value);
  }

  private makeParameterDefaults(
    document: OpenApiDocument,
    parameters: OpenApiParameterObject[],
  ): Record<string, unknown> {
    const defaults: Record<string, unknown> = {};

    for (const parameter of parameters) {
      if (parameter.example !== undefined) {
        defaults[parameter.name] = parameter.example;
        continue;
      }

      const schema = resolveSchema(document, parameter.schema);
      if (!schema) {
        defaults[parameter.name] = '';
        continue;
      }

      const example = buildExampleFromSchema(document, schema);
      defaults[parameter.name] = example === null || example === undefined ? '' : example;
    }

    return defaults;
  }

  private makeBodyDefault(document: OpenApiDocument, endpoint: OpenApiEndpoint): unknown {
    const schema =
      endpoint.requestBody?.content?.['application/json']?.schema ??
      firstMediaType(endpoint.requestBody?.content)?.schema;

    if (!schema) {
      return {};
    }

    const example = buildExampleFromSchema(document, schema);

    if (example === null || example === undefined || example === '') {
      return {};
    }

    return example;
  }

  private readDraft(endpointId: string): TryMeDraft | null {
    return this.drafts.getDraft(endpointId);
  }
}

function parseJsonObject(value: string, label: string): Record<string, unknown> {
  const parsed = parseJsonValue(value, label);

  if (Array.isArray(parsed) || typeof parsed !== 'object' || parsed === null) {
    throw new Error(`${label} must be a JSON object`);
  }

  return parsed as Record<string, unknown>;
}

function parseJsonValue(value: string, label: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) {
    return {};
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(`${label} contains invalid JSON`);
  }
}

function applyPathParams(
  path: string,
  params: Record<string, unknown>,
): string | null {
  const matches = path.match(/\{([^}]+)\}/g) ?? [];
  let resolvedPath = path;

  for (const match of matches) {
    const name = match.slice(1, -1);
    const value = params[name];

    if (value === undefined || value === null || value === '') {
      return null;
    }

    resolvedPath = resolvedPath.replace(match, encodeURIComponent(String(value)));
  }

  return resolvedPath;
}

function toUrl(baseUrl: string, path: string): URL | null {
  try {
    return new URL(path, baseUrl);
  } catch {
    return null;
  }
}

function formatResponseBody(body: string, contentType: string | null): string {
  if (!body) {
    return '';
  }

  const isJsonLike = (contentType ?? '').includes('application/json');
  if (!isJsonLike) {
    return body;
  }

  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

function formatJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

function firstMediaType(
  content: Record<string, OpenApiMediaTypeObject> | undefined,
): OpenApiMediaTypeObject | undefined {
  if (!content) {
    return undefined;
  }

  const mediaTypes = Object.values(content);
  if (!mediaTypes.length) {
    return undefined;
  }

  return mediaTypes[0];
}

function resolveParameterType(parameter: OpenApiParameterObject): string {
  const schema = parameter.schema;
  if (!schema) {
    return 'unknown';
  }

  if ('$ref' in schema) {
    return `ref:${schema.$ref.split('/').at(-1) ?? 'schema'}`;
  }

  const type = schema.type;
  if (Array.isArray(type)) {
    return type.join(' | ');
  }
  return type ?? 'unknown';
}
