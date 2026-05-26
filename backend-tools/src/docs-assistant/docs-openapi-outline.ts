export interface OpenApiOperationOutline {
  method: string;
  path: string;
  operationId: string;
  summary: string;
  tags: string[];
}

export function buildOpenApiOutline(document: Record<string, unknown>): string {
  const paths = (document.paths ?? {}) as Record<string, Record<string, unknown>>;
  const operations: OpenApiOperationOutline[] = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
      const operation = pathItem?.[method];
      if (!operation || typeof operation !== 'object') {
        continue;
      }

      const op = operation as Record<string, unknown>;
      operations.push({
        method: method.toUpperCase(),
        path,
        operationId: String(op.operationId ?? ''),
        summary: String(op.summary ?? ''),
        tags: Array.isArray(op.tags) ? op.tags.map(String) : [],
      });
    }
  }

  const info = (document.info ?? {}) as Record<string, unknown>;
  const sliceMeta = (document['x-linkshift'] ?? {}) as Record<string, unknown>;
  const tagList = Array.isArray(document.tags)
    ? (document.tags as Array<{ name?: string }>).map((tag) => tag.name).filter(Boolean)
    : [];
  const sourceTag = String(sliceMeta.sourceTag ?? tagList[0] ?? 'unknown');

  const lines = [
    `# OpenAPI reference (tag: ${sourceTag})`,
    '',
    `Public contract: LinkShift API keys OpenAPI specification`,
    `Tag: ${sourceTag}`,
    `Title: ${String(info.title ?? 'LinkShift API')}`,
    `Version: ${String(info.version ?? 'unknown')}`,
    '',
    '## Operations',
    ...operations.map(
      (entry) =>
        `- **${entry.method} ${entry.path}**` +
        (entry.tags.length ? ` (${entry.tags.join(', ')})` : '') +
        (entry.operationId ? ` — \`${entry.operationId}\`` : '') +
        (entry.summary ? `: ${entry.summary}` : ''),
    ),
  ];

  return lines.join('\n');
}
