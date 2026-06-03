---
source: shared/docs/pages/concepts/link-map-concepts.md
generatedAt: 2026-06-03T16:56:24.472Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and operators who need to understand link maps, their structure, and how they integrate with redirect rules in the LinkShift platform.

## What this doc covers
- **What link maps are**: Explanation of link maps as keyed routing tables for redirect rules.
- **Why they exist**: Benefits of using link maps, including scalability and operational efficiency.
- **Data model**: Structure of link maps and link map entries, including fields and their purposes.
- **Integration with redirect rules**: How link maps work with redirect rules, including configuration layers and requirements.
- **Key normalization rules**: Rules for normalizing keys during creation, updates, and imports.
- **Query matching modes**: Different modes for matching queries against link map entries.
- **Resolution flow**: Steps taken to resolve a link map entry based on incoming requests.
- **Safety and security**: Validation processes for URLs and error handling.
- **Cache model**: How link map contexts are cached and the behavior of cache events.
- **Operational constraints**: Limitations on maps and entries based on organizational plans.
- **Error semantics**: Meaning of various HTTP status codes related to link maps.
- **Choosing `queryMatch`**: Guidance on selecting the appropriate query matching strategy.
- **Practical examples**: Use cases demonstrating different query matching strategies.
- **Related guides**: Links to additional documentation for further reading.

## Key workflows and rules
1. **Link Map Creation**:
   - Define a link map with fields like `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, and `fallbackDestination`.
   - Ensure uniqueness of keys with `@@unique([linkMapId, keyNormalized])`.

2. **Redirect Rule Configuration**:
   - Set `pathMatch: prefix`, `queryMatch: ignore`, and `destination: null` when using `linkMapId`.
   - Extract key from the request path after matching the redirect rule.

3. **Key Extraction**:
   - For a request path like `/go/summer/extra`, the key extracted is `summer/extra`.

4. **Entry Resolution**:
   - Depending on `queryMatch` mode (`ignore`, `exact`, or `subset`), resolve the destination URL.
   - If no entry matches and no `fallbackDestination` is set, the rule does not redirect.

5. **Key Normalization**:
   - Normalize keys by trimming whitespace, handling leading slashes, and applying case sensitivity rules.

6. **Cache Management**:
   - Cache link map contexts per `linkMapId` with a TTL of up to 5 minutes for positive cache and 1 minute for negative cache.

## Limits and constraints
- **Map and Entry Limits**: Limited by the organization plan.
- **Deletion Restrictions**: Cannot delete a map referenced by active redirect rules.
- **Case Sensitivity**: Cannot change `caseSensitive` from `true` to `false` after creation.
- **Entry Ownership**: Entries must belong to a map within the same organization (via domain group).
- **Cache Invalidation**: Changes to maps or entries invalidate the cache immediately for that `linkMapId`.

## Related docs and API areas
- [Link maps guide](../guides/link-maps.md)
- [Link map entries guide](../guides/link-map-entries.md)
- [Redirect rules guide](../guides/redirect-rules.md)
- [Redirect rules — link maps section](../guides/redirect-rules-link-maps.md#link-maps--redirect-rules)
- [Redirect engine concepts](./redirect-engine-concepts.md)
