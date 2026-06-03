---
source: shared/docs/pages/concepts/redirect-engine-edge-cases.md
generatedAt: 2026-06-03T16:56:47.013Z
model: gpt-4o-mini
---

## Purpose
This document is for developers working with the Redirect Engine in LinkShift, explaining regex sources, wildcard sources, link map key extraction, edge cases, and validation rules.

## What this doc covers
- **Regex sources**: Definition, valid flags, examples, and capture group behavior.
- **Wildcard source**: Behavior and limitations of using `*` as a source.
- **Regex and plain path**: Differences in applicable fields and rules.
- **Link map key extraction**: How keys are extracted from link map rules.
- **Rule processing edge cases**: Handling malformed rules, blocked rules, and blacklist checks.
- **Validation summary**: Detailed checks performed on source and destination during create/update.
- **Quick reference card**: Summary of source types, matching methods, and placeholders.
- **Advanced engineering FAQ**: Common edge cases and behaviors in production.

## Key workflows and rules
1. **Regex Sources**:
   - Store as string: `/pattern/flags`.
   - Valid flags: `d`, `g`, `i`, `m`, `s`, `u`, `v`, `y`.
   - Capture groups populate `$0`, `$1`, etc. in the destination before placeholder resolution.
   - Validation errors return `400` if `$N` is used incorrectly.

2. **Wildcard Source**:
   - Matches all requests; `pathMatch` and `queryMatch` are ignored.
   - Cannot be combined with `linkMapId`.

3. **Link Map Key Extraction**:
   - Extracted key is derived from the request path after matching the rule.
   - Trailing slashes affect matching behavior.

4. **Blocked Rules**:
   - Rules with `isBlocked: true` are excluded from matching.
   - Ongoing safety checks may block rules if unsafe URLs are detected.

5. **Destination Domain Blacklist**:
   - Redirects may be blocked with a `403 Forbidden` if the destination host is blacklisted.

6. **Validation Summary**:
   - Source and destination length must not exceed 16,384 characters.
   - Regex must be compilable; capture group count must match `$N` usage.
   - Placeholders and conditionals must follow specific syntax and limits.

## Limits and constraints
- **Character Limits**: Source and destination strings are limited to 16,384 characters.
- **Capture Groups**: Only capturing groups are counted; non-capturing groups do not contribute.
- **Destination Validation**: Must start with `http://`, `https://`, or `/`.
- **Link Map Rules**: Must have `destination: null` and cannot use regex sources.
- **Empty Destinations**: Cannot create/update rules with an empty destination string.
- **Blacklist Checks**: Only absolute URLs are checked against the blacklist; root-relative paths are skipped.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md)
- [Link map concepts](./link-map-concepts.md)
- [Redirect tests guide](../guides/redirect-tests.md)
- [Redirect rules — validation](../guides/redirect-rules-operations.md#validation)
- [Redirect rules — simulate vs live](../guides/redirect-rules-operations.md#simulate-vs-live-redirect)
