import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SeoService } from '../../../core/seo/seo.service';
import { SITE_CONFIG } from '../../../core/config/site-config';
import {
  OpenApiMediaTypeObject,
  OpenApiParameterObject,
  OpenApiSecurityRequirement,
  OpenApiSecuritySchemeObject,
} from '../models/openapi.types';
import { DocumentationOpenApiService } from '../services/documentation-openapi.service';
import { DocumentationScrollService } from '../services/documentation-scroll.service';
import { buildSchemaTree, SchemaTreeNode } from '../utils/openapi-schema-tree';
import { resolveSchema } from '../utils/openapi-resolver';
import { SchemaTreeComponent } from '../components/schema-tree.component';
import { DocumentationTryMeDialogComponent } from '../components/documentation-try-me-dialog.component';

type EndpointSecurityDetail = {
  id: string;
  name: string;
  typeLabel: string;
  details: string;
};

@Component({
  selector: 'app-documentation-endpoint-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    SchemaTreeComponent
  ],
  templateUrl: './documentation-endpoint-page.component.html',
  styleUrls: ['./documentation-endpoint-page.component.css', '../components/schema-tree.component.css'],
})
export class DocumentationEndpointPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly siteConfig = inject(SITE_CONFIG);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly docsScroll = inject(DocumentationScrollService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly openApi = inject(DocumentationOpenApiService);

  readonly endpointId = signal('');
  readonly selectedResponseCode = signal('');

  readonly endpoint = computed(() => this.openApi.getEndpointById(this.endpointId()));

  readonly parameterGroups = computed(() => {
    const endpoint = this.endpoint();
    if (!endpoint) {
      return {
        path: [] as OpenApiParameterObject[],
        query: [] as OpenApiParameterObject[],
        header: [] as OpenApiParameterObject[],
        cookie: [] as OpenApiParameterObject[],
      };
    }

    const groups = {
      path: [] as OpenApiParameterObject[],
      query: [] as OpenApiParameterObject[],
      header: [] as OpenApiParameterObject[],
      cookie: [] as OpenApiParameterObject[],
    };

    for (const parameter of endpoint.parameters) {
      groups[parameter.in].push(parameter);
    }

    return groups;
  });

  readonly parameterSections = computed(() => {
    const groups = this.parameterGroups();
    return [
      { label: 'Path parameters', params: groups.path },
      { label: 'Query parameters', params: groups.query },
      { label: 'Header parameters', params: groups.header },
      { label: 'Cookie parameters', params: groups.cookie },
    ].filter((entry) => entry.params.length > 0);
  });

  readonly requestBodyTree = computed(() => {
    const document = this.openApi.document();
    const endpoint = this.endpoint();

    if (!document || !endpoint) {
      return null;
    }

    const media = pickMediaType(endpoint.requestBody?.content);
    if (!media?.schema) {
      return null;
    }

    return buildSchemaTree(document, media.schema, 'requestBody');
  });

  readonly responseTrees = computed(() => {
    const document = this.openApi.document();
    const endpoint = this.endpoint();

    if (!document || !endpoint) {
      return [] as Array<{
        statusCode: string;
        description: string;
        contentType: string;
        tree: SchemaTreeNode | null;
      }>;
    }

    return endpoint.responses.map((response) => {
      const media = pickMediaType(response.response.content);
      const tree = media?.schema
        ? buildSchemaTree(document, media.schema, `response ${response.statusCode}`)
        : null;

      return {
        statusCode: response.statusCode,
        description: response.response.description ?? 'No description',
        contentType: media?.contentType ?? 'No response body schema',
        tree,
      };
    });
  });

  readonly selectedResponse = computed(() => {
    const selectedCode = this.selectedResponseCode();
    const responses = this.responseTrees();

    return (
      responses.find((response) => response.statusCode === selectedCode) ?? responses[0] ?? null
    );
  });

  readonly securityDetails = computed<EndpointSecurityDetail[]>(() => {
    const document = this.openApi.document();
    const endpoint = this.endpoint();

    if (!document || !endpoint) {
      return [];
    }

    return resolveEndpointSecurityDetails(
      endpoint.security,
      document.components?.securitySchemes ?? {},
    );
  });

  constructor() {
    this.openApi.load();

    effect(() => {
      const responses = this.responseTrees();
      if (!responses.length) {
        this.selectedResponseCode.set('');
        return;
      }

      const current = this.selectedResponseCode();
      const hasCurrent = responses.some((response) => response.statusCode === current);
      if (hasCurrent) {
        return;
      }

      const preferred =
        responses.find((response) => response.statusCode.startsWith('2')) ?? responses[0];

      if (preferred) {
        this.selectedResponseCode.set(preferred.statusCode);
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('operationId') ?? '';
      this.endpointId.set(id);
      this.selectedResponseCode.set('');

      const endpoint = this.openApi.getEndpointById(id);
      if (!endpoint) {
        if (this.openApi.ready()) {
          console.warn(
            `[LinkShift Docs] Endpoint not found for operationId "${id}". Available endpoints: ${this.openApi
              .endpoints()
              .map((entry) => entry.id)
              .join(', ')}`,
          );
        }
        this.seo.updateTags({
          title: `${this.siteConfig.name} | API reference`,
          description: 'Requested endpoint page was not found.',
          canonicalPath: '/docs/reference',
          keywords: 'linkshift api reference',
          type: 'article',
        });
        return;
      }

      this.seo.updateTags({
        title: `${this.siteConfig.name} | ${endpoint.summary}`,
        description: endpoint.description || `${endpoint.method.toUpperCase()} ${endpoint.path}`,
        canonicalPath: `/docs/api/${endpoint.id}`,
        keywords: `linkshift api, ${endpoint.operationId}, ${endpoint.path}`,
        type: 'article',
      });

      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      queueMicrotask(() => {
        if (this.docsScroll.currentFragment()) {
          this.docsScroll.retryAnchorScrollFromPage();
        } else {
          this.docsScroll.notifyRouteContentReady();
        }
      });
    });
  }

  parameterType(parameter: OpenApiParameterObject): string {
    const document = this.openApi.document();
    if (!document) {
      return 'unknown';
    }

    const schema = resolveSchema(document, parameter.schema);
    if (!schema) {
      return 'unknown';
    }

    const type = schema.type;
    if (Array.isArray(type)) {
      return type.join(' | ');
    }

    return type ?? 'unknown';
  }

  onResponseSelectionChange(statusCode: string): void {
    this.selectedResponseCode.set(statusCode);
  }

  openTryMeDialog(): void {
    const endpoint = this.endpoint();
    const document = this.openApi.document();
    if (!endpoint || !document) {
      return;
    }

    this.dialog.open(DocumentationTryMeDialogComponent, {
      width: 'min(1120px, 96vw)',
      maxHeight: '92vh',
      autoFocus: false,
      panelClass: 'docs-try-me-dialog',
      data: {
        endpoint,
        document,
        defaultBaseUrl: this.openApi.apiBaseUrl(),
      },
    });
  }
}

function pickMediaType(
  content: Record<string, OpenApiMediaTypeObject> | undefined,
): { contentType: string; schema: OpenApiMediaTypeObject['schema'] } | null {
  if (!content) {
    return null;
  }

  if (content['application/json']) {
    return {
      contentType: 'application/json',
      schema: content['application/json'].schema,
    };
  }

  const firstEntry = Object.entries(content)[0];
  if (!firstEntry) {
    return null;
  }

  const [contentType, mediaType] = firstEntry;
  return {
    contentType,
    schema: mediaType.schema,
  };
}

function resolveEndpointSecurityDetails(
  securityRequirements: OpenApiSecurityRequirement[],
  securitySchemes: Record<string, OpenApiSecuritySchemeObject>,
): EndpointSecurityDetail[] {
  const values: EndpointSecurityDetail[] = [];

  for (const requirement of securityRequirements) {
    const entries = Object.entries(requirement);
    if (!entries.length) {
      values.push(
        createSecurityDetail({
          name: 'No authentication',
          typeLabel: 'public',
          details: 'This operation allows unauthenticated requests.',
        }),
      );
      continue;
    }

    for (const [schemeName, scopes] of entries) {
      const scheme = securitySchemes[schemeName];
      values.push(toSecurityDetail(scheme, scopes));
    }
  }

  return deduplicateSecurityDetails(values);
}

function toSecurityDetail(
  scheme: OpenApiSecuritySchemeObject | undefined,
  scopes: string[],
): EndpointSecurityDetail {
  const details: string[] = [];
  if (scheme?.description?.trim()) {
    details.push(scheme.description.trim());
  }
  if (scopes.length) {
    details.push(`Scopes: ${scopes.join(', ')}`);
  }

  if (!scheme) {
    return createSecurityDetail({
      name: 'Authentication',
      typeLabel: 'security',
      details:
        details.join(' ') || 'Custom authentication scheme configured in OpenAPI requirements.',
    });
  }

  if (scheme.type === 'apiKey') {
    return createSecurityDetail({
      name: scheme.name?.trim() || 'API key',
      typeLabel: scheme.in?.trim() || 'apiKey',
      details: details.join(' ') || 'Provide API key to authorize requests.',
    });
  }

  if (scheme.type === 'http') {
    const normalizedScheme = scheme.scheme?.trim().toLowerCase();
    const name =
      normalizedScheme === 'bearer'
        ? 'Bearer token'
        : normalizedScheme === 'basic'
          ? 'Basic auth'
          : scheme.scheme?.trim()
            ? `${scheme.scheme.trim()} auth`
            : 'HTTP auth';

    if (scheme.bearerFormat?.trim()) {
      details.push(`Token format: ${scheme.bearerFormat.trim()}`);
    }

    return createSecurityDetail({
      name,
      typeLabel: 'http',
      details: details.join(' ') || 'HTTP authentication is required.',
    });
  }

  if (scheme.type === 'oauth2') {
    return createSecurityDetail({
      name: 'OAuth 2.0',
      typeLabel: 'oauth2',
      details: details.join(' ') || 'OAuth 2.0 authorization is required.',
    });
  }

  if (scheme.type === 'openIdConnect') {
    return createSecurityDetail({
      name: 'OpenID Connect',
      typeLabel: 'openIdConnect',
      details: details.join(' ') || 'OpenID Connect authentication is required.',
    });
  }

  return createSecurityDetail({
    name: 'Authentication',
    typeLabel: scheme.type,
    details: details.join(' ') || 'Authentication is required for this operation.',
  });
}

function createSecurityDetail(input: {
  name: string;
  typeLabel: string;
  details: string;
}): EndpointSecurityDetail {
  const key = [
    input.name.trim().toLowerCase(),
    input.typeLabel.trim().toLowerCase(),
    input.details.trim().toLowerCase(),
  ].join('::');

  return {
    id: key,
    name: input.name,
    typeLabel: input.typeLabel,
    details: input.details,
  };
}

function deduplicateSecurityDetails(values: EndpointSecurityDetail[]): EndpointSecurityDetail[] {
  const seen = new Set<string>();
  const deduplicated: EndpointSecurityDetail[] = [];

  for (const value of values) {
    if (seen.has(value.id)) {
      continue;
    }
    seen.add(value.id);
    deduplicated.push(value);
  }

  return deduplicated;
}
