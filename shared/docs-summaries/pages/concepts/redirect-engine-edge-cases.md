---
source: shared/docs/pages/concepts/redirect-engine-edge-cases.md
generatedAt: 2026-06-07T10:03:36.386Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and engineers working with the LinkShift redirect engine, explaining regex sources, link maps, edge cases, and validation rules.

## What this doc covers
- **Regex sources**: Definition, valid flags, examples, and capture group behavior.
- **Wildcard source**: Explanation and usage.
- **Regex and plain path field application**: Differences in field applicability based on source type.
- **Link map key extraction**: How keys are extracted from link map rules.
- **Rule processing edge cases**: Handling malformed rules, blocked rules, and link map misses.
- **Validation summary**: Detailed validation checks for creating/updating rules.
- **Quick reference card**: Summary of source types, matching methods, and placeholders.
- **Advanced engineering FAQ**: Common edge cases and behaviors in production.

## Key workflows and rules
1. **Regex Sources**:
   - Store as string: `/pattern/flags`.
   - Valid flags include `d`, `g`, `i`, `m`, `s`, `u`, `v`, `y`.
   - Capture groups populate `$0`, `$1`, etc., in the destination before placeholder resolution.
   - Validation errors return `400` if `$N` is used incorrectly.

2. **Wildcard Source**:
   - Matches all requests; `pathMatch` and `queryMatch` are ignored.
   - Cannot be combined with `linkMapId`.

3. **Link Map Key Extraction**:
   - Extracts keys based on the matching rule and request path.
   - The rule must match first before key extraction occurs.

4. **Rule Processing**:
   - If a rule throws an error, it is skipped, and the next rule is evaluated.
   - Rules marked as `isBlocked: true` are excluded from matching.

5. **Validation Summary**:
   - Source and destination length must not exceed 16,384 characters.
   - Source regex must be compilable, and destination placeholders must be valid.
   - Link map rules must have `destination` set to `null`.

## Limits and constraints
- **Character Limits**: Source and destination strings are limited to 16,384 characters each.
- **Capture Groups**: Only capturing groups are counted; non-capturing groups do not contribute to `$N`.
- **Destination Validation**: Must start with `http://`, `https://`, or `/`.
- **Link Map Rules**: Must have `destination` as `null` and cannot combine with regex sources.
- **Empty Targets**: API validation requires a non-empty `destination` string; empty strings at runtime lead to broken redirects.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md)
- [Link map concepts](./link-map-concepts.md)
- [Redirect tests guide](../guides/redirect-tests.md)
- [Redirect rules — validation](../guides/redirect-rules-operations.md#validation)
- [Redirect rules — simulate vs live](../guides/redirect-rules-operations.md#simulate-vs-live-redirect)
