---
source: shared/docs/pages/guides/redirect-rules-link-maps.md
generatedAt: 2026-06-03T16:59:51.570Z
model: gpt-4o-mini
---

## Purpose
This document is for developers implementing redirect rules that utilize link maps, explaining how to connect and configure them effectively.

## What this doc covers
- Overview of link maps and redirect rules
- How link maps work with redirect rules
- API requirements for link map rules
- Two layers of query matching
- Handling lookup failures
- Validation and testing dynamic logic for link map rules

## Key workflows and rules
1. **Link Map Lookup Process**:
   - The rule matches the request path using `pathMatch` and `queryMatch`.
   - The engine extracts the link map key from the request path after removing the source prefix.
   - The key and request query are used for a lookup in the link map.
   - The destination from the matched entry is used for the redirect, with the HTTP status code coming from the redirect rule.

2. **API Requirements for Link Map Rules**:
   - When `linkMapId` is set:
     - `destination` must be omitted or set to JSON `null`.
     - `pathMatch` must be `prefix`.
     - `queryMatch` must be `ignore`.
     - `source` must be a plain path without wildcards or regex.

3. **Handling Lookup Failures**:
   - If no entry is found and no `fallbackDestination` is set, the rule does not redirect, and the engine continues to the next rule.
   - To handle empty extracted keys, set a `fallbackDestination` or add a catch-all rule with lower priority.

4. **Validation and Testing**:
   - When `linkMapId` is set, the stored `destination` is always `null`.
   - The request body must omit `destination` or send JSON `null`; any other value results in a `400` error.
   - Use `POST /api/v1/redirect-rules/simulate` to validate routing before going live.

## Limits and constraints
- The link map must belong to the same `domainGroupId` as the redirect rule.
- Entry destinations in link maps must be static URLs; dynamic placeholders or ternaries are not allowed.
- The `destination` field must be omitted or set to `null` when creating or updating a rule with `linkMapId`, or it will return a `400` error.
- The `queryMatch` for redirect rules must be `ignore` when using link maps.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Matching and destinations](./redirect-rules-core.md)
- [Link map entries](./link-map-entries.md#destinations-are-static-urls)
- [Link maps guide](./link-maps.md#when-visitors-hit-the-prefix-only)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect tests](./redirect-tests.md)
- `POST /api/v1/redirect-rules/simulate` for testing routing behavior.
