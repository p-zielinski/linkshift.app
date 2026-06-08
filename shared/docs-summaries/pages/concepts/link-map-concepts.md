---
source: shared/docs/pages/concepts/link-map-concepts.md
generatedAt: 2026-06-08T20:06:26.571Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and operations teams who need to understand link maps, their behavior, and how they integrate with redirect rules in the LinkShift platform.

## What this doc covers
- **What link maps are**: Explanation of link maps as keyed routing tables for redirect rules.
- **Why they exist**: Benefits of using link maps, including scalability and operational efficiency.
- **Data model**: Structure of link maps and link map entries, including fields and their purposes.
- **Integration with redirect rules**: How link maps work with redirect rules, including configuration requirements.
- **Key normalization rules**: Rules for normalizing keys during creation, updates, and imports.
- **Query matching modes**: Different modes for matching query parameters during link resolution.
- **Resolution flow**: Step-by-step process for resolving link map destinations.
- **Safety and security**: Validation processes for URLs and destinations.
- **Cache model**: Caching behavior for link maps and entries.
- **Operational constraints**: Limitations and rules for managing link maps and entries.
- **Error semantics**: Explanation of error codes and their meanings.
- **Choosing `queryMatch`**: Guidance on selecting the appropriate query matching strategy.
- **Practical examples**: Examples of different use cases for link maps.

## Key workflows and rules
1. **Link Map Creation**:
   - Define `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, and `fallbackDestination`.
   - Ensure uniqueness of keys with `@@unique([linkMapId, keyNormalized])`.

2. **Redirect Rule Configuration**:
   - Set `pathMatch` to `prefix`, `queryMatch` to `ignore`, and `destination` to `null` when using `linkMapId`.
   - Extract key from the request path after matching the redirect rule.

3. **Key Normalization**:
   - Trim whitespace, tolerate leading slashes, and apply case sensitivity rules.
   - Reject full URLs and empty keys.

4. **Query Matching**:
   - Use `ignore` for path-only keys, `exact` for strict matches, and `subset` for base links with optional parameters.

5. **Resolution Flow**:
   - Load map context, normalize key and query, apply `queryMatch`, and return the destination or fallback.

6. **Error Handling**:
   - Return `404` for inaccessible maps or entries, `400` for invalid requests, and `500` for safety scanner failures.

## Limits and constraints
- **Operational Limits**: Map and entry counts are limited by the organization plan.
- **Deletion Restrictions**: Cannot delete a map referenced by active redirect rules.
- **Case Sensitivity**: Cannot change `caseSensitive` from `true` to `false` after creation.
- **Entry Ownership**: Entries must belong to a map in the same organization.
- **Cache Behavior**: Cache invalidation occurs immediately upon successful mutations, with a TTL of up to 5 minutes for positive cache.

## Related docs and API areas
- [Link maps guide](../guides/link-maps.md)
- [Link map entries guide](../guides/link-map-entries.md)
- [Redirect rules guide](../guides/redirect-rules.md)
- [Redirect rules — link maps section](../guides/redirect-rules-link-maps.md#link-maps--redirect-rules)
- [Redirect engine concepts](./redirect-engine-concepts.md)
