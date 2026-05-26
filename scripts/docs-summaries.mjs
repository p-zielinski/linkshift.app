import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const docsRoot = resolve(repoRoot, 'shared', 'docs');
const summariesRoot = resolve(repoRoot, 'shared', 'docs-summaries');
const frontendRoot = resolve(repoRoot, 'frontend');
const requireFromFrontend = createRequire(resolve(frontendRoot, 'package.json'));
const { parse: parseYaml } = requireFromFrontend('yaml');

function loadRepoEnv() {
  const envPath = resolve(repoRoot, '.env');
  if (!existsSync(envPath)) {
    return;
  }

  const dotenv = requireFromFrontend('dotenv');
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn(`Warning: could not load ${envPath}: ${result.error.message}`);
  }
}

loadRepoEnv();

const CANONICAL_OPENAPI_REL = 'openapi/linkshift-api-keys.openapi.yaml';
const BY_TAG_DIR_REL = 'openapi/by-tag';
const BY_TAG_INDEX_REL = `${BY_TAG_DIR_REL}/index.json`;
const EXCLUDED_RELATIVE = new Set(['manifest.yaml', 'README.md', CANONICAL_OPENAPI_REL, BY_TAG_INDEX_REL]);
const DEFAULT_MODEL = 'gpt-4o-mini';
const MAX_SOURCE_CHARS = 48_000;
const MAX_SUMMARY_WORDS = 500;
const OPENAPI_OUTLINE_MAX_OPS = 120;
const OPENAPI_DESC_MAX_CHARS = 500;
const OPENAPI_SCHEMA_PROPS_MAX = 14;

function parseArgs(argv) {
  const args = {
    all: false,
    base: process.env.DOCS_SUMMARIES_BASE ?? '',
    head: process.env.DOCS_SUMMARIES_HEAD ?? 'HEAD',
    dryRun: false,
    skipOpenApiSplit: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--all') {
      args.all = true;
    } else if (token === '--dry-run') {
      args.dryRun = true;
    } else if (token === '--skip-openapi-split') {
      args.skipOpenApiSplit = true;
    } else if (token === '--base') {
      args.base = argv[index + 1] ?? '';
      index += 1;
    } else if (token === '--head') {
      args.head = argv[index + 1] ?? 'HEAD';
      index += 1;
    }
  }

  return args;
}

function isZeroSha(sha) {
  return !sha || /^0+$/.test(sha);
}

function toDocsRelative(absolutePath) {
  const rel = relative(docsRoot, absolutePath).replaceAll('\\', '/');
  if (rel.startsWith('..') || rel === '') {
    return null;
  }
  return rel;
}

function isByTagOpenApiSlice(relativePath) {
  return (
    relativePath.startsWith(`${BY_TAG_DIR_REL}/`) &&
    relativePath.endsWith('.openapi.json')
  );
}

function isTrackableRelative(relativePath) {
  if (!relativePath || EXCLUDED_RELATIVE.has(relativePath)) {
    return false;
  }

  if (extname(relativePath).toLowerCase() === '.md') {
    return true;
  }

  return isByTagOpenApiSlice(relativePath);
}

function listByTagOpenApiFiles() {
  const byTagDir = resolve(docsRoot, BY_TAG_DIR_REL);
  if (!existsSync(byTagDir)) {
    return [];
  }

  return readdirSync(byTagDir)
    .filter((name) => name.endsWith('.openapi.json'))
    .map((name) => `${BY_TAG_DIR_REL}/${name}`)
    .sort();
}

function listAllTrackableFiles() {
  const files = [];

  function walk(currentDir) {
    for (const entry of readdirSync(currentDir)) {
      const absolutePath = join(currentDir, entry);
      const stat = statSync(absolutePath);
      if (stat.isDirectory()) {
        walk(absolutePath);
        continue;
      }

      const rel = toDocsRelative(absolutePath);
      if (rel && isTrackableRelative(rel)) {
        files.push(rel);
      }
    }
  }

  walk(docsRoot);
  return files.sort();
}

