---
source: shared/docs/pages/concepts/redirect-engine-edge-cases.md
generatedAt: 2026-05-30T06:59:06.182Z
model: gpt-4o-mini
---

## Purpose
This document is for developers working with the LinkShift redirect engine, explaining regex and wildcard sources, link map key extraction, edge cases, and validation rules.

## What this doc covers
- **Regex sources**: Explanation of regex patterns, valid flags, and examples.
- **Wildcard source (`*`)**: Details on matching all requests and limitations.
- **Regex and plain path**: Differences in fields applicable to regex vs plain path sources.
- **Link map key extraction**: How to extract keys from link map rules.
- **Rule processing edge cases**: Handling malformed rules, blocked rules, and blacklist checks.
- **Validation summary**: Checks performed during rule creation and updates.
- **Quick reference card**: Summary of source types, matching methods, placeholders, and more.
- **Advanced engineering FAQ**: Answers to common edge cases and behaviors.

## Key workflows and rules
1. **Regex Sources**:
   - Store as string: `/pattern/flags`.
   - Valid flags include `d`, `g`, `i`, `m`, `s`, `u`, `v`, `y`.
   - Capture groups populate `$0`, `$1`, etc., before placeholder resolution.
   - Validation checks for the number of capturing groups and proper regex syntax.
   
2. **Wildcard Source**:
   - Matches all requests with `source: "*"`; `pathMatch` and `queryMatch` are ignored.
   - Cannot be combined with `linkMapId`.

3. **Link Map Key Extraction**:
   - Extracts keyPath from the request path after matching the rule.
   - The rule must match first before key extraction occurs.

4. **Rule Processing**:
   - Malformed rules are skipped during processing.
   - Rules marked as `isBlocked` are excluded from matching.
   - Blacklist checks occur after a target is resolved, returning `403 Forbidden` if blocked.

5. **Validation Summary**:
   - Validates source and destination length (max 16,384 characters).
   - Checks for valid regex, placeholders, and URL structure.
   - Ensures `linkMapId` rules have `destination: null`.

## Limits and constraints
- **Character Limits**: Source and destination strings are limited to 16,384 characters.
- **Regex Validation**: Must be compilable and adhere to capturing group limits.
- **Destination Requirements**: Must start with `http://`, `https://`, or `/`.
- **Link Map Rules**: `destination` must be `null` for link map rules; any other value returns `400`.
- **Empty Targets**: API validation requires non-empty destinations; empty targets lead to broken redirects.
- **Blacklist Checks**: Only absolute URLs are checked against the blacklist; root-relative paths are skipped.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md)
- [Link map concepts](./link-map-concepts.md)
- [Redirect tests guide](../guides/redirect-tests.md)
- [Redirect rules — validation](../guides/redirect-rules-operations.md#validation)
- [Redirect rules — simulate vs live](../guides/redirect-rules-operations.md#simulate-vs-live-redirect)
