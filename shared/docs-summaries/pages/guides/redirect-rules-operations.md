---
source: shared/docs/pages/guides/redirect-rules-operations.md
generatedAt: 2026-06-03T17:00:02.245Z
model: gpt-4o-mini
---

## Purpose
This document is for users of LinkShift who need to validate redirect rules, simulate their behavior before rollout, and analyze redirect rule performance.

## What this doc covers
- **In the dashboard**
  - Simulate and fetch expected results using the redirect test wizard.
  - Access analytics through the sidebar for quick ranges and rule drill-down.
  
- **Validation**
  - Rules validation on create/update with specific checks for source, capture groups, destination, recursion depth, link map rules, destination safety, plain path vs regex, and multiline destination.
  - Common errors and their causes.

- **Simulate before rollout**
  - Usage of `POST /api/v1/redirect-rules/simulate` to evaluate sample requests against live rules.
  - Batch behavior and HTTPS-only requirements.
  - Response structure and fields for simulation results.
  - Query merging for path and query parameters.
  - Handling of link map misses in simulation.

- **Analytics**
  - Usage of `GET /api/v1/redirect-rules/analytics` to retrieve hit counts per rule.
  - Query parameters for analytics requests and their constraints.
  - Response structure including hits, top link map keys, and top request variants.

## Key workflows and rules
1. **Validation Workflow**
   - Create or update a redirect rule.
   - The system validates the rule and returns `400 Bad Request` for any invalid rules.
   - Common validation checks include ensuring the source is non-empty and valid regex, capturing groups exist, and the destination is a valid URL.

2. **Simulate Workflow**
   - Send a `POST` request to `/api/v1/redirect-rules/simulate` with up to 100 entries.
   - Each entry is evaluated independently against current live rules.
   - The response includes fields such as `matched`, `statusCode`, `target`, and `linkMapKey`.
   - Use `checkDestinationBlacklist` to run destination blacklist checks.

3. **Analytics Workflow**
   - Send a `GET` request to `/api/v1/redirect-rules/analytics` with optional parameters to filter results.
   - Analyze the response for total hits and top link map keys or request variants.

## Limits and constraints
- **Validation Limits:**
  - Source and destination fields can be a maximum of 16,384 characters.
  - Recursion depth for conditional nesting is limited to 32 levels.
  - Up to 6 methods allowed in `matchMethod`.

- **Simulate Request Limits:**
  - Up to 100 entries per request.
  - `userAgent` is limited to 512 characters.
  
- **Analytics Query Limits:**
  - `limit` parameter can range from 1 to 50 (default is 50).
  - The time span between `start` and `end` cannot exceed 31 days.
  - Both `start` and `end` must be provided together; providing only one results in a `400` error.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Matching and destinations](./redirect-rules-core.md)
- [Tests in the dashboard](./dashboard/tests-in-dashboard.md)
- [Analytics in the dashboard](./dashboard/analytics-in-dashboard.md)
