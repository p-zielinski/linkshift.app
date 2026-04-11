# Redirect Tests API

Redirect tests allow storing expected routing outcomes and validating behavior over time.

Base path: `/api/v1/redirect-tests`

## Endpoints

- `GET /api/v1/redirect-tests`
- `GET /api/v1/redirect-tests/:id`
- `POST /api/v1/redirect-tests`
- `PUT /api/v1/redirect-tests/:id`
- `DELETE /api/v1/redirect-tests/:id`

## Test Model

Each stored test includes:

- `domainGroupId`
- `pathWithQuery`
- `requestData` (method/protocol/headers/query/ip/userAgent)
- `expectedResult` (`matched`, `statusCode`, `target`)

## Typical CI Workflow

1. Upsert redirect rules and/or link-map entries.
2. Update test fixtures via `/redirect-tests`.
3. Execute simulations via `/redirect-rules/simulate` to validate current behavior.
4. Fail deployment if simulated output diverges from expected results.
