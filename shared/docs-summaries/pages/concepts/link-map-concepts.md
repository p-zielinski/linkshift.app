---
source: shared/docs/pages/concepts/link-map-concepts.md
generatedAt: 2026-05-28T15:48:09.914Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and operations teams, explaining the concepts and behaviors of link maps used in redirect rules.

## What this doc covers
- **What link maps are**: Explanation of link maps as keyed routing tables for redirect rules.
- **Why they exist**: Benefits of using link maps, including scalability and operational efficiency.
- **Data model**: Structure of link maps and link map entries, including fields and their purposes.
- **Integration with redirect rules**: Configuration layers and requirements for using link maps with redirect rules.
- **Key normalization rules**: Rules applied during the creation, update, and import of keys.
- **Query matching modes**: Different modes for matching queries (`ignore`, `exact`, `subset`) and their use cases.
- **Resolution flow**: Step-by-step process for resolving link map destinations.
- **Safety and security**: Validation processes for URLs and error handling.
- **Cache model**: Behavior of caching for link maps and entries.
- **Operational constraints**: Limitations on maps and entries, including update rules.
- **Error semantics**: Status codes and their meanings related to link maps.
- **Choosing `queryMatch`**: Guidelines for selecting the appropriate query matching strategy.
- **Practical examples**: Use cases demonstrating different query match strategies.

## Key workflows and rules
1. **Link Map Creation**: Define a link map with fields such as `id`, `name`, `domainGroupId`, and `caseSensitive`.
2. **Entry Creation**: Add entries with `key`, `keyNormalized`, and `destination`. Ensure uniqueness with `@@unique([linkMapId, keyNormalized])`.
3. **Redirect Rule Configuration**: Set `source`, `pathMatch`, `queryMatch`, and `linkMapId` in redirect rules. Ensure `pathMatch` is set to `prefix` when using `linkMapId`.
4. **Key Extraction**: Extract the key from the request path after matching the redirect rule.
5. **Query Matching**: Apply the selected `queryMatch` strategy to resolve the destination URL.
6. **Fallback Handling**: If no entry matches and no `fallbackDestination` is set, the rule does not redirect.
7. **Cache Management**: Cache link map context and manage TTL for cache hits and misses.

## Limits and constraints
- **Map and Entry Limits**: Limited by the organization plan.
- **Deletion Restrictions**: Cannot delete a map referenced by active redirect rules.
- **Case Sensitivity**: Cannot change `caseSensitive` from `true` to `false` after creation.
- **Entry Ownership**: Entries must belong to the same organization as the map.
- **Cache Behavior**: Cache invalidation occurs immediately upon successful mutations.

## Related docs and API areas
- [Link maps guide](../guides/link-maps.md)
- [Link map entries guide](../guides/link-map-entries.md)
- [Redirect rules guide](../guides/redirect-rules.md)
- [Redirect rules — link maps section](../guides/redirect-rules-link-maps.md#link-maps--redirect-rules)
- [Redirect engine concepts](./redirect-engine-concepts.md)
