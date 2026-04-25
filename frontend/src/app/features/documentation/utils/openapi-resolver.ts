import {
  HttpMethod,
  OpenApiDocument,
  OpenApiEndpoint,
  OpenApiOperationObject,
  OpenApiParameterObject,
  OpenApiPathItemObject,
  OpenApiReferenceObject,
  OpenApiRequestBodyObject,
  OpenApiResponseObject,
  OpenApiSchemaObject,
  OpenApiSecurityRequirement,
  OpenApiTagGroup,
} from '../models/openapi.types';

const METHOD_ORDER: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
const OPENAPI_WARNED_MESSAGES = new Set<string>();

export function isReferenceObject(value: unknown): value is OpenApiReferenceObject {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return '$ref' in value;
}

export function resolveReference<T>(
  document: OpenApiDocument,
  value: T | OpenApiReferenceObject | undefined,
  visitedRefs: Set<string> = new Set(),
): T | null {
  if (!value) {
    return null;
  }

  if (!isReferenceObject(value)) {
    return value as T;
  }

  const refPath = value.$ref;
  if (!refPath.startsWith('#/')) {
    warnOnce(`Unsupported OpenAPI reference path: ${refPath}`);
    return null;
  }

  if (visitedRefs.has(refPath)) {
    warnOnce(`Circular OpenAPI reference detected: ${refPath}`);
    return null;
  }

  const nextVisited = new Set(visitedRefs);
  nextVisited.add(refPath);

  const resolved = resolveJsonPointer(document as unknown as Record<string, unknown>, refPath);
  if (!resolved || typeof resolved !== 'object') {
    warnOnce(`Unable to resolve OpenAPI reference: ${refPath}`);
    return null;
  }

  if (isReferenceObject(resolved)) {
    return resolveReference<T>(document, resolved, nextVisited);
  }

  return resolved as T;
}

export function resolveSchema(
  document: OpenApiDocument,
  schema: OpenApiSchemaObject | OpenApiReferenceObject | undefined,
  visitedRefs: Set<string> = new Set(),
): OpenApiSchemaObject | null {
  return resolveReference<OpenApiSchemaObject>(document, schema, visitedRefs);
}

export function resolveRequestBody(
  document: OpenApiDocument,
  requestBody: OpenApiRequestBodyObject | OpenApiReferenceObject | undefined,
): OpenApiRequestBodyObject | null {
  return resolveReference<OpenApiRequestBodyObject>(document, requestBody);
}

export function resolveParameter(
  document: OpenApiDocument,
  parameter: OpenApiParameterObject | OpenApiReferenceObject,
): OpenApiParameterObject | null {
  return resolveReference<OpenApiParameterObject>(document, parameter);
}

export function resolveResponse(
  document: OpenApiDocument,
  response: OpenApiResponseObject | OpenApiReferenceObject,
): OpenApiResponseObject | null {
  return resolveReference<OpenApiResponseObject>(document, response);
}

export function listEndpoints(document: OpenApiDocument): OpenApiEndpoint[] {
  const paths = document.paths ?? {};
  const endpoints: OpenApiEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    const resolvedPathItem = pathItem as OpenApiPathItemObject;
    const pathParameters = resolvedPathItem.parameters ?? [];

    for (const method of METHOD_ORDER) {
      const operation = resolvedPathItem[method];
      if (!operation) {
        continue;
      }

      endpoints.push(
        toEndpoint({
          document,
          operation,
          method,
          path,
          pathParameters,
        }),
      );
    }
  }

  return endpoints.sort((left, right) => {
    const leftTag = left.tags[0] ?? 'General';
    const rightTag = right.tags[0] ?? 'General';

    if (leftTag !== rightTag) {
      return leftTag.localeCompare(rightTag);
    }

    if (left.path !== right.path) {
      return left.path.localeCompare(right.path);
    }

    return METHOD_ORDER.indexOf(left.method) - METHOD_ORDER.indexOf(right.method);
  });
}

export function groupEndpointsByTag(
  document: OpenApiDocument,
  endpoints: OpenApiEndpoint[],
): OpenApiTagGroup[] {
  const tagDescriptions = new Map<string, string>();
  for (const tag of document.tags ?? []) {
    tagDescriptions.set(tag.name, tag.description ?? '');
  }

  const grouped = new Map<string, OpenApiEndpoint[]>();

  for (const endpoint of endpoints) {
    const primaryTag = endpoint.tags[0] ?? 'General';
    const existing = grouped.get(primaryTag);
    if (existing) {
      existing.push(endpoint);
    } else {
      grouped.set(primaryTag, [endpoint]);
    }
  }

  return Array.from(grouped.entries())
    .map(([tag, tagEndpoints]) => ({
      tag,
      description: tagDescriptions.get(tag) ?? '',
      endpoints: tagEndpoints,
    }))
    .sort((left, right) => left.tag.localeCompare(right.tag));
}

