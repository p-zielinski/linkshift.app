---
source: shared/docs/pages/guides/redirect-rules-link-maps.md
generatedAt: 2026-06-08T20:11:10.744Z
model: gpt-4o-mini
---

## Purpose
This document is for developers implementing redirect rules that utilize link maps, explaining how to connect these components effectively.

## What this doc covers
- **Link maps + redirect rules**: Overview of how link maps function with redirect rules.
- **How it works**: Detailed explanation of the matching process and examples.
- **API requirements for link map rules**: Specific fields and values required when using `linkMapId`.
- **Two layers of query matching**: Explanation of how query matching works at both the redirect rule and link map levels.
- **When lookup fails**: Behavior when a link map lookup does not return an entry.
- **Link map rule validation and testing dynamic logic**: Validation rules for link map rules and how to test them.

## Key workflows and rules
1. **Matching Process**:
   - A redirect rule matches the request path using `pathMatch` and `queryMatch`.
   - The engine extracts the link map key from the request path after stripping the source prefix.
   - The extracted key and request query are used for a lookup in the link map.
   - The destination from the matched entry is used for the redirect, with the HTTP status code coming from the redirect rule.

2. **API Requirements**:
   - When `linkMapId` is set:
     - `destination` must be omitted or set to JSON `null`.
     - `pathMatch` must be `prefix`.
     - `queryMatch` must be `ignore`.
     - `source` must be a plain path without wildcards or regex.

3. **Handling Lookup Failures**:
   - If no entry is found and no `fallbackDestination` is set, the rule does not redirect, and the engine continues to the next rule.
   - To handle empty extracted keys, set a `fallbackDestination` or add a catch-all rule with a lower priority.

4. **Validation and Testing**:
   - The stored `destination` is always `null` in the database.
   - The request body must omit `destination` or send JSON `null`.
   - Use `POST /api/v1/redirect-rules/simulate` to validate routing before going live.

## Limits and constraints
- The link map must belong to the same `domainGroupId` as the redirect rule.
- Entry destinations in link maps must be static URLs; dynamic placeholders are not allowed.
- The `destination` field must be omitted or set to `null` when creating or updating a rule with `linkMapId`, or a `400` error will be returned.
- The `queryMatch` for redirect rules must be `ignore` when using link maps.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Matching and destinations](./redirect-rules-core.md)
- [Link map entries](./link-map-entries.md#destinations-are-static-urls)
- [Link maps guide](./link-maps.md#when-visitors-hit-the-prefix-only)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect tests](./redirect-tests.md) for testing expected outcomes in CI.
