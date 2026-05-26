import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import {
  buildOpenApiCatalogEntry,
  buildPageCatalogEntry,
  parseSummaryFrontmatter,
  toDocsPagePath,
  toOpenApiSlicePath,
} from './docs-catalog-metadata';
import { resolveDocsSummariesRoot } from './shared-paths';

export type DocsCatalogKind = 'page' | 'openapi-tag';

export interface DocsContentSource {
  type: 'page-md' | 'openapi-slice';
  docsRelativePath: string;
  openApiTag?: string;
}

export interface DocsCatalogEntry {
  catalogId: string;
  kind: DocsCatalogKind;
  userFacingRef: string;
  summary: string;
  contentSources: DocsContentSource[];
}

const OPENAPI_TAG_GUIDE_PAGES: Record<string, string> = {
  'Domain Groups': 'pages/guides/domains-and-groups.md',
  Domains: 'pages/guides/domains-and-groups.md',
  Subdomains: 'pages/guides/domains-and-groups.md',
  'Redirect Rules': 'pages/guides/redirect-rules.md',
  'Redirect Tests': 'pages/guides/redirect-tests.md',
  'Link Maps': 'pages/guides/link-maps.md',
  'Link Map Entries': 'pages/guides/link-map-entries.md',
  Organization: 'pages/guides/getting-started.md',
};

@Injectable()
export class DocsCatalogService implements OnModuleInit {
  private readonly logger = new Logger(DocsCatalogService.name);
  private entries: DocsCatalogEntry[] = [];

  onModuleInit(): void {
    this.entries = this.loadCatalog();
    this.logger.log(`Indexed ${this.entries.length} documentation summaries for the docs assistant`);
  }

  getEntries(): DocsCatalogEntry[] {
    return this.entries;
  }

  getByIds(catalogIds: string[]): DocsCatalogEntry[] {
    const lookup = new Map(this.entries.map((entry) => [entry.catalogId, entry]));
    return catalogIds
      .map((id) => lookup.get(id))
      .filter((entry): entry is DocsCatalogEntry => Boolean(entry));
  }

  private loadCatalog(): DocsCatalogEntry[] {
    const summariesRoot = resolveDocsSummariesRoot();
    const files = this.listMarkdownFiles(summariesRoot);
    const catalog: DocsCatalogEntry[] = [];

    for (const absolutePath of files) {
      const relFromSummaries = relative(summariesRoot, absolutePath).replaceAll('\\', '/');
      const raw = readFileSync(absolutePath, 'utf8');
      const { frontmatter, body } = parseSummaryFrontmatter(raw);
      const summary = body.trim();
      if (!summary) {
        continue;
      }

      if (relFromSummaries.startsWith('pages/')) {
        const pagePath = toDocsPagePath(frontmatter.source);
        if (!pagePath) {
          continue;
        }

        catalog.push(buildPageCatalogEntry(pagePath, summary));
        continue;
      }

      if (relFromSummaries.includes('/openapi/by-tag/')) {
        const openApiTag = frontmatter.openApiTag?.trim();
        const slicePath = toOpenApiSlicePath(frontmatter.source);
        if (!openApiTag || !slicePath) {
          continue;
        }

        catalog.push(
          buildOpenApiCatalogEntry(
            openApiTag,
            slicePath,
            summary,
            OPENAPI_TAG_GUIDE_PAGES[openApiTag],
          ),
        );
      }
    }

    return catalog.sort((left, right) => left.catalogId.localeCompare(right.catalogId));
  }

  private listMarkdownFiles(rootDir: string): string[] {
    const files: string[] = [];

    const walk = (currentDir: string): void => {
      for (const entry of readdirSync(currentDir)) {
        const absolutePath = join(currentDir, entry);
        const stat = statSync(absolutePath);
        if (stat.isDirectory()) {
          walk(absolutePath);
          continue;
        }

        if (extname(entry).toLowerCase() === '.md') {
          files.push(absolutePath);
        }
      }
    };

    walk(rootDir);
    return files;
  }
}