function parseDiffNameStatus(output) {
  const addedOrModified = [];
  const deleted = [];

  for (const line of output.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const [status, ...rest] = trimmed.split(/\s+/);
    const filePath = rest.at(-1)?.replaceAll('\\', '/');
    if (!filePath || !filePath.startsWith('shared/docs/')) {
      continue;
    }

    const relativeDocPath = filePath.replace(/^shared\/docs\//, '');
    const affectsCanonicalOpenApi =
      relativeDocPath === CANONICAL_OPENAPI_REL ||
      filePath === `shared/docs/${CANONICAL_OPENAPI_REL}`;

    if (affectsCanonicalOpenApi) {
      if (status === 'D') {
        deleted.push(CANONICAL_OPENAPI_REL);
      } else if (status === 'A' || status === 'M' || status.startsWith('R')) {
        addedOrModified.push(CANONICAL_OPENAPI_REL);
      }
      continue;
    }

    if (!isTrackableRelative(relativeDocPath)) {
      continue;
    }

    if (status === 'D') {
      deleted.push(relativeDocPath);
      continue;
    }

    if (status === 'A' || status === 'M' || status.startsWith('R')) {
      addedOrModified.push(relativeDocPath);
    }
  }

  return {
    addedOrModified: [...new Set(addedOrModified)],
    deleted: [...new Set(deleted)],
  };
}

function expandOpenApiChanges({ addedOrModified, deleted }) {
  const canonicalTouched =
    addedOrModified.includes(CANONICAL_OPENAPI_REL) || deleted.includes(CANONICAL_OPENAPI_REL);

  if (!canonicalTouched) {
    return { addedOrModified, deleted };
  }

  const byTagFiles = listByTagOpenApiFiles();
  const nextAdded = [
    ...new Set([
      ...addedOrModified.filter((path) => path !== CANONICAL_OPENAPI_REL),
      ...byTagFiles,
    ]),
  ];
  const nextDeleted = [
    ...new Set([
      ...deleted.filter((path) => path !== CANONICAL_OPENAPI_REL),
      CANONICAL_OPENAPI_REL,
    ]),
  ];

  return {
    addedOrModified: nextAdded,
    deleted: nextDeleted,
  };
}

function getChangedFiles({ all, base, head }) {
  if (all || isZeroSha(base)) {
    return {
      addedOrModified: listAllTrackableFiles(),
      deleted: [],
    };
  }

  const diff = execSync(
    `git diff --name-status ${base} ${head} -- shared/docs`,
    { cwd: repoRoot, encoding: 'utf8' },
  );

  return parseDiffNameStatus(diff);
}

function runOpenApiSplit({ dryRun, skipOpenApiSplit }) {
  if (skipOpenApiSplit) {
    console.log('Skipped OpenAPI split (--skip-openapi-split).');
    return;
  }

  if (dryRun) {
    console.log('[dry-run] npm run docs:openapi:split');
    return;
  }

  console.log('Running npm run docs:openapi:split...');
  execSync('npm run docs:openapi:split', { cwd: repoRoot, stdio: 'inherit' });
}

function summaryRelativePath(docRelativePath) {
  const extension = extname(docRelativePath).toLowerCase();
  if (extension === '.md') {
    return docRelativePath;
  }
  if (extension === '.json') {
    return docRelativePath.replace(/\.openapi\.json$/i, '.openapi.summary.md');
  }
  return docRelativePath.replace(/\.(ya?ml)$/i, '.summary.md');
}

function summaryAbsolutePath(docRelativePath) {
  return resolve(summariesRoot, summaryRelativePath(docRelativePath));
}

function ensureParentDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function parseOpenApiDocument(raw, docRelativePath) {
  if (docRelativePath.endsWith('.json')) {
    return JSON.parse(raw);
  }
  return parseYaml(raw);
}

function truncateText(text, maxChars) {
  const normalized = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }
  return `${normalized.slice(0, maxChars)}…`;
}

function resolveComponentSchema(components, ref) {
  if (typeof ref !== 'string' || !ref.startsWith('#/components/schemas/')) {
    return null;
  }
  const name = ref.slice('#/components/schemas/'.length);
  return components?.schemas?.[name] ?? null;
}

function listSchemaPropertyNames(schema, components, depth = 0) {
  if (!schema || typeof schema !== 'object' || depth > 2) {
    return [];
  }

  if (typeof schema.$ref === 'string') {
    return listSchemaPropertyNames(resolveComponentSchema(components, schema.$ref), components, depth + 1);
  }

  const names = Object.keys(schema.properties ?? {});
  return names.slice(0, OPENAPI_SCHEMA_PROPS_MAX);
}

function pickContentSchema(content) {
  if (!content || typeof content !== 'object') {
    return null;
  }
  const json = content['application/json'];
  return json?.schema ?? null;
}

