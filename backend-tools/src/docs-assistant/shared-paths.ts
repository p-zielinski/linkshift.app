import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function resolveSharedRoot(): string {
  const candidates = [
    resolve(process.cwd(), '../shared'),
    resolve(__dirname, '../../../../shared'),
    '/app/shared',
  ];

  for (const candidate of candidates) {
    if (existsSync(resolve(candidate, 'docs'))) {
      return candidate;
    }
  }

  return candidates[0];
}

export function resolveDocsSummariesRoot(): string {
  return resolve(resolveSharedRoot(), 'docs-summaries');
}

export function resolveDocsPagesRoot(): string {
  return resolve(resolveSharedRoot(), 'docs', 'pages');
}

export function resolveDocsOpenApiRoot(): string {
  return resolve(resolveSharedRoot(), 'docs', 'openapi');
}
