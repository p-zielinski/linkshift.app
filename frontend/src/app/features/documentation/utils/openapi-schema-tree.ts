import {
  OpenApiDocument,
  OpenApiReferenceObject,
  OpenApiSchemaObject,
} from '../models/openapi.types';
import { isReferenceObject, resolveSchema } from './openapi-resolver';

export type SchemaTreeNode = {
  id: string;
  name: string;
  typeLabel: string;
  description: string;
  required: boolean;
  nullable: boolean;
  defaultValue: string;
  enumValues: string;
  format: string;
  constraints: string[];
  deprecated: boolean;
  readOnly: boolean;
  writeOnly: boolean;
  circularRef: boolean;
  children: SchemaTreeNode[];
};

export type PropertySuggestion = {
  label: string;
  detail: string;
};

const MAX_RECURSION_DEPTH = 12;

export function buildSchemaTree(
  document: OpenApiDocument,
  schema: OpenApiSchemaObject | OpenApiReferenceObject | undefined,
  rootName: string,
): SchemaTreeNode | null {
  if (!schema) {
    return null;
  }

  return buildSchemaTreeNode({
    document,
    schema,
    name: rootName,
    required: true,
    path: rootName,
    depth: 0,
    visitedRefs: new Set(),
  });
}

function buildSchemaTreeNode(input: {
  document: OpenApiDocument;
  schema: OpenApiSchemaObject | OpenApiReferenceObject;
  name: string;
  required: boolean;
  path: string;
  depth: number;
  visitedRefs: Set<string>;
}): SchemaTreeNode {
  const { document, schema, name, required, path, depth, visitedRefs } = input;

  if (depth > MAX_RECURSION_DEPTH) {
    return createNode({
      id: `${path}:max-depth`,
      name,
      typeLabel: 'object',
      required,
      description: 'Truncated: max schema depth reached',
      nullable: false,
      constraints: [],
      defaultValue: '',
      enumValues: '',
      format: '',
      deprecated: false,
      readOnly: false,
      writeOnly: false,
      circularRef: false,
      children: [],
    });
  }

  if (isReferenceObject(schema)) {
    const refPath = schema.$ref;
    if (visitedRefs.has(refPath)) {
      return createNode({
        id: `${path}:circular:${refPath}`,
        name,
        typeLabel: `ref:${shortRef(refPath)}`,
        required,
        description: 'Circular reference',
        nullable: false,
        constraints: [],
        defaultValue: '',
        enumValues: '',
        format: '',
        deprecated: false,
        readOnly: false,
        writeOnly: false,
        circularRef: true,
        children: [],
      });
    }

    const resolved = resolveSchema(document, schema, visitedRefs);

    if (!resolved) {
      console.warn(`[LinkShift Docs] Unable to resolve schema reference: ${refPath}`);
      return createNode({
        id: `${path}:invalid-ref:${refPath}`,
        name,
        typeLabel: `ref:${shortRef(refPath)}`,
        required,
        description: `Unable to resolve schema reference (${refPath})`,
        nullable: false,
        constraints: [],
        defaultValue: '',
        enumValues: '',
        format: '',
        deprecated: false,
        readOnly: false,
        writeOnly: false,
        circularRef: false,
        children: [],
      });
    }

    const nextVisited = new Set(visitedRefs);
    nextVisited.add(refPath);

    return buildSchemaTreeNode({
      document,
      schema: resolved,
      name,
      required,
      path,
      depth,
      visitedRefs: nextVisited,
    });
  }

  const normalized = normalizeSchemaForDisplay(document, schema, visitedRefs, depth);
  const nullable = isNullable(normalized);
  const typeLabel = resolveTypeLabel(document, normalized, visitedRefs, depth);
  const children: SchemaTreeNode[] = [];

  for (const [compositionName, list] of [
    ['anyOf', normalized.anyOf],
    ['oneOf', normalized.oneOf],
  ] as const) {
    if (!list?.length) {
      continue;
    }

    list.forEach((entry, index) => {
      children.push(
        buildSchemaTreeNode({
          document,
          schema: entry,
          name: `${compositionName}[${index + 1}]`,
          required: true,
          path: `${path}.${compositionName}[${index + 1}]`,
          depth: depth + 1,
          visitedRefs: cloneVisited(visitedRefs),
        }),
      );
    });
  }

  if (normalized.not) {
    children.push(
      buildSchemaTreeNode({
        document,
        schema: normalized.not,
        name: 'not',
        required: true,
        path: `${path}.not`,
        depth: depth + 1,
        visitedRefs: cloneVisited(visitedRefs),
      }),
    );
  }

  const requiredSet = new Set(normalized.required ?? []);
  for (const propertyName of Object.keys(normalized.properties ?? {}).sort((left, right) =>
    left.localeCompare(right),
  )) {
    const propertySchema = normalized.properties?.[propertyName];
    if (!propertySchema) {
      continue;
    }

    children.push(
      buildSchemaTreeNode({
        document,
        schema: propertySchema,
        name: propertyName,
        required: requiredSet.has(propertyName),
        path: `${path}.${propertyName}`,
        depth: depth + 1,
        visitedRefs: cloneVisited(visitedRefs),
      }),
    );
  }

  if (isArraySchema(normalized)) {
    children.push(
      ...buildArrayChildren({
        document,
        schema: normalized,
        parentName: name,
        parentPath: path,
        depth,
        visitedRefs,
      }),
    );
  }

  if (normalized.additionalProperties && typeof normalized.additionalProperties === 'object') {
    children.push(
      buildSchemaTreeNode({
        document,
        schema: normalized.additionalProperties,
        name: '[key: string]',
        required: false,
        path: `${path}.{additionalProperties}`,
        depth: depth + 1,
        visitedRefs: cloneVisited(visitedRefs),
      }),
    );
  }

  if (normalized.additionalProperties === true) {
    children.push(
      createNode({
        id: `${path}.{additionalProperties}`,
        name: '[key: string]',
        typeLabel: 'unknown',
        required: false,
        description: 'Additional properties are allowed',
        nullable: false,
        constraints: [],
        defaultValue: '',
        enumValues: '',
        format: '',
        deprecated: false,
        readOnly: false,
        writeOnly: false,
        circularRef: false,
        children: [],
      }),
    );
  }

  return createNode({
    id: path,
    name,
    typeLabel,
    description: normalized.description ?? '',
    required,
    nullable,
    defaultValue: formatValue(normalized.default),
    enumValues: formatEnum(normalized.enum),
    format: normalized.format ?? '',
    constraints: readConstraints(normalized),
    deprecated: normalized.deprecated ?? false,
    readOnly: normalized.readOnly ?? false,
    writeOnly: normalized.writeOnly ?? false,
    circularRef: false,
    children,
  });
}

