---
source: shared/docs/pages/concepts/link-map-concepts.md
generatedAt: 2026-06-07T10:03:11.799Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and system architects explaining the concepts and functionalities of link maps used in redirect rules.

## What this doc covers
- **What link maps are**: Explanation of link maps as keyed routing tables for redirect rules.
- **Why they exist**: Benefits of using link maps including scalability, operational efficiency, separation of concerns, and analytics.
- **Data model**: Detailed structure of link maps and link map entries, including fields and their purposes.
- **Integration with redirect rules**: How link maps interact with redirect rules, including configuration requirements and key extraction.
- **Key normalization rules**: Rules applied during the creation, update, and import of keys.
- **Query matching modes**: Different modes for matching queries (`ignore`, `exact`, `subset`) and their use cases.
- **Resolution flow**: Step-by-step process for resolving link map destinations.
- **Safety and security**: Validation processes for URLs and error handling.
- **Cache model**: Caching behavior for link maps and entries.
- **Operational constraints**: Limitations on maps and entries, including organizational plan restrictions.
- **Error semantics**: Explanation of HTTP status codes related to link maps.
- **Choosing `queryMatch`**: Guidelines for selecting the appropriate query matching strategy.
- **Practical examples**: Use cases demonstrating different query matching strategies.
- **Related guides**: Links to additional documentation for further reading.

## Key workflows and rules
1. **Link Map Creation**:
   - Define fields: `id`, `name`, `domainGroupId`, `caseSensitive`, `queryMatch`, `fallbackDestination`.
   - Ensure uniqueness of keys with `@@unique([linkMapId, keyNormalized])`.

2. **Redirect Rule Configuration**:
   - Set `pathMatch: prefix` and `queryMatch: ignore` when using `linkMapId`.
   - Extract key from the request path after matching the redirect rule.

3. **Key Extraction**:
   - Example: For a request path `/go/summer/extra`, the key extracted is `summer/extra`.

4. **Key Normalization**:
   - Trim whitespace, tolerate leading slashes, and apply case sensitivity rules.

5. **Query Matching**:
   - **ignore**: Only the extracted path key is used.
   - **exact**: Full normalized path and query must match.
   - **subset**: All entry query params must appear in the request; extra params allowed.

6. **Resolution Flow**:
   - Load map context, normalize key and query, apply `queryMatch`, and return the destination or fallback.

7. **Error Handling**:
   - Validate URLs before write operations; return appropriate HTTP status codes for errors.

## Limits and constraints
- **Operational Constraints**:
  - Map and entry counts are limited by the organization plan.
  - Cannot delete a map referenced by active redirect rules.
  - Changing `caseSensitive` from `true` to `false` is not allowed.
  - Entries must belong to the same organization via domain group.

- **Cache Behavior**:
  - Cache miss leads to loading from the database with a TTL of up to 5 minutes.
  - Negative cache for missing maps lasts about 1 minute.

- **Key Normalization**:
  - Full URLs and empty keys are rejected during key creation.

## Related docs and API areas
- [Link maps guide](../guides/link-maps.md)
- [Link map entries guide](../guides/link-map-entries.md)
- [Redirect rules guide](../guides/redirect-rules.md)
- [Redirect rules — link maps section](../guides/redirect-rules-link-maps.md#link-maps--redirect-rules)
- [Redirect engine concepts](./redirect-engine-concepts.md)
