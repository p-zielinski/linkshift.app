---
source: shared/docs/pages/concepts/link-map-concepts.md
generatedAt: 2026-05-30T06:58:44.096Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and operators who need to understand link maps, their structure, and how they integrate with redirect rules in the LinkShift platform.

## What this doc covers
- **What link maps are**: Explanation of link maps as keyed routing tables for redirect rules.
- **Why they exist**: Benefits of using link maps, including scalability and operational efficiency.
- **Data model**: Detailed structure of link maps and link map entries, including fields and their purposes.
- **Integration with redirect rules**: How link maps work with redirect rules, including configuration layers and requirements.
- **Key normalization rules**: Rules for normalizing keys during creation, updates, and imports.
- **Query matching modes**: Different modes for matching query parameters during link resolution.
- **Resolution flow**: Step-by-step process for resolving link map entries.
- **Safety and security**: Validation processes for URLs and error handling.
- **Cache model**: Explanation of caching behavior for link maps.
- **Operational constraints**: Limitations on maps and entries, including update rules.
- **Error semantics**: Meaning of different HTTP status codes related to link maps.
- **Choosing `queryMatch`**: Guidelines for selecting the appropriate query matching strategy.
- **Practical examples**: Examples of link maps with different query matching strategies.
- **Related guides**: Links to additional documentation for further reading.

## Key workflows and rules
1. **Link Map Creation**: 
   - Define a link map with fields like `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, and `fallbackDestination`.
   - Ensure uniqueness with `@@unique([linkMapId, keyNormalized])`.

2. **Redirect Rule Configuration**:
   - Set `pathMatch: prefix` and `queryMatch: ignore` when using `linkMapId`.
   - Ensure the source path is a plain path (e.g., `/go`).

3. **Key Extraction**:
   - Extract key from the request path after confirming the redirect rule matches.

4. **Link Map Resolution**:
   - Normalize incoming `keyPath` and query.
   - Apply `queryMatch` strategy to determine the destination URL.

5. **Handling Misses**:
   - If no entry matches and no `fallbackDestination` is set, the rule does not redirect.

6. **Cache Management**:
   - Cache link map context per `linkMapId` with a TTL of up to 5 minutes.
   - Invalidate cache immediately upon successful mutations.

## Limits and constraints
- **Operational Constraints**:
  - Map and entry counts are limited by the organization plan.
  - Cannot delete a map that is referenced by active redirect rules.
  - Changing `caseSensitive` from `true` to `false` is not allowed.

- **Field Limits**:
  - Entries must belong to a map in the same organization (via domain group).

- **Error Handling**:
  - `404` for inaccessible maps or entries.
  - `400` for duplicate keys or invalid formats.
  - `500` for safety scanner failures.

## Related docs and API areas
- [Link maps guide](../guides/link-maps.md)
- [Link map entries guide](../guides/link-map-entries.md)
- [Redirect rules guide](../guides/redirect-rules.md)
- [Redirect rules — link maps section](../guides/redirect-rules-link-maps.md#link-maps--redirect-rules)
- [Redirect engine concepts](./redirect-engine-concepts.md)