function createNode(node: SchemaTreeNode): SchemaTreeNode {
  return node;
}

function normalizeSchemaForDisplay(
  document: OpenApiDocument,
  schema: OpenApiSchemaObject,
  visitedRefs: Set<string>,
  depth: number,
): OpenApiSchemaObject {
  const merged = mergeAllOfSchema(document, schema, visitedRefs, depth);

  if (merged.oneOf?.length === 1) {
    const single = resolveSchema(document, merged.oneOf[0], visitedRefs);
    if (single) {
      return normalizeSchemaForDisplay(
        document,
        {
          ...single,
          ...omitKeys(merged, ['oneOf']),
        },
        visitedRefs,
        depth + 1,
      );
    }
  }

  if (merged.anyOf?.length === 1) {
    const single = resolveSchema(document, merged.anyOf[0], visitedRefs);
    if (single) {
      return normalizeSchemaForDisplay(
        document,
        {
          ...single,
          ...omitKeys(merged, ['anyOf']),
        },
        visitedRefs,
        depth + 1,
      );
    }
  }

  return merged;
}

function resolveTypeLabel(
  document: OpenApiDocument,
  schema: OpenApiSchemaObject,
  visitedRefs: Set<string>,
  depth: number,
): string {
  if (isArraySchema(schema)) {
    return `array of ${resolveArrayItemTypeLabel(document, schema, visitedRefs, depth + 1)}`;
  }

  return resolveNonArrayTypeLabel(schema);
}

function resolveNonArrayTypeLabel(schema: OpenApiSchemaObject): string {
  if (schema.oneOf?.length) {
    return 'oneOf';
  }
  if (schema.anyOf?.length) {
    return 'anyOf';
  }

  const baseTypes = schemaTypeList(schema);
  if (!baseTypes.length) {
    return 'unknown';
  }

  return baseTypes.join(' | ');
}

