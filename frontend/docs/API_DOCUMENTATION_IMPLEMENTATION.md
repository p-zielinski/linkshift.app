# API Documentation Implementation Notes

## Routing model

Public docs routes are under `/docs`.

- `/docs` overview page
- `/docs/reference` endpoint index
- `/docs/guides/:slug` markdown guides synced from backend docs
- `/docs/concepts/:slug` concept pages
- `/docs/api/:operationId` endpoint-level pages

## Core frontend pieces

- `DocumentationOpenApiService`
  - loads and parses OpenAPI YAML,
  - caches parsed document in memory and session storage,
  - exposes endpoint/tag/security projections.
- `DocumentationContentService`
  - serves generated markdown pages from synced backend docs.
- `SchemaTreeComponent`
  - renders nested request/response schema details using Angular Material tree.
- `ApiTryMeComponent`
  - executes browser `fetch` requests,
  - serializes query with `qs`,
  - persists base URL and API key for session scope.

## Generator

`frontend/scripts/sync-documentation.mjs` builds:

- markdown page registry from `backend/docs/**/*.md`,
- OpenAPI endpoint snapshot,
- generated output: `frontend/src/app/features/documentation/generated/documentation.generated.ts`.

## Design constraints

1. OpenAPI stays the only endpoint contract source.
2. Backend markdown is imported and rendered, not rewritten manually.
3. Endpoint pages are linkable and SEO-indexable.
4. Docs navigation uses nested left sidebar and tag grouping.
5. Security context and API host remain visible across docs pages.

## Extension points

1. Add more concept pages by creating backend markdown + sync mapping.
2. Extend Try me with additional auth modes if API surface evolves.
3. Add more intelligent CodeMirror completions from schema path context.
4. Auto-generate llms docs section from OpenAPI snapshot in a future step.
