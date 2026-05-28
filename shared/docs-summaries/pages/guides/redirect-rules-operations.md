---
source: shared/docs/pages/guides/redirect-rules-operations.md
generatedAt: 2026-05-28T15:50:04.596Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators who need to validate, simulate, and analyze redirect rules in LinkShift.

## What this doc covers
- **Validation**: Rules validation on create/update, including checks for source, destination, recursion depth, and common errors.
- **Simulate before rollout**: How to use the `POST /api/v1/redirect-rules/simulate` endpoint to evaluate sample requests against live rules.
- **Analytics**: Using the `GET /api/v1/redirect-rules/analytics` endpoint to retrieve hit counts per rule.

## Key workflows and rules
### Validation
1. **Source**: Must be non-empty, max 16,384 chars, and valid regex.
2. **Capture groups**: Must exist in source regex.
3. **Destination**: Max 16,384 chars, valid URL structure, and conditional syntax.
4. **Recursion depth**: Conditional nesting must be ≤ 32 levels.
5. **Link map rules**: Must have `destination` as `null` if stored; no draft `destination` in the same payload.
6. **Destination safety**: URLs scanned for unsafe targets if `destination` is non-null.
7. **Common errors**: Includes specific validation error messages and their causes.

### Simulate before rollout
- Use `POST /api/v1/redirect-rules/simulate` to evaluate requests.
- Each entry is processed independently; up to **100 entries** per request.
- Response includes `matched`, `statusCode`, `target`, and `linkMapKey`.
- Use `checkDestinationBlacklist` to mirror live behavior for absolute URLs.

### Analytics
- Use `GET /api/v1/redirect-rules/analytics` to get hit counts.
- Query parameters include `limit`, `range`, `start`, `end`, and `domainGroupId`.
- Responses include `hits`, `topLinkMapKeys`, and `topRequestVariants`.

## Limits and constraints
- **Validation limits**: Source and destination max length is 16,384 chars; recursion depth ≤ 32 levels; max 6 methods allowed.
- **Simulate limits**: Up to **100 entries** per request; `userAgent` limited to **512** characters.
- **Analytics limits**: `limit` for rules is 1–50; custom date range cannot exceed 31 days.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Matching and destinations](./redirect-rules-core.md)
- `POST /api/v1/redirect-rules/simulate`
- `GET /api/v1/redirect-rules/analytics`