function resolveArrayItemTypeLabel(
  document: OpenApiDocument,
  schema: OpenApiSchemaObject,
  visitedRefs: Set<string>,
  depth: number,
): string {
  if (!schema.items || depth > MAX_RECURSION_DEPTH) {
    return 'unknown';
  }

  const resolvedItem = resolveSchema(document, schema.items, visitedRefs);
  if (!resolvedItem) {
    return 'unknown';
  }

  const normalizedItem = normalizeSchemaForDisplay(document, resolvedItem, visitedRefs, depth + 1);
  const optionLabels = [...(normalizedItem.oneOf ?? []), ...(normalizedItem.anyOf ?? [])]
    .map((entry) => resolveSchema(document, entry, cloneVisited(visitedRefs)))
    .filter((entry): entry is OpenApiSchemaObject => !!entry)
    .map((entry) =>
      resolveNonArrayTypeLabel(
        normalizeSchemaForDisplay(document, entry, cloneVisited(visitedRefs), depth + 1),
      ),
    );

  if (optionLabels.length) {
    const deduped = Array.from(new Set(optionLabels));
    return deduped.join(' | ');
  }

  return resolveNonArrayTypeLabel(normalizedItem);
}

function isArraySchema(schema: OpenApiSchemaObject): boolean {
  const types = asTypeList(schema.type).filter((type) => type !== 'null');
  if (types.length === 1 && types[0] === 'array') {
    return true;
  }

  return types.length === 0 && !!schema.items;
}

function buildArrayChildren(input: {
  document: OpenApiDocument;
  schema: OpenApiSchemaObject;
  parentName: string;
  parentPath: string;
  depth: number;
  visitedRefs: Set<string>;
}): SchemaTreeNode[] {
  const { document, schema, parentName, parentPath, depth, visitedRefs } = input;

  if (!schema.items) {
    return [];
  }

  const itemNode = buildSchemaTreeNode({
    document,
    schema: schema.items,
    name: 'item',
    required: true,
    path: `${parentPath}[]`,
    depth: depth + 1,
    visitedRefs: cloneVisited(visitedRefs),
  });

  if (!itemNode.children.length) {
    return [];
  }

  if (
    itemNode.typeLabel.includes('object') &&
    !itemNode.typeLabel.includes('oneOf') &&
    !itemNode.typeLabel.includes('anyOf')
  ) {
    return itemNode.children;
  }

  return [
    createNode({
      ...itemNode,
      name: `${parentName} item`,
    }),
  ];
}

function mergeAllOfSchema(
  document: OpenApiDocument,
  schema: OpenApiSchemaObject,
  visitedRefs: Set<string>,
  depth: number,
): OpenApiSchemaObject {
  if (!schema.allOf?.length || depth > MAX_RECURSION_DEPTH) {
    return schema;
  }

  const base: OpenApiSchemaObject = { ...schema };
  delete base.allOf;

  const requiredSet = new Set(base.required ?? []);
  const propertyVariants = new Map<string, Array<OpenApiSchemaObject | OpenApiReferenceObject>>();
  const additionalPropertiesCandidates: Array<
    OpenApiSchemaObject | OpenApiReferenceObject | boolean
  > = [];
  const typeSet = new Set(asTypeList(base.type));
  let nullable = isNullable(base);

  collectProperties(base.properties, propertyVariants);
  if (base.additionalProperties !== undefined) {
    additionalPropertiesCandidates.push(base.additionalProperties);
  }

  for (const entry of schema.allOf) {
    const resolvedEntry = resolveSchema(document, entry, visitedRefs);
    if (!resolvedEntry) {
      continue;
    }

    const normalizedEntry = mergeAllOfSchema(document, resolvedEntry, visitedRefs, depth + 1);

    for (const required of normalizedEntry.required ?? []) {
      requiredSet.add(required);
    }

    collectProperties(normalizedEntry.properties, propertyVariants);
    if (normalizedEntry.additionalProperties !== undefined) {
      additionalPropertiesCandidates.push(normalizedEntry.additionalProperties);
    }

    asTypeList(normalizedEntry.type).forEach((type) => typeSet.add(type));
    nullable ||= isNullable(normalizedEntry);
  }

  const mergedProperties = mergePropertyVariants(propertyVariants);
  const mergedAdditionalProperties = mergeAdditionalProperties(additionalPropertiesCandidates);

  const mergedTypes = Array.from(typeSet).filter((type) => type !== 'null');
  if (
    !mergedTypes.length &&
    (Object.keys(mergedProperties).length > 0 || mergedAdditionalProperties)
  ) {
    mergedTypes.push('object');
  }
  if (nullable && !mergedTypes.includes('null')) {
    mergedTypes.push('null');
  }

  return {
    ...base,
    type: mergedTypes.length ? mergedTypes : base.type,
    required: requiredSet.size ? Array.from(requiredSet) : undefined,
    properties: Object.keys(mergedProperties).length ? mergedProperties : undefined,
    additionalProperties: mergedAdditionalProperties,
  };
}

