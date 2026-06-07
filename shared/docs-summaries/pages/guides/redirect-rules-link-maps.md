---
source: shared/docs/pages/guides/redirect-rules-link-maps.md
generatedAt: 2026-06-07T10:07:24.694Z
model: gpt-4o-mini
---

## Purpose
This document is for developers implementing redirect rules that utilize link maps, explaining how to connect these components effectively.

## What this doc covers
- Overview of link maps and redirect rules
- Detailed workflow of how link maps interact with redirect rules
- API requirements for link map rules
- Explanation of two layers of query matching
- Handling lookup failures in link maps
- Validation and testing dynamic logic for link map rules

## Key workflows and rules
1. **Matching Process**:
   - The rule matches the request path using `pathMatch` and `queryMatch`.
   - The engine extracts the link map key by stripping the source prefix from the request path.
   - The extracted key and request query are used for a lookup in the link map.
   - The destination from the matched entry becomes the redirect target, with the HTTP status code coming from the redirect rule.

2. **API Requirements**:
   - When `linkMapId` is set:
     - `destination` must be omitted or set to JSON `null`.
     - `pathMatch` must be `prefix`.
     - `queryMatch` must be `ignore`.
     - `source` must be a plain path (single or multi-segment).

3. **Two Layers of Query Matching**:
   - The redirect rule's `queryMatch` must be `ignore`.
   - The link map's `queryMatch` determines how keys with query parameters resolve.

4. **Handling Lookup Failures**:
   - If no entry is found and no `fallbackDestination` is set, the rule does not redirect, and the engine continues to the next rule.
   - To manage empty extracted keys, set a `fallbackDestination` or add a lower-priority catch-all rule.

5. **Validation and Testing**:
   - The stored `destination` is always `null` in the database.
   - The request body must omit `destination` or send JSON `null`.
   - To validate conditional routing, use `POST /api/v1/redirect-rules/simulate` with expected path/query/method.

## Limits and constraints
- The `destination` field must be omitted or set to JSON `null` when `linkMapId` is used; any other value results in a `400` error.
- The link map must belong to the same `domainGroupId` as the redirect rule.
- Entry destinations in link maps must be static URLs; dynamic placeholders are not allowed.
- The API does not apply safety scans to the rule's `destination` when `linkMapId` is set.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Matching and destinations](./redirect-rules-core.md)
- [Link map entries](./link-map-entries.md#destinations-are-static-urls)
- [Link maps guide](./link-maps.md#when-visitors-hit-the-prefix-only)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect tests](./redirect-tests.md)
- `POST /api/v1/redirect-rules/simulate` for testing redirect rules.
