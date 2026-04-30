import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');
const frontendRoot = resolve(repoRoot, 'frontend');
const backendDocsRoot = resolve(repoRoot, 'backend', 'docs');

const OPENAPI_FILE = resolve(frontendRoot, 'public', 'linkshift-api-keys.openapi.yaml');
const SITEMAP_FILE = resolve(frontendRoot, 'public', 'sitemap.xml');
const GENERATED_FILE = resolve(
  frontendRoot,
  'src',
  'app',
  'features',
  'documentation',
  'generated',
  'documentation.generated.ts',
);

const MARKDOWN_FILES = [
  {
    slug: 'getting-started',
    category: 'guide',
    source: resolve(backendDocsRoot, 'public-api', 'README.md'),
    description: 'Authentication, scope, quotas, and API surface overview for LinkShift API keys.',
  },
  {
    slug: 'domains-and-groups',
    category: 'guide',
    source: resolve(backendDocsRoot, 'public-api', 'domains-and-groups.md'),
    description: 'Domain topology endpoints and robots policy behavior at the group layer.',
  },
  {
    slug: 'redirect-rules',
    category: 'guide',
    source: resolve(backendDocsRoot, 'public-api', 'redirect-rules.md'),
    description: 'Redirect rule lifecycle, strict validation, and simulation workflows.',
  },
  {
    slug: 'link-maps',
    category: 'guide',
    source: resolve(backendDocsRoot, 'public-api', 'link-maps.md'),
    description: 'Link map endpoints, query modes, and fallback behavior.',
  },
  {
    slug: 'link-map-entries',
    category: 'guide',
    source: resolve(backendDocsRoot, 'public-api', 'link-map-entries.md'),
    description: 'Entry CRUD, bulk import/delete workflows, and list pagination for link maps.',
  },
  {
    slug: 'redirect-tests',
    category: 'guide',
    source: resolve(backendDocsRoot, 'public-api', 'redirect-tests.md'),
    description: 'Redirect test model and CI-safe validation workflow.',
  },
  {
    slug: 'link-map-concepts',
    category: 'concept',
    source: resolve(backendDocsRoot, 'link-maps.md'),
    description: 'Deep operational notes for key normalization, cache model, and resolution strategy.',
  },
];

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

function readMarkdownPages() {
  return MARKDOWN_FILES.map((definition, index) => {
    const markdown = readFileSync(definition.source, 'utf8').trim();
    return {
      slug: definition.slug,
      category: definition.category,
      sourcePath: toRepoRelative(definition.source),
      order: index + 1,
      title: extractTitle(markdown),
      description: definition.description,
      markdown,
    };
  });
}

function readOpenApiSnapshot() {
  const openapiText = readFileSync(OPENAPI_FILE, 'utf8');
  const openapi = parseYaml(openapiText);
  const paths = openapi?.paths ?? {};
  const endpoints = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem?.[method];
      if (!operation || typeof operation !== 'object') {
        continue;
      }

      const operationId =
        typeof operation.operationId === 'string' && operation.operationId.trim()
          ? operation.operationId.trim()
          : makeOperationId(method, path);

      endpoints.push({
        id: operationId,
        method: method.toUpperCase(),
        path,
        tag: Array.isArray(operation.tags) && operation.tags.length
          ? String(operation.tags[0])
          : 'General',
        summary:
          typeof operation.summary === 'string' && operation.summary.trim()
            ? operation.summary.trim()
            : `${method.toUpperCase()} ${path}`,
      });
    }
  }

  return endpoints.sort((a, b) => {
    if (a.tag !== b.tag) {
      return a.tag.localeCompare(b.tag);
    }
    if (a.path !== b.path) {
      return a.path.localeCompare(b.path);
    }
    return a.method.localeCompare(b.method);
  });
}

function extractTitle(markdown) {
  const firstHeading = markdown
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('# '));

  if (firstHeading) {
    return firstHeading.replace('# ', '').trim();
  }

  return 'Documentation';
}