function formatParameterNames(parameters) {
  if (!Array.isArray(parameters) || parameters.length === 0) {
    return '';
  }

  const names = parameters
    .map((entry) => {
      if (typeof entry?.$ref === 'string') {
        const match = entry.$ref.match(/\/([^/]+)$/);
        return match?.[1] ?? '';
      }
      return String(entry?.name ?? '').trim();
    })
    .filter(Boolean);

  if (names.length === 0) {
    return '';
  }

  return `parameters: ${names.join(', ')}`;
}

function formatOperationDetail(operation, components) {
  const lines = [];
  const summary = truncateText(operation.summary, 200);
  if (summary) {
    lines.push(`summary: ${summary}`);
  }

  const description = truncateText(operation.description, OPENAPI_DESC_MAX_CHARS);
  if (description) {
    lines.push(`description: ${description}`);
  }

  const parameters = formatParameterNames(operation.parameters);
  if (parameters) {
    lines.push(parameters);
  }

  const requestSchema = pickContentSchema(operation.requestBody?.content);
  const requestProps = listSchemaPropertyNames(requestSchema, components);
  if (requestProps.length > 0) {
    lines.push(`requestBody fields: ${requestProps.join(', ')}`);
  }

  for (const [status, response] of Object.entries(operation.responses ?? {})) {
    if (!/^\d+$/.test(status)) {
      continue;
    }
    const schema = pickContentSchema(response?.content);
    const props = listSchemaPropertyNames(schema, components);
    if (props.length > 0) {
      lines.push(`response ${status} fields: ${props.join(', ')}`);
    }
  }

  return lines;
}

function buildOpenApiOutlineFromDocument(openapi, { docRelativePath }) {
  const paths = openapi?.paths ?? {};
  const components = openapi?.components ?? {};
  const operations = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
      const operation = pathItem?.[method];
      if (!operation || typeof operation !== 'object') {
        continue;
      }

      operations.push({
        method: method.toUpperCase(),
        path,
        operationId: operation.operationId ?? '',
        tags: Array.isArray(operation.tags) ? operation.tags : [],
        detailLines: formatOperationDetail(operation, components),
      });

      if (operations.length >= OPENAPI_OUTLINE_MAX_OPS) {
        break;
      }
    }

    if (operations.length >= OPENAPI_OUTLINE_MAX_OPS) {
      break;
    }
  }

  const schemaSummaries = [];
  for (const [name, schema] of Object.entries(components.schemas ?? {})) {
    const props = listSchemaPropertyNames(schema, components);
    const schemaDescription = truncateText(schema?.description, 240);
    const parts = [`schema ${name}`];
    if (schemaDescription) {
      parts.push(schemaDescription);
    }
    if (props.length > 0) {
      parts.push(`fields: ${props.join(', ')}`);
    }
    schemaSummaries.push(`- ${parts.join(' — ')}`);
  }

  const info = openapi?.info ?? {};
  const tags = Array.isArray(openapi?.tags)
    ? openapi.tags.map((tag) => tag.name).filter(Boolean)
    : [];
  const sliceMeta = openapi?.['x-linkshift'] ?? {};
  const header = [
    '# OpenAPI outline (generated for summarization)',
    '',
    `canonicalContract: shared/docs/${CANONICAL_OPENAPI_REL}`,
    `sliceFile: shared/docs/${docRelativePath}`,
    `sliceType: internal-by-tag`,
    `sourceTag: ${sliceMeta.sourceTag ?? tags[0] ?? 'unknown'}`,
    `title: ${info.title ?? 'unknown'}`,
    `version: ${info.version ?? 'unknown'}`,
    `tags: ${tags.join(', ')}`,
    `operationCountListed: ${operations.length}`,
    '',
    '## API info (from slice)',
    truncateText(info.description, 4_000) || '(no description)',
    '',
    '## Operations',
    ...operations.flatMap((entry) => {
      const headline = `- **${entry.method} ${entry.path}**` +
        (entry.operationId ? ` (\`${entry.operationId}\`)` : '') +
        (entry.tags.length ? ` [${entry.tags.join(', ')}]` : '');
      if (entry.detailLines.length === 0) {
        return [headline];
      }
      return [headline, ...entry.detailLines.map((line) => `  - ${line}`)];
    }),
  ];

  if (schemaSummaries.length > 0) {
    header.push('', '## Component schemas', ...schemaSummaries);
  }

  return header.join('\n');
}

