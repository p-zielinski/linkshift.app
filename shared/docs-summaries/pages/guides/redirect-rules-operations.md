---
source: shared/docs/pages/guides/redirect-rules-operations.md
generatedAt: 2026-06-08T20:11:20.207Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing redirect rules in LinkShift, explaining how to validate, simulate, and analyze these rules.

## What this doc covers
- **In the dashboard**: Simulate results and analytics features.
- **Validation**: Criteria for creating and updating redirect rules, including checks for source, destination, recursion depth, and common errors.
- **Simulate before rollout**: How to use the `POST /api/v1/redirect-rules/simulate` endpoint to evaluate rules without affecting production.
- **Analytics**: Using `GET /api/v1/redirect-rules/analytics` to retrieve hit counts and traffic data for redirect rules.

## Key workflows and rules
### Validation Workflow
1. **Create/Update Rule**: Submit a redirect rule.
2. **Validation Checks**:
   - Ensure `source` is non-empty and valid regex.
   - Confirm capture groups exist in the `source`.
   - Validate `destination` URL structure.
   - Check recursion depth and link map rules.
   - Ensure safety of `destination` URLs.
3. **Error Handling**: If invalid, receive a `400 Bad Request` with specific error details.

### Simulate Workflow
1. **Submit Request**: Use `POST /api/v1/redirect-rules/simulate` with up to 100 entries.
2. **Evaluate Rules**: Each entry is processed independently against live rules.
3. **Response Handling**: Analyze results for `matched`, `statusCode`, `target`, and `linkMapKey`.
4. **Check Blacklist**: Optionally include `checkDestinationBlacklist` to simulate blacklist checks.

### Analytics Workflow
1. **Request Data**: Use `GET /api/v1/redirect-rules/analytics` with optional parameters for filtering.
2. **Response Analysis**: Review hit counts, top link map keys, and request variants for each rule.

## Limits and constraints
- **Field Limits**:
  - `source` and `destination` max length: 16,384 characters.
  - `userAgent` max length per entry: 512 characters.
- **Validation Limits**:
  - Maximum recursion depth: 32 levels.
  - Maximum 6 methods allowed in `matchMethod`.
- **Simulate Request Limits**:
  - Up to 100 entries per request.
- **Analytics Query Limits**:
  - `limit` parameter: 1–50 rules.
  - Custom date range cannot exceed 31 days.
- **Error Responses**: Various `400 Bad Request` scenarios for invalid inputs.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Matching and destinations](./redirect-rules-core.md)
- [Tests in the dashboard](./dashboard/tests-in-dashboard.md)
- [Analytics in the dashboard](./dashboard/analytics-in-dashboard.md)