function collectProperties(
  properties: Record<string, OpenApiSchemaObject | OpenApiReferenceObject> | undefined,
  target: Map<string, Array<OpenApiSchemaObject | OpenApiReferenceObject>>,
): void {
  if (!properties) {
    return;
  }

  for (const [key, value] of Object.entries(properties)) {
    const existing = target.get(key);
    if (existing) {
      existing.push(value);
    } else {
      target.set(key, [value]);
    }
  }
}

function mergePropertyVariants(
  variants: Map<string, Array<OpenApiSchemaObject | OpenApiReferenceObject>>,
): Record<string, OpenApiSchemaObject | OpenApiReferenceObject> {
  const merged: Record<string, OpenApiSchemaObject | OpenApiReferenceObject> = {};

  for (const [key, values] of variants.entries()) {
    const unique = deduplicateSchemas(values);
    if (!unique.length) {
      continue;
    }

    if (unique.length === 1) {
      merged[key] = unique[0];
    } else {
      merged[key] = {
        oneOf: unique,
      };
    }
  }

  return merged;
}

function mergeAdditionalProperties(
  candidates: Array<OpenApiSchemaObject | OpenApiReferenceObject | boolean>,
): OpenApiSchemaObject | OpenApiReferenceObject | boolean | undefined {
  if (!candidates.length) {
    return undefined;
  }

  if (candidates.includes(true)) {
    return true;
  }

  const schemaCandidates = candidates.filter(
    (candidate): candidate is OpenApiSchemaObject | OpenApiReferenceObject =>
      typeof candidate === 'object' && candidate !== null,
  );

  if (!schemaCandidates.length) {
    return false;
  }

  const unique = deduplicateSchemas(schemaCandidates);
  if (unique.length === 1) {
    return unique[0];
  }

  return {
    oneOf: unique,
  };
}