function buildSummarizationInstructions(docRelativePath) {
  const wordLimit = `Stay at or under ${MAX_SUMMARY_WORDS} words. Prefer concrete facts from the source over generic labels.`;

  if (isByTagOpenApiSlice(docRelativePath)) {
    return [
      'Output markdown with these sections (omit a section only if the source has nothing for it):',
      '',
      '## Purpose',
      'One sentence: what this OpenAPI tag covers for API-key clients.',
      '',
      '## Endpoints',
      'One bullet per operation listed in the source. Each bullet MUST include:',
      '- HTTP method and path in backticks (e.g. `GET /api/v1/organization`)',
      '- `operationId` when present',
      '- What the call does and notable request/response fields when the source mentions them',
      '',
      '## Auth, billing, and rate limits',
      'Concrete rules from the source (headers, excluded paths, 401/402/429, per-key limits).',
      '',
      '## Data shapes',
      'Key schema names and important fields mentioned in the source.',
      '',
      '## Related endpoints outside this tag',
      'Only cross-references explicitly implied by the source. Use `METHOD /path`, OpenAPI tag names, or guide topics — never vague phrases like "Usage Tracking" or "Error Handling".',
      '',
      wordLimit,
    ].join('\n');
  }

  return [
    'Output markdown with these sections (omit a section only if the source has nothing for it):',
    '',
    '## Purpose',
    'One sentence describing who this doc is for and what it explains.',
    '',
    '## What this doc covers',
    'Bullets tied to actual section headings or topics in the source (not generic paraphrases).',
    '',
    '## Key workflows and rules',
    'Step-by-step flows, validation rules, and behaviors documented in the source.',
    '',
    '## Limits and constraints',
    'Quotas, field limits, auth requirements, and gotchas called out in the source.',
    '',
    '## Related docs and API areas',
    'Point to specific other guides or `METHOD /path` / OpenAPI tags when the source links or implies them. Avoid vague umbrella terms.',
    '',
    wordLimit,
  ].join('\n');
}

function readDocSource(docRelativePath) {
  const absolute = resolve(docsRoot, docRelativePath);
  const raw = readFileSync(absolute, 'utf8');

  if (isByTagOpenApiSlice(docRelativePath) || /\.ya?ml$/i.test(docRelativePath)) {
    const openapi = parseOpenApiDocument(raw, docRelativePath);
    const outline = buildOpenApiOutlineFromDocument(openapi, { docRelativePath });
    if (outline.length <= MAX_SOURCE_CHARS) {
      return outline;
    }
    return `${outline.slice(0, MAX_SOURCE_CHARS)}\n\n...[truncated for summarization]`;
  }

  if (raw.length <= MAX_SOURCE_CHARS) {
    return raw;
  }

  return `${raw.slice(0, MAX_SOURCE_CHARS)}\n\n...[truncated for summarization]`;
}

function getSummarizationPrompts(docRelativePath) {
  if (!isByTagOpenApiSlice(docRelativePath)) {
    return {
      systemExtra: '',
      userExtra: '',
      frontmatterExtra: {},
    };
  }

  let sourceTag = '';
  try {
    const openapi = parseOpenApiDocument(
      readFileSync(resolve(docsRoot, docRelativePath), 'utf8'),
      docRelativePath,
    );
    sourceTag =
      openapi?.['x-linkshift']?.sourceTag ??
      openapi?.tags?.[0]?.name ??
      '';
  } catch {
    sourceTag = '';
  }

  return {
    systemExtra:
      'The source may be an internal per-tag OpenAPI slice used only for LLM context. ' +
      'The canonical public API contract is shared/docs/openapi/linkshift-api-keys.openapi.yaml. ' +
      'When summarizing or referring to API behavior, treat that canonical file as the real contract. ' +
      'Do not present the slice path as the user-facing API spec location.',
    userExtra: [
      'Context:',
      `- Canonical OpenAPI (public contract): shared/docs/${CANONICAL_OPENAPI_REL}`,
      `- Internal slice file (LLM-only): shared/docs/${docRelativePath}`,
      sourceTag ? `- OpenAPI tag for this slice: ${sourceTag}` : '',
      '',
    ]
      .filter(Boolean)
      .join('\n'),
    frontmatterExtra: {
      sliceType: 'openapi-by-tag',
      canonicalOpenApi: `shared/docs/${CANONICAL_OPENAPI_REL}`,
      ...(sourceTag ? { openApiTag: sourceTag } : {}),
    },
  };
}

