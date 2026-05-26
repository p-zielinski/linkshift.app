import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DocsCatalogEntry, DocsContentSource } from './docs-catalog.service';
import { buildOpenApiContextPreamble, sectionTitleForSource } from './docs-catalog-metadata';
import { buildOpenApiOutline } from './docs-openapi-outline';
import { resolveDocsOpenApiRoot, resolveDocsPagesRoot } from './shared-paths';

@Injectable()
export class DocsContentLoaderService {
  loadContext(entries: DocsCatalogEntry[]): string {
    const sections: string[] = [];
    const seenSources = new Set<string>();

    for (const entry of entries) {
      for (const source of entry.contentSources) {
        const key = `${source.type}:${source.docsRelativePath}`;
        if (seenSources.has(key)) {
          continue;
        }

        seenSources.add(key);
        const loaded = this.loadSource(source, entry);
        if (loaded) {
          sections.push(loaded);
        }
      }
    }

    return sections.join('\n\n');
  }

  private loadSource(source: DocsContentSource, entry: DocsCatalogEntry): string | null {
    const sectionTitle = sectionTitleForSource(source, entry);

    if (source.type === 'page-md') {
      const absolutePath = join(resolveDocsPagesRoot(), source.docsRelativePath.replace(/^pages\//, ''));
      if (!existsSync(absolutePath)) {
        return null;
      }

      const content = readFileSync(absolutePath, 'utf8');
      return [`## ${sectionTitle}`, content].join('\n');
    }

    const sliceFileName = source.docsRelativePath.split('/').at(-1) ?? '';
    const absolutePath = join(resolveDocsOpenApiRoot(), 'by-tag', sliceFileName);
    if (!existsSync(absolutePath)) {
      return null;
    }

    const document = JSON.parse(readFileSync(absolutePath, 'utf8')) as Record<string, unknown>;
    const outline = buildOpenApiOutline(document);
    const openApiTag = source.openApiTag ?? 'API';
    const preamble = buildOpenApiContextPreamble(openApiTag);

    return [`## ${sectionTitle}`, preamble, '', outline].join('\n');
  }
}
