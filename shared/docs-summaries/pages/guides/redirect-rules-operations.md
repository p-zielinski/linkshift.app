---
source: shared/docs/pages/guides/redirect-rules-operations.md
generatedAt: 2026-05-30T07:02:44.195Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and administrators using LinkShift, explaining how to validate redirect rules, simulate their behavior before rollout, and analyze redirect rule performance.

## What this doc covers
- **In the dashboard**: Simulate and fetch expected results, and access analytics.
- **Validation**: Rules validation checks during creation and updates.
- **Simulate before rollout**: Using the `POST /api/v1/redirect-rules/simulate` endpoint to evaluate rules against sample requests.
- **Analytics**: Using the `GET /api/v1/redirect-rules/analytics` endpoint to retrieve hit counts per rule.

## Key workflows and rules
### Validation
1. **Source**: Must be non-empty, max 16,384 chars, and valid regex.
2. **Capture groups**: Must exist in the source regex.
3. **Destination**: Must be a valid URL structure, max 16,384 chars.
4. **Recursion depth**: Conditional nesting must not exceed 32 levels.
5. **Link map rules**: Must not have a non-null `destination` when `linkMapId` is provided.
6. **Destination safety**: URLs are scanned for unsafe targets.
7. **Multiline destination**: Newlines are allowed in JSON strings.
8. **Common errors**: Includes specific error messages for validation failures.

### Simulate before rollout
- **Endpoint**: `POST /api/v1/redirect-rules/simulate`
- **Request body**: Up to 100 entries, each containing `domainGroupId`, `hostname`, `path`, `method`, `query`, and `userAgent`.
- **Response**: Each entry returns `matched`, `statusCode`, `target`, and `linkMapKey`.
- **Batch behavior**: Each entry is evaluated independently.
- **Domain blacklist**: Use `"checkDestinationBlacklist": true` to mirror live behavior.

### Analytics
- **Endpoint**: `GET /api/v1/redirect-rules/analytics`
- **Query parameters**: 
  - `limit` (1–50, default 50)
  - `range` (day, week, month)
  - `start` and `end` for custom time windows (both required).
- **Response**: Includes `hits`, `topLinkMapKeys`, and `topRequestVariants`.

## Limits and constraints
- **Validation limits**:
  - Source and destination max length: 16,384 chars.
  - Recursion depth: ≤ 32 levels.
  - Up to 100 entries per simulation request.
  - `userAgent` limited to 512 characters.
- **Analytics limits**:
  - Time window cannot exceed 31 days.
  - `start` must be before `end`.
- **Common validation errors**: Specific error messages for incorrect configurations.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Matching and destinations](./redirect-rules-core.md)
- [Tests in the dashboard](./dashboard/tests-in-dashboard.md)
- [Analytics in the dashboard](./dashboard/analytics-in-dashboard.md)
