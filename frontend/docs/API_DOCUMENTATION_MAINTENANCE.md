# API Documentation Maintenance

This guide explains how to keep LinkShift docs in sync with API changes.

## Source of truth

1. OpenAPI: `frontend/public/linkshift-api-keys.openapi.yaml`
2. Backend guides: `backend/docs/**/*.md`

Do not manually duplicate endpoint contracts in frontend files.

## Update workflow

1. Update OpenAPI and/or backend markdown docs.
2. Run:

```bash
npm --prefix frontend run docs:sync
```

3. Verify generated file changes:
   - `frontend/src/app/features/documentation/generated/documentation.generated.ts`
4. Verify sitemap docs block changed (auto-updated between `<!-- docs:start -->` and `<!-- docs:end -->`):
   - `frontend/public/sitemap.xml`
5. If docs structure changed, update:
   - `frontend/public/llms.txt`
   - `frontend/public/robots.txt` (when new docs path groups are added)
6. Run build:

```bash
npm --prefix frontend run build
```

7. Open `/docs` and verify:
   - sidebar groups,
   - endpoint pages,
   - schema trees,
   - Try me request execution.

## Common pitfalls

1. Missing `operationId` in OpenAPI can create unstable endpoint URLs.
   - Always keep operation IDs explicit and unique.
2. `$ref` loops can make schema trees unreadable.
   - Prefer modular schemas with clear ownership boundaries.
3. Non-JSON media types are supported, but schema display is optimized for JSON.
4. If docs load fails in browser, confirm the API spec is served at:
   - `/linkshift-api-keys.openapi.yaml`

## Try me behavior

Try me stores base URL and API key in `sessionStorage`.

- Values persist when navigating between docs pages.
- Values are cleared when browser session ends.

## When to add new guide pages

Add new backend markdown files when API behavior needs context that schema alone cannot explain, for example:

- validation semantics,
- operational guardrails,
- migration workflows,
- rollback and safety procedures.
