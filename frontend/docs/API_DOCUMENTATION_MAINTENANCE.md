# API Documentation Maintenance

This guide explains how to keep LinkShift docs in sync with API changes.

## Source of truth

1. OpenAPI: `shared/docs/openapi/linkshift-api-keys.openapi.yaml`
2. Markdown pages: `shared/docs/pages/**/*.md`
3. Page registry: `shared/docs/manifest.yaml`

Do not manually duplicate endpoint contracts in frontend files.

## Update workflow

1. Update OpenAPI and/or markdown under `shared/docs/`.
2. Register new or changed pages in `shared/docs/manifest.yaml` when needed.
3. Run from repository root:

```bash
npm run docs:sync
```

4. Verify generated file changes:
   - `frontend/src/app/features/documentation/generated/documentation.generated.ts`
5. Verify sitemap docs block changed (auto-updated between `<!-- docs:start -->` and `<!-- docs:end -->`):
   - `frontend/public/sitemap.xml`
6. Verify OpenAPI copy:
   - `frontend/public/linkshift-api-keys.openapi.yaml`
7. If docs structure changed, update:
   - `frontend/public/llms.txt`
   - `frontend/public/robots.txt` (when new docs path groups are added)
8. Run build:

```bash
npm --prefix frontend run build
```

9. Open `/docs` and verify:
   - sidebar groups,
   - endpoint pages,
   - schema trees,
   - Try me request execution.

## Common pitfalls

- Forgetting `docs:sync` after editing `shared/docs/`.
- Editing `frontend/public/linkshift-api-keys.openapi.yaml` directly — changes will be overwritten on sync.
- Adding a markdown file without a `manifest.yaml` entry.
- Changing `operationId` in OpenAPI without expecting docs URL changes (`/docs/api/:operationId`).

## Public URLs

- Docs hub: `/docs`
- API reference: `/docs/reference`
- OpenAPI download: `/linkshift-api-keys.openapi.yaml`
