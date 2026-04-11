# Redirect Rules API

Redirect rules are the core of LinkShift routing behavior.

Base path: `/api/v1/redirect-rules`

## Endpoints

- `GET /api/v1/redirect-rules` list with cursor pagination
- `GET /api/v1/redirect-rules/:id`
- `POST /api/v1/redirect-rules`
- `PUT /api/v1/redirect-rules/:id`
- `DELETE /api/v1/redirect-rules/:id`
- `GET /api/v1/redirect-rules/analytics`
- `POST /api/v1/redirect-rules/simulate`

## Critical Validation Rules

`/redirect-rules` validation is intentionally strict and is implemented in:

- `backend/src/rule-validator/rule-validator.service.ts`

The validator checks, among others:

1. Source regex correctness and capture-group consistency with destination references (`$1`, `$2`, ...).
2. Destination URL structure and allowed schemes (`http://`, `https://`).
3. Placeholder and modifier correctness (`{query.*}`, `{domain.*}`, `{segments.*}`, etc.).
4. Conditional-expression syntax/operators in destination logic.
5. Nested logic complexity and guardrails against excessive recursion.
6. Link-map compatibility rules (`linkMapId` and destination constraints).

If validation fails, API returns `400 Bad Request` with detailed error information.

## Query and Path Matching

Rule matching supports:

- `pathMatch`: `exact` or `prefix`
- `queryMatch`: `exact`, `ignore`, `subset`
- `matchMethod`: explicit HTTP methods or empty array for all methods

## Recommended Usage Pattern

1. Create or update rules via API.
2. Use `/simulate` before rollout for CI/CD safety gates.
3. Read analytics (`/analytics`) to detect unexpected traffic patterns.

## Example: Create rule with explicit method and query behavior

```json
{
  "domainGroupId": "dmg_prod",
  "source": "/legacy",
  "destination": "https://example.com/new",
  "statusCode": 308,
  "matchMethod": ["GET"],
  "queryMatch": "ignore",
  "pathMatch": "prefix",
  "priority": 50
}
```