function deduplicateSchemas<T extends OpenApiSchemaObject | OpenApiReferenceObject>(
  values: T[],
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const value of values) {
    const serialized = stableStringify(value);
    if (seen.has(serialized)) {
      continue;
    }

    seen.add(serialized);
    result.push(value);
  }

  return result;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(',')}}`;
}

function cloneVisited(value: Set<string>): Set<string> {
  return new Set(value);
}

function schemaTypeList(schema: OpenApiSchemaObject): string[] {
  const types = asTypeList(schema.type);

  if (!types.length) {
    if (schema.properties) {
      types.push('object');
    } else if (schema.items) {
      types.push('array');
    }
  }

  if (isNullable(schema) && !types.includes('null')) {
    types.push('null');
  }

  return types;
}

function asTypeList(type: string | string[] | undefined): string[] {
  if (!type) {
    return [];
  }

  return Array.isArray(type) ? [...type] : [type];
}

function isNullable(schema: OpenApiSchemaObject): boolean {
  if (schema.nullable) {
    return true;
  }

  return asTypeList(schema.type).includes('null');
}

function readConstraints(schema: OpenApiSchemaObject): string[] {
  const constraints: string[] = [];

  pushConstraint(constraints, 'minLength', schema.minLength);
  pushConstraint(constraints, 'maxLength', schema.maxLength);
  pushConstraint(constraints, 'pattern', schema.pattern);
  pushConstraint(constraints, 'minimum', schema.minimum);
  pushConstraint(constraints, 'maximum', schema.maximum);
  pushConstraint(constraints, 'exclusiveMinimum', schema.exclusiveMinimum);
  pushConstraint(constraints, 'exclusiveMaximum', schema.exclusiveMaximum);
  pushConstraint(constraints, 'minItems', schema.minItems);
  pushConstraint(constraints, 'maxItems', schema.maxItems);
  pushConstraint(constraints, 'uniqueItems', schema.uniqueItems);
  pushConstraint(constraints, 'minProperties', schema.minProperties);
  pushConstraint(constraints, 'maxProperties', schema.maxProperties);

  return constraints;
}

function pushConstraint(target: string[], key: string, value: unknown): void {
  if (value === undefined || value === null) {
    return;
  }

  target.push(`${key}: ${formatValue(value)}`);
}

function formatEnum(values: unknown[] | undefined): string {
  if (!values?.length) {
    return '';
  }

  return values.map((value) => formatValue(value)).join(', ');
}

function formatValue(value: unknown): string {
  if (value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value === null) {
    return 'null';
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function shortRef(refPath: string): string {
  const segments = refPath.split('/');
  return segments[segments.length - 1] ?? refPath;
}

function omitKeys<T extends object>(value: T, keys: string[]): Partial<T> {
  const result: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (keys.includes(key)) {
      continue;
    }
    result[key] = entry;
  }

  return result as Partial<T>;
}

export function buildExampleFromSchema(
  document: OpenApiDocument,
  schema: OpenApiSchemaObject | OpenApiReferenceObject | undefined,
  depth: number = 0,
): unknown {
  if (!schema || depth > MAX_RECURSION_DEPTH) {
    return null;
  }

  const resolved = resolveSchema(document, schema);
  if (!resolved) {
    return null;
  }

  const normalized = normalizeSchemaForDisplay(document, resolved, new Set(), depth);

  if (normalized.example !== undefined) {
    return normalized.example;
  }

  if (normalized.default !== undefined) {
    return normalized.default;
  }

  if (normalized.const !== undefined) {
    return normalized.const;
  }

  if (normalized.enum?.length) {
    return normalized.enum[0];
  }

  if (normalized.oneOf?.length) {
    return buildExampleFromSchema(document, normalized.oneOf[0], depth + 1);
  }

  if (normalized.anyOf?.length) {
    return buildExampleFromSchema(document, normalized.anyOf[0], depth + 1);
  }

  const type = resolveBaseType(normalized);

  if (type === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, propertySchema] of Object.entries(normalized.properties ?? {})) {
      const value = buildExampleFromSchema(document, propertySchema, depth + 1);
      if (value !== null && value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  }

  if (type === 'array') {
    const itemExample = buildExampleFromSchema(document, normalized.items, depth + 1);
    return itemExample === null || itemExample === undefined ? [] : [itemExample];
  }

  if (type === 'integer' || type === 'number') {
    return 0;
  }

  if (type === 'boolean') {
    return false;
  }

  if (type === 'null') {
    return null;
  }

  return '';
}

function resolveBaseType(schema: OpenApiSchemaObject): string {
  const types = asTypeList(schema.type).filter((type) => type !== 'null');

  if (types.length) {
    return types[0] ?? 'string';
  }

  if (schema.properties) {
    return 'object';
  }

  if (schema.items) {
    return 'array';
  }

  return 'string';
}

export function collectPropertySuggestions(
  document: OpenApiDocument,
  schema: OpenApiSchemaObject | OpenApiReferenceObject | undefined,
): PropertySuggestion[] {
  const resolved = resolveSchema(document, schema);
  if (!resolved) {
    return [];
  }

  const suggestions = new Map<string, string>();
  collectSuggestionsRecursive(
    document,
    normalizeSchemaForDisplay(document, resolved, new Set(), 0),
    suggestions,
    0,
  );
  return Array.from(suggestions.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, detail]) => ({ label, detail }));
}

function collectSuggestionsRecursive(
  document: OpenApiDocument,
  schema: OpenApiSchemaObject,
  suggestions: Map<string, string>,
  depth: number,
): void {
  if (depth > MAX_RECURSION_DEPTH) {
    return;
  }

  const normalized = normalizeSchemaForDisplay(document, schema, new Set(), depth);

  for (const [name, propertySchema] of Object.entries(normalized.properties ?? {})) {
    const resolved = resolveSchema(document, propertySchema);
    const detail = resolved
      ? suggestionTypeLabel(
          document,
          normalizeSchemaForDisplay(document, resolved, new Set(), depth + 1),
          depth + 1,
        )
      : 'unknown';

    if (!suggestions.has(name)) {
      suggestions.set(name, detail);
    }

    if (resolved) {
      collectSuggestionsRecursive(
        document,
        normalizeSchemaForDisplay(document, resolved, new Set(), depth + 1),
        suggestions,
        depth + 1,
      );
    }
  }

  for (const list of [normalized.oneOf, normalized.anyOf]) {
    if (!list?.length) {
      continue;
    }

    for (const entry of list) {
      const resolved = resolveSchema(document, entry);
      if (resolved) {
        collectSuggestionsRecursive(
          document,
          normalizeSchemaForDisplay(document, resolved, new Set(), depth + 1),
          suggestions,
          depth + 1,
        );
      }
    }
  }

  if (normalized.items) {
    const resolved = resolveSchema(document, normalized.items);
    if (resolved) {
      collectSuggestionsRecursive(
        document,
        normalizeSchemaForDisplay(document, resolved, new Set(), depth + 1),
        suggestions,
        depth + 1,
      );
    }
  }
}

function suggestionTypeLabel(
  document: OpenApiDocument,
  schema: OpenApiSchemaObject,
  depth: number,
): string {
  if (isArraySchema(schema)) {
    return `array of ${resolveArrayItemTypeLabel(document, schema, new Set(), depth + 1)}`;
  }

  return resolveNonArrayTypeLabel(schema);
}
