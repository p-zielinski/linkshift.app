---
source: shared/docs/pages/guides/redirect-rules-link-maps.md
generatedAt: 2026-05-30T07:02:31.577Z
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
1. **Link Map Rule Processing**:
   - A redirect rule matches a request path using `pathMatch` and `queryMatch`.
   - The engine extracts the link map key from the request path after stripping the source prefix.
   - The extracted key and request query are used for a lookup in the link map.
   - The destination from the matched entry is used for the redirect, with the HTTP status code coming from the redirect rule.

2. **Example of Link Map Rule**:
   - Rule source: `/go`, Request: `/go/summer?utm=email`
   - Extracted key: `summer`, Redirect target: `https://shop.example/sale`

3. **API Requirements**:
   - When `linkMapId` is set:
     - `destination` must be omitted or set to JSON `null`.
     - `pathMatch` must be `prefix`.
     - `queryMatch` must be `ignore`.
     - `source` must be a plain path without wildcards or regex.

4. **Handling Lookup Failures**:
   - If the link map lookup fails and no `fallbackDestination` is set, the rule does not redirect, and the engine continues to the next rule.
   - To handle empty extracted keys, set a `fallbackDestination` or add a lower-priority catch-all rule.

5. **Validation and Testing**:
   - When `linkMapId` is set, the stored `destination` is always `null`.
   - To validate routing before deployment, use `POST /api/v1/redirect-rules/simulate` with the expected path/query/method.

## Limits and constraints
- The link map must belong to the same `domainGroupId` as the redirect rule.
- Entry destinations in link maps must be static URLs; dynamic placeholders or ternaries are not allowed.
- The `destination` field must be omitted or set to `null` when creating/updating link map rules; any other value results in a `400` error.
- The API does not evaluate rule-level `destination` when `linkMapId` is set; only map entry and `fallbackDestination` URLs are considered.

## Related docs and API areas
- [Redirect rules guide](./redirect-rules.md)
- [Matching and destinations](./redirect-rules-core.md)
- [Link map entries](./link-map-entries.md#destinations-are-static-urls)
- [Link maps guide](./link-maps.md#when-visitors-hit-the-prefix-only)
- [Link map concepts](../concepts/link-map-concepts.md)
- [Redirect tests](./redirect-tests.md)
- `POST /api/v1/redirect-rules/simulate` for testing redirect rules.
