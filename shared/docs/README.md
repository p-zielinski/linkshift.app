# LinkShift shared documentation

Source of truth for **public** docs and the API-key OpenAPI contract.

Engineering-only runbooks (rate limiter internals, rescan pipeline, cache keys) live in [`shared/not-public/`](../not-public/README.md) and are **not** synced to the docs site.

## Layout

- `manifest.yaml` — page registry (slug, category, route, descriptions)
- `pages/` — markdown content (`overview`, `reference`, `guides/`, `concepts/`)
- `openapi/linkshift-api-keys.openapi.yaml` — OpenAPI 3.1 contract (source of truth)
- `openapi/by-tag/` — optional per-tag slices for LLM ingestion (generated, not hand-edited)

## Sync

From the repository root:

```bash
npm run docs:sync
```

`docs:sync` runs `docs:links:check` first (internal markdown links and `#anchors` using the same slug rules as the docs UI).

This updates:

- `frontend/src/app/features/documentation/generated/documentation.generated.ts`
- `frontend/public/linkshift-api-keys.openapi.yaml` (copy for download and runtime fetch)
- docs URLs in `frontend/public/sitemap.xml`

## Custom blocks

Authors can add callouts and AI-only context in `pages/**/*.md` using fenced directive blocks. The docs UI renders these via `buildDocsMarkdownHtml` in the frontend.

**Infoboxes** (visible callouts):

```markdown
:::warning
Your plan limit applies here.
:::

:::success
Rule saved. Run tests from the Tests page.
:::

:::error
Domain must be verified before traffic routes.
:::

:::info
Optional neutral context for authors.
:::
```

Types: `warning`, `success`, `error`, `info`. Opening and closing fences must be on their own lines; inner content supports normal markdown (including empty bodies). Do not nest directive blocks inside another block.

**List styling** (docs UI only): unordered lists (`-` / `*` in markdown) render with an em dash and non-breaking space before each item instead of a bullet. Ordered lists (`1.` …) keep decimal markers for steps and legal-style numbering (overrides Tailwind preflight `list-style: none` on `ul`/`ol`). Infobox callouts inherit the same unordered-list styling. Authors do not need to prefix lines with `—`; if a line already starts with a dash in source, you may see a double pause (rare).

**AI-only content** (hidden in the UI with CSS, kept in the HTML DOM; Ask docs ingests these blocks from `shared/docs/`):

```markdown
:::ai-hidden
Short inline hint for retrieval (not shown to readers).
:::

:::ai-only
Longer background context for ingestion pipelines.
:::
```

**Hidden on purpose** (removed from the docs UI and from Ask docs context — treat as if it does not exist):

```markdown
:::hidden-on-purpose optional author note
Internal plan tiers, route maps, or QA-only notes.
:::

<!-- ::hidden-on-purpose optional note -->
Inline region stripped entirely.
<!-- ::hidden-on-purpose:end -->
```

## Categories

| Category | Route pattern | Example |
|----------|---------------|---------|
| `meta` | `/docs`, `/docs/reference` | Overview, API reference intro |
| `guide` | `/docs/guides/:slug` | Getting started |
| `concept` | `/docs/concepts/:slug` | Link map concepts |

Legacy `/docs/intro/what-is-linkshift` redirects to `/docs` (platform overview lives in `pages/overview.md`).

Endpoint pages are generated from OpenAPI (`/docs/api/:operationId`), not from markdown.

## OpenAPI split by tag (LLM-friendly)

From the repository root:

```bash
npm run docs:openapi:split
```

This writes pretty-printed JSON files under `shared/docs/openapi/by-tag/` (one file per OpenAPI tag, plus `index.json`). Use `npm run docs:openapi:split:yaml` if you need YAML output instead.

## Summaries for AI ingestion

Auto-generated concise summaries live in `shared/docs-summaries/` (see that folder’s README).

`npm run docs:summaries:all` runs `docs:openapi:split` first, then summarizes markdown pages and `openapi/by-tag/*.openapi.json` (not the monolithic YAML). The docs assistant should treat `linkshift-api-keys.openapi.yaml` as the canonical API contract when speaking to users.
