# Link Map Entries API

Link map entries hold individual key -> destination mappings.

Base path: `/api/v1/link-map-entries`

## Endpoints

- `GET /api/v1/link-map-entries`
- `GET /api/v1/link-map-entries/:id`
- `POST /api/v1/link-map-entries`
- `PUT /api/v1/link-map-entries/:id`
- `DELETE /api/v1/link-map-entries/:id`
- `DELETE /api/v1/link-map-entries` (bulk delete by IDs)
- `POST /api/v1/link-map-entries/import`
- `POST /api/v1/link-map-entries/import/rollback`

## Query Parameters for List

`GET /api/v1/link-map-entries`

- `linkMapId` (required)
- `limit` (1..100)
- `search` (optional)
- `startAfterId` (cursor, optional)

## Usage Patterns

### 1) Single entry writes
Use `POST`/`PUT` for interactive updates.

### 2) Bulk import
Use `POST /import` for batch ingestion. Response reports created/updated/failed counts.

### 3) Safe rollback
Use `POST /import/rollback` with imported IDs to revert a batch.

## Constraints

- Key syntax and destination safety are validated server-side.
- Duplicate key handling follows map normalization rules.
- Organization ownership and plan limits are enforced on every write.