function makeOperationId(method, path) {
  const normalized = path
    .replace(/^\/+/, '')
    .replace(/\{([^}]+)\}/g, '$1')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

  return `${method.toLowerCase()}_${normalized || 'root'}`;
}

function toRepoRelative(filePath) {
  return filePath.replace(`${repoRoot}/`, '');
}

function generateFile() {
  const pages = readMarkdownPages();
  const endpointSnapshot = readOpenApiSnapshot();
  const generatedAt = new Date().toISOString();
  const generatedDate = generatedAt.slice(0, 10);

  const output = `/* eslint-disable */\n` +
    `// This file is auto-generated by frontend/scripts/sync-documentation.mjs\n` +
    `// Generated at: ${generatedAt}\n\n` +
    `export type DocumentationMarkdownPage = {\n` +
    `  slug: string;\n` +
    `  category: 'guide' | 'concept';\n` +
    `  sourcePath: string;\n` +
    `  order: number;\n` +
    `  title: string;\n` +
    `  description: string;\n` +
    `  markdown: string;\n` +
    `};\n\n` +
    `export type OpenApiEndpointSnapshot = {\n` +
    `  id: string;\n` +
    `  method: string;\n` +
    `  path: string;\n` +
    `  tag: string;\n` +
    `  summary: string;\n` +
    `};\n\n` +
    `export const DOCUMENTATION_MARKDOWN_PAGES: DocumentationMarkdownPage[] = ${JSON.stringify(
      pages,
      null,
      2,
    )};\n\n` +
    `export const OPENAPI_ENDPOINTS_SNAPSHOT: OpenApiEndpointSnapshot[] = ${JSON.stringify(
      endpointSnapshot,
      null,
      2,
    )};\n`;

  writeFileSync(GENERATED_FILE, output, 'utf8');
  syncSitemap(pages, endpointSnapshot, generatedDate);

  console.log(`Generated ${toRepoRelative(GENERATED_FILE)}`);
  console.log(`Markdown pages: ${pages.length}`);
  console.log(`Endpoint snapshot: ${endpointSnapshot.length}`);
}

function syncSitemap(pages, endpointSnapshot, generatedDate) {
  const markerStart = '<!-- docs:start -->';
  const markerEnd = '<!-- docs:end -->';
  const sitemap = readFileSync(SITEMAP_FILE, 'utf8');

  const startIndex = sitemap.indexOf(markerStart);
  const endIndex = sitemap.indexOf(markerEnd);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    console.warn('Skipped sitemap sync: docs markers were not found');
    return;
  }

  const docsEntries = buildSitemapEntries(pages, endpointSnapshot, generatedDate).join('\n');
  const prefix = sitemap.slice(0, startIndex + markerStart.length);
  const suffix = sitemap.slice(endIndex);

  const nextSitemap = `${prefix}\n${docsEntries}\n  ${suffix}`;
  writeFileSync(SITEMAP_FILE, nextSitemap, 'utf8');
}

function buildSitemapEntries(pages, endpointSnapshot, generatedDate) {
  const entries = [
    {
      path: '/docs',
      changefreq: 'daily',
      priority: '0.9',
    },
    {
      path: '/docs/reference',
      changefreq: 'daily',
      priority: '0.85',
    },
    ...pages.map((page) => ({
      path:
        page.category === 'concept'
          ? `/docs/concepts/${page.slug}`
          : `/docs/guides/${page.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    })),
    ...endpointSnapshot.map((endpoint) => ({
      path: `/docs/api/${endpoint.id}`,
      changefreq: 'weekly',
      priority: '0.7',
    })),
  ];

  return entries.map((entry) =>
    [
      '  <url>',
      `    <loc>https://linkshift.app${entry.path}</loc>`,
      `    <lastmod>${generatedDate}</lastmod>`,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      '  </url>',
    ].join('\n'),
  );
}

generateFile();
