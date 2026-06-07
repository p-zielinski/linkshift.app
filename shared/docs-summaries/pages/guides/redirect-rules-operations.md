---
source: shared/docs/pages/guides/redirect-rules-operations.md
generatedAt: 2026-06-07T10:07:34.950Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing redirect rules in LinkShift, explaining how to validate, simulate, and analyze redirect rules.

## What this doc covers
- **In the dashboard**: Simulate and fetch expected results; access analytics.
- **Validation**: Criteria for creating/updating redirect rules, including source, destination, recursion depth, and common errors.
- **Simulate before rollout**: How to use the `POST /api/v1/redirect-rules/simulate` endpoint to test rules without affecting production traffic.
- **Analytics**: Using `GET /api/v1/redirect-rules/analytics` to retrieve hit counts per rule.

## Key workflows and rules
### Validation
1. **Source**: Must be non-empty, max 16,384 chars; valid regex format.
2. **Capture groups**: Must exist in the source regex.
3. **Destination**: Max 16,384 chars; must be a valid URL.
4. **Recursion depth**: Conditional nesting must be ≤ 32 levels.
5. **Link map rules**: Must not have a non-null stored `destination` and no draft `destination` in the same payload.
6. **Destination safety**: URLs are scanned for unsafe targets.
7. **Multiline destination**: Newlines allowed in JSON strings.
8. **Common errors**: Various validation errors are documented with specific causes.

### Simulate before rollout
- **Endpoint**: `POST /api/v1/redirect-rules/simulate`
- **Request**: Up to 100 entries, each evaluated independently.
- **Response**: Each entry returns `matched`, `statusCode`, `target`, and `linkMapKey`.
- **Batch behavior**: Rules run in priority order; HTTPS only.
- **Blacklist checks**: Controlled by `checkDestinationBlacklist` flag.

### Analytics
- **Endpoint**: `GET /api/v1/redirect-rules/analytics`
- **Query parameters**: `limit`, `range`, `start`, `end`, `domainGroupId`.
- **Response**: Includes `hits`, `topLinkMapKeys`, and `topRequestVariants`.

## Limits and constraints
- **Character limits**: Source and destination fields are limited to 16,384 characters.
- **Capture groups**: Must match the number of groups in the source regex.
- **Recursion depth**: Limited to 32 levels.
- **Simulate request limits**: Up to 100 entries per request; `userAgent` limited to 512 characters.
- **Analytics date range**: Cannot exceed 31 days; both `start` and `end` must be provided together.
- **Hostname requirements**: Must match a domain in the specified `domainGroupId`.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Matching and destinations](./redirect-rules-core.md)
- [Tests in the dashboard](./dashboard/tests-in-dashboard.md)
- [Analytics in the dashboard](./dashboard/analytics-in-dashboard.md)