function toEndpoint(input: {
  document: OpenApiDocument;
  method: HttpMethod;
  path: string;
  operation: OpenApiOperationObject;
  pathParameters: Array<OpenApiParameterObject | OpenApiReferenceObject>;
}): OpenApiEndpoint {
  const { document, method, path, operation, pathParameters } = input;
  const operationId = resolveOperationId(operation, method, path);
  const parameters = mergeParameters(document, pathParameters, operation.parameters ?? []);

  const responses = Object.entries(operation.responses ?? {})
    .map(([statusCode, response]) => ({
      statusCode,
      response: resolveResponse(document, response) ?? { description: 'No response details' },
    }))
    .sort((left, right) => compareStatusCodes(left.statusCode, right.statusCode));

  const requestBody = resolveRequestBody(document, operation.requestBody);
  const security = operation.security ?? document.security ?? [];

  return {
    id: operationId,
    operationId,
    method,
    path,
    summary: operation.summary?.trim() || `${method.toUpperCase()} ${path}`,
    description: operation.description?.trim() ?? '',
    tags: operation.tags?.length ? operation.tags : ['General'],
    deprecated: operation.deprecated ?? false,
    parameters,
    requestBody,
    responses,
    security,
  };
}

function resolveOperationId(
  operation: OpenApiOperationObject,
  method: HttpMethod,
  path: string,
): string {
  const fromSpec = operation.operationId?.trim();
  if (fromSpec) {
    return fromSpec;
  }

  return `${method}_${path
    .replace(/^\/+/, '')
    .replace(/\{([^}]+)\}/g, '$1')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()}`;
}

function mergeParameters(
  document: OpenApiDocument,
  pathParameters: Array<OpenApiParameterObject | OpenApiReferenceObject>,
  operationParameters: Array<OpenApiParameterObject | OpenApiReferenceObject>,
): OpenApiParameterObject[] {
  const merged = new Map<string, OpenApiParameterObject>();

  for (const parameter of pathParameters) {
    const resolved = resolveParameter(document, parameter);
    if (!resolved) {
      continue;
    }

    merged.set(parameterKey(resolved), resolved);
  }

  for (const parameter of operationParameters) {
    const resolved = resolveParameter(document, parameter);
    if (!resolved) {
      continue;
    }

    merged.set(parameterKey(resolved), resolved);
  }

  return Array.from(merged.values()).sort((left, right) => {
    if (left.in !== right.in) {
      return left.in.localeCompare(right.in);
    }
    return left.name.localeCompare(right.name);
  });
}

function parameterKey(parameter: OpenApiParameterObject): string {
  return `${parameter.in}:${parameter.name}`;
}

function compareStatusCodes(left: string, right: string): number {
  const leftScore = parseStatusCode(left);
  const rightScore = parseStatusCode(right);
  return leftScore - rightScore;
}

function parseStatusCode(statusCode: string): number {
  if (statusCode === 'default') {
    return Number.MAX_SAFE_INTEGER;
  }

  const parsed = Number.parseInt(statusCode, 10);
  if (Number.isNaN(parsed)) {
    return Number.MAX_SAFE_INTEGER - 1;
  }

  return parsed;
}

function resolveJsonPointer(root: Record<string, unknown>, pointer: string): unknown {
  const segments = pointer.replace(/^#\//, '').split('/').map(unescapePointerSegment);

  let current: unknown = root;

  for (const segment of segments) {
    if (!current || typeof current !== 'object') {
      return null;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function unescapePointerSegment(segment: string): string {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

function warnOnce(message: string): void {
  if (OPENAPI_WARNED_MESSAGES.has(message)) {
    return;
  }

  OPENAPI_WARNED_MESSAGES.add(message);
  // Helpful during docs/OpenAPI debugging.
  console.warn(`[LinkShift Docs] ${message}`);
}

export function resolveSecuritySchemeDescriptions(
  document: OpenApiDocument,
  securityRequirements: OpenApiSecurityRequirement[],
): Array<{ name: string; details: string }> {
  const securitySchemes = document.components?.securitySchemes ?? {};
  const resolved: Array<{ name: string; details: string }> = [];

  for (const requirement of securityRequirements) {
    for (const schemeName of Object.keys(requirement)) {
      const scheme = securitySchemes[schemeName];
      if (!scheme) {
        resolved.push({ name: schemeName, details: 'Defined in security requirement' });
        continue;
      }

      const parts: string[] = [scheme.type];
      if (scheme.in && scheme.name) {
        parts.push(`${scheme.in}:${scheme.name}`);
      }
      if (scheme.scheme) {
        parts.push(`scheme=${scheme.scheme}`);
      }
      if (scheme.bearerFormat) {
        parts.push(`format=${scheme.bearerFormat}`);
      }
      if (scheme.description?.trim()) {
        parts.push(scheme.description.trim());
      }

      resolved.push({
        name: schemeName,
        details: parts.join(' | '),
      });
    }
  }

  return deduplicateSchemeDescriptions(resolved);
}

function deduplicateSchemeDescriptions(
  values: Array<{ name: string; details: string }>,
): Array<{ name: string; details: string }> {
  const seen = new Set<string>();
  const deduplicated: Array<{ name: string; details: string }> = [];

  for (const value of values) {
    const key = `${value.name}::${value.details}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduplicated.push(value);
  }

  return deduplicated;
}
