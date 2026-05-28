---
source: shared/docs/pages/concepts/redirect-engine-edge-cases.md
generatedAt: 2026-05-28T15:48:40.157Z
model: gpt-4o-mini
---

## Purpose
This document is for developers working with the LinkShift redirect engine, explaining regex and wildcard sources, link map key extraction, edge cases, and validation rules.

## What this doc covers
- **Regex sources**: Definition, valid flags, examples, and capturing groups.
- **Wildcard source (`*`)**: Behavior and limitations.
- **Regex and plain path field application**: Differences in field applicability for various source types.
- **Link map key extraction**: How keys are extracted from link map rules.
- **Rule processing edge cases**: Handling malformed rules, blocked rules, and link map misses.
- **Validation summary**: Checks performed on create/update.
- **Quick reference card**: Summary of source types, match methods, placeholders, and more.
- **Advanced engineering FAQ**: Common edge cases and their resolutions.

## Key workflows and rules
1. **Regex Source Handling**:
   - Store regex as `/pattern/flags`.
   - Capture groups populate `$0`, `$1`, etc., in the destination before placeholder resolution.
   - Validation checks for capturing group limits and proper regex syntax.
   - Use `queryMatch` to control whether to match against the full URL or just the path.

2. **Wildcard Source**:
   - Matches all requests; `pathMatch` and `queryMatch` are ignored.
   - Cannot be combined with `linkMapId`.

3. **Link Map Key Extraction**:
   - The source path must match the request path for key extraction.
   - Trailing slashes affect matching behavior.

4. **Blocked Rules**:
   - Rules marked as `isBlocked: true` are excluded from matching.
   - Ongoing safety checks may block rules with unsafe destinations.

5. **Validation on Create/Update**:
   - Source and destination length must not exceed 16,384 characters.
   - Destination must be a valid URL structure.
   - Link map rules must have `destination: null`.

## Limits and constraints
- **Character Limits**: Source and destination strings are limited to 16,384 characters.
- **Regex Flags**: Valid flags include `d`, `g`, `i`, `m`, `s`, `u`, `v`, `y`.
- **Capture Groups**: Only capturing groups are counted; non-capturing groups do not count.
- **Link Map Rules**: Must have `destination: null` and cannot use regex sources.
- **Empty Destinations**: API validation requires non-empty destination strings on create/update.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md)
- [Link map concepts](./link-map-concepts.md)
- [Redirect tests guide](../guides/redirect-tests.md)
- [Redirect rules — validation](../guides/redirect-rules-operations.md#validation)
- [Simulate before rollout](../guides/redirect-rules-operations.md#simulate-before-rollout)
