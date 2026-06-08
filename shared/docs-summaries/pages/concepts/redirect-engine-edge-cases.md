---
source: shared/docs/pages/concepts/redirect-engine-edge-cases.md
generatedAt: 2026-06-08T20:06:52.688Z
model: gpt-4o-mini
---

## Purpose
This document is for developers working with the LinkShift redirect engine, explaining regex, link maps, and handling edge cases in redirect rules.

## What this doc covers
- **Regex sources**: Definition and examples of regex patterns and flags.
- **Wildcard source (`*`)**: Explanation of wildcard matching and its limitations.
- **Regex and plain path**: Differences in fields applicable to regex and plain path sources.
- **Link map key extraction**: How keys are extracted from link map rules.
- **Rule processing edge cases**: Handling malformed rules, blocked rules, and link map misses.
- **Validation summary**: Overview of validation checks during rule creation and updates.
- **Quick reference card**: Summary of source types, matching methods, and placeholders.
- **Advanced engineering FAQ**: Common edge cases and their resolutions.

## Key workflows and rules
1. **Regex Source Validation**:
   - Must be stored as `/pattern/flags`.
   - Capture groups populate `$0`, `$1`, etc., before placeholder resolution.
   - Validation fails with `400` if `$N` is used without a regex source.

2. **Wildcard Source Handling**:
   - Matches all requests, ignoring `pathMatch` and `queryMatch`.
   - Cannot be combined with `linkMapId`.

3. **Link Map Key Extraction**:
   - Extracts key from the request path after matching the rule.
   - Must match with `pathMatch: prefix` and `queryMatch: ignore`.

4. **Blocked Rules**:
   - Rules marked with `isBlocked: true` are excluded from matching.
   - Ongoing safety checks may block rules with unsafe URLs.

5. **Destination Domain Blacklist**:
   - Redirects may be blocked with a `403 Forbidden` if the destination host is blacklisted.

6. **Validation Checks**:
   - Source and destination length must not exceed 16,384 characters.
   - Regex must be compilable, and placeholders must be valid.
   - Link map rules must have `destination: null`.

## Limits and constraints
- **Character Limits**: Source and destination strings are limited to 16,384 characters.
- **Capture Groups**: Only regex sources can utilize `$N` capture groups; plain paths and wildcards cannot.
- **Link Map Rules**: Must have `destination: null` and cannot use regex sources.
- **Blacklist Checks**: Only absolute URLs are checked against the domain blacklist; root-relative paths are skipped.
- **Empty Destinations**: API validation requires a non-empty destination string; empty branches lead to broken redirects.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md)
- [Link map concepts](./link-map-concepts.md)
- [Redirect tests guide](../guides/redirect-tests.md)
- [Redirect rules — validation](../guides/redirect-rules-operations.md#validation)
- [Redirect rules — simulate vs live](../guides/redirect-rules-operations.md#simulate-vs-live-redirect)
