---
source: shared/docs/pages/concepts/link-map-concepts.md
generatedAt: 2026-05-26T21:09:11.798Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and system architects, explaining the concept and functionality of link maps used in redirect rules.

## What this doc covers
- **What link maps are**: Explanation of link maps as keyed routing tables.
- **Why they exist**: Benefits of using link maps such as scalability and operational efficiency.
- **Data model**: Structure of link maps and link map entries, including fields and their purposes.
- **Integration with redirect rules**: Configuration layers and requirements for using link maps with redirect rules.
- **Key normalization rules**: Rules applied when creating or updating keys in link maps.
- **Query matching modes**: Different modes for matching queries against link map entries.
- **Resolution flow**: Step-by-step process for resolving a link map entry.
- **Safety and security**: Validation processes for URLs in link maps.
- **Cache model**: Behavior of caching for link maps and entries.
- **Operational constraints**: Limitations and rules regarding link maps and entries.
- **Error semantics**: Meaning of various HTTP status codes related to link maps.
- **Choosing `queryMatch`**: Guidance on selecting the appropriate query matching strategy.
- **Practical examples**: Use cases demonstrating different query matching strategies.
- **Related guides**: Links to additional documentation for further reading.

## Key workflows and rules
1. **Link Map Creation**:
   - Define a link map with fields such as `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, and `fallbackDestination`.
   - Ensure uniqueness with `@@unique([linkMapId, keyNormalized])`.

2. **Redirect Rule Configuration**:
   - Set `pathMatch` to `prefix` and `queryMatch` to `ignore` when using `linkMapId`.
   - Ensure the source path is a plain path without regex or wildcards.

3. **Key Extraction**:
   - Extract key from the request path after confirming the redirect rule matches.

4. **Entry Resolution**:
   - Apply the `queryMatch` strategy to determine how to resolve the key to a destination URL.

5. **Handling Misses**:
   - If no entry matches and no `fallbackDestination` is set, the rule does not redirect.

6. **Cache Management**:
   - Cache link map context per `linkMapId` with a TTL of up to 5 minutes for positive cache and 1 minute for negative cache.

## Limits and constraints
- Map and entry counts are limited by the organization plan.
- Cannot delete a map referenced by active redirect rules.
- Changing `caseSensitive` from `true` to `false` is not allowed after creation.
- Entries must belong to the same organization via domain group.
- Error responses include:
  - `404`: Map or entry not accessible.
  - `400`: Duplicate key or invalid format.
  - `500`: Safety scanner failure.

## Related docs and API areas
- [Link maps guide](../guides/link-maps.md)
- [Link map entries guide](../guides/link-map-entries.md)
- [Redirect rules guide](../guides/redirect-rules.md)
- [Redirect engine concepts](./redirect-engine-concepts.md)
