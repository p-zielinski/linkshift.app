---
source: shared/docs/pages/guides/redirect-rules-link-maps.md
generatedAt: 2026-05-28T15:49:49.000Z
model: gpt-4o-mini
---

## Purpose
This document is for developers implementing redirect rules that utilize link maps, explaining how to connect and configure them effectively.

## What this doc covers
- **Link maps + redirect rules**: Overview of how link maps function with redirect rules.
- **How it works**: Step-by-step explanation of the matching process.
- **API requirements for link map rules**: Specific field requirements when using `linkMapId`.
- **Two layers of query matching**: Explanation of how query matching works at both the redirect rule and link map levels.
- **When lookup fails**: Behavior when a link map lookup does not return an entry.
- **Link map rule validation and testing dynamic logic**: Guidelines for validating link map rules and testing dynamic routing logic.

## Key workflows and rules
1. **Matching Process**:
   - The rule matches the request path using `pathMatch` and `queryMatch`.
   - The source prefix is stripped to extract the link map key.
   - The key and request query are used for a link map lookup.
   - The destination from the matched entry is used for the redirect.

2. **API Requirements**:
   - When `linkMapId` is set:
     - `destination` must be omitted or set to JSON `null`.
     - `pathMatch` must be `prefix`.
     - `queryMatch` must be `ignore`.
     - `source` must be a plain path without wildcards or regex.

3. **Handling Lookup Failures**:
   - If no entry is found and no `fallbackDestination` is set, the rule does not redirect.
   - It is recommended to add a specific fallback rule below the link map rule.

4. **Validation and Testing**:
   - To validate routing, use `POST /api/v1/redirect-rules/simulate` with the expected path/query/method.
   - Create a temporary rule without `linkMapId` for testing and delete it afterward.

## Limits and constraints
- The `destination` field must be omitted or set to JSON `null` when `linkMapId` is present; any other value will result in a `400` error.
- The link map must belong to the same `domainGroupId` as the redirect rule.
- Entry destinations in link maps must be static URLs; dynamic placeholders or ternaries are not allowed.
- The `queryMatch` for redirect rules using link maps must be set to `ignore`.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Matching and destinations](./redirect-rules-core.md)
- [Link map entries](./link-map-entries.md#destinations-are-static-urls)
- [Link maps guide](./link-maps.md#when-visitors-hit-the-prefix-only)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect tests](./redirect-tests.md)
