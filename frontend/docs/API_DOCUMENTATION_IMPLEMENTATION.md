# API Documentation Implementation Notes

## Source of truth

All public documentation content lives in `shared/docs/`:

- `manifest.yaml` — page registry (slug, category, route, description)
- `pages/**/*.md` — markdown (overview, reference intro, guides, concepts)
- `openapi/linkshift-api-keys.openapi.yaml` — API contract

Sync from repository root:

```bash
npm run docs:sync
```

## Routing model

Public docs routes are under `/docs`.

- `/docs` overview page (markdown from `pages/overview.md` + live stats)
- `/docs/reference` endpoint index (markdown intro + OpenAPI-driven list)
- `/docs/guides/:slug` markdown guides
- `/docs/concepts/:slug` concept pages
- `/docs/api/:operationId` endpoint-level pages

## Core frontend pieces

- `DocumentationOpenApiService`
  - loads and parses OpenAPI YAML from `/linkshift-api-keys.openapi.yaml` (copied from `shared/docs/openapi/` on sync),
  - caches parsed document in memory and session storage,
  - exposes endpoint/tag/security projections.
- `DocumentationContentService`
  - serves generated markdown pages from synced `shared/docs`.
- `SchemaTreeComponent`
  - renders nested request/response schema details using Angular Material tree.
- `ApiTryMeComponent`
  - executes browser `fetch` requests,
  - serializes query with `qs`,
  - persists base URL and API key for session scope.

## Generator

`scripts/docs-sync.mjs` builds:

- markdown page registry from `shared/docs/manifest.yaml`,
- OpenAPI endpoint snapshot,
- copy of OpenAPI YAML to `frontend/public/`,
- generated output: `frontend/src/app/features/documentation/generated/documentation.generated.ts`.

## Design constraints

1. OpenAPI stays the only endpoint contract source.
2. Shared markdown is imported and rendered, not rewritten manually in Angular templates.
3. Endpoint pages are linkable and SEO-indexable.
4. Docs navigation uses nested left sidebar and tag grouping.
5. Security context and API host remain visible across docs pages.

## Extension points

1. Add pages by creating markdown under `shared/docs/pages/` and registering them in `manifest.yaml`, then run `docs:sync`.
2. Extend Try me with additional auth modes if API surface evolves.
3. Add more intelligent CodeMirror completions from schema path context.
4. Future docs assistant agent in `agents/docs-assistant/` should ingest `shared/docs/` only.
