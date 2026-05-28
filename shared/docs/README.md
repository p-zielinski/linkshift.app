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

## Categories

| Category | Route pattern | Example |
|----------|---------------|---------|
| `meta` | `/docs`, `/docs/reference` | Overview, API reference intro |
| `intro` | `/docs/intro/:slug` | What is LinkShift.app? |
| `guide` | `/docs/guides/:slug` | Getting started |
| `concept` | `/docs/concepts/:slug` | Link map concepts |

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