async function summarizeWithOpenAi({
  sourcePath,
  sourceContent,
  model,
  apiKey,
  docRelativePath,
}) {
  const prompts = getSummarizationPrompts(docRelativePath);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You write documentation summaries for an internal docs assistant router (RAG). ' +
            'Use markdown with ## section headings. Be specific: name endpoints, fields, limits, and workflows from the source. ' +
            'Never replace concrete API paths with vague category labels. ' +
            'Do not invent behavior that is not present in the source. ' +
            prompts.systemExtra,
        },
        {
          role: 'user',
          content: [
            prompts.userExtra,
            `Summarize this LinkShift documentation source file: ${sourcePath}`,
            buildSummarizationInstructions(docRelativePath),
            '',
            '--- SOURCE START ---',
            sourceContent,
            '--- SOURCE END ---',
          ]
            .filter(Boolean)
            .join('\n'),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API failed (${response.status}): ${errorBody}`);
  }

  const payload = await response.json();
  const summary = payload?.choices?.[0]?.message?.content?.trim();

  if (!summary) {
    throw new Error(`OpenAI API returned empty summary for ${sourcePath}`);
  }

  return summary;
}

function buildSummaryDocument({ docRelativePath, model, summary }) {
  const generatedAt = new Date().toISOString();
  const prompts = getSummarizationPrompts(docRelativePath);
  const isOpenApiSlice = isByTagOpenApiSlice(docRelativePath);
  const frontmatterLines = [
    '---',
    ...(isOpenApiSlice
      ? [
          `llmSlice: shared/docs/${docRelativePath}`,
          `source: shared/docs/${docRelativePath}`,
        ]
      : [`source: shared/docs/${docRelativePath}`]),
    `generatedAt: ${generatedAt}`,
    `model: ${model}`,
    ...Object.entries(prompts.frontmatterExtra).map(([key, value]) => `${key}: ${value}`),
    '---',
  ];

  return [...frontmatterLines, '', summary, ''].join('\n');
}

function removeObsoleteMonolithicSummary({ dryRun }) {
  const obsolete = summaryAbsolutePath(CANONICAL_OPENAPI_REL);
  if (!existsSync(obsolete)) {
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] delete obsolete ${relative(repoRoot, obsolete)}`);
    return;
  }

  rmSync(obsolete, { force: true });
  console.log(`Deleted obsolete ${relative(repoRoot, obsolete)}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  if (!args.dryRun && !apiKey) {
    throw new Error('OPENAI_API_KEY is required (unless running with --dry-run)');
  }

  runOpenApiSplit({
    dryRun: args.dryRun,
    skipOpenApiSplit: args.skipOpenApiSplit,
  });

  const rawChanges = getChangedFiles(args);
  const { addedOrModified, deleted } = expandOpenApiChanges(rawChanges);

  console.log(`Docs summaries mode: ${args.all ? 'all' : 'diff'}`);
  console.log(`Changed docs: +${addedOrModified.length} -${deleted.length}`);

  removeObsoleteMonolithicSummary({ dryRun: args.dryRun });

  for (const docRelativePath of deleted) {
    const target = summaryAbsolutePath(docRelativePath);
    if (!existsSync(target)) {
      continue;
    }

    if (args.dryRun) {
      console.log(`[dry-run] delete ${relative(repoRoot, target)}`);
      continue;
    }

    rmSync(target, { force: true });
    console.log(`Deleted ${relative(repoRoot, target)}`);
  }

  if (addedOrModified.length === 0) {
    console.log('No docs files to summarize.');
    return;
  }

  for (const docRelativePath of addedOrModified) {
    const sourceContent = readDocSource(docRelativePath);
    const target = summaryAbsolutePath(docRelativePath);

    if (args.dryRun) {
      console.log(`[dry-run] summarize ${docRelativePath} -> ${relative(repoRoot, target)}`);
      continue;
    }

    const summary = await summarizeWithOpenAi({
      sourcePath: `shared/docs/${docRelativePath}`,
      sourceContent,
      model,
      apiKey,
      docRelativePath,
    });

    ensureParentDir(target);
    writeFileSync(
      target,
      buildSummaryDocument({ docRelativePath, model, summary }),
      'utf8',
    );
    console.log(`Wrote ${relative(repoRoot, target)}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
