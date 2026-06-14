---
source: shared/docs/pages/concepts/redirect-engine-edge-cases.md
generatedAt: 2026-06-14T15:24:30.023Z
model: gpt-4o-mini
---

## Purpose
This document is for developers working with the LinkShift redirect engine, explaining regex sources, wildcard sources, link map key extraction, and various edge cases in rule processing.

## What this doc covers
- **Regex sources**: Definition, valid flags, examples, and capture group behavior.
- **Wildcard source**: Usage and limitations.
- **Regex and plain path**: Field applicability for different source types.
- **Link map key extraction**: How keys are extracted from link map rules.
- **Rule processing edge cases**: Handling malformed rules, blocked rules, and destination domain blacklisting.
- **Validation summary**: Checks performed on create/update for sources and destinations.
- **Quick reference card**: Summary of source types, matching methods, placeholders, and more.
- **Advanced engineering FAQ**: Common issues and their resolutions.

## Key workflows and rules
1. **Regex Source Definition**: 
   - Store as string: `/pattern/flags`.
   - Valid flags include `d`, `g`, `i`, `m`, `s`, `u`, `v`, `y`.
   - Capture groups populate `$0`, `$1`, etc., before placeholder resolution.

2. **Wildcard Source**:
   - Matches all requests, ignoring `pathMatch` and `queryMatch`.

3. **Link Map Key Extraction**:
   - Extracts keys from the request path after matching the rule source.

4. **Rule Processing**:
   - Malformed rules are skipped during processing.
   - Rules marked as `isBlocked` are excluded from matching.
   - Blacklist checks occur after a rule resolves a target, returning `403 Forbidden` if the host is blacklisted.

5. **Validation on Create/Update**:
   - Source and destination length must not exceed **16,384** characters.
   - Regex sources must be compilable with valid capture groups.
   - Placeholders and conditionals must follow specified formats.

## Limits and constraints
- **Character Limits**: Maximum length for both source and destination is **16,384** characters.
- **Capture Groups**: Only capturing groups are counted; non-capturing groups do not contribute to `$N` limits.
- **Destination Requirements**: Must be a non-empty string on create/update for rules without `linkMapId`.
- **Link Map Rules**: Must have `destination` set to `null` and cannot combine with regex sources.
- **Blacklist Checks**: Only absolute URLs are checked against the blacklist; root-relative paths are skipped.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md)
- [Link map concepts](./link-map-concepts.md)
- [Redirect tests guide](../guides/redirect-tests.md)
- [Redirect rules — validation](../guides/redirect-rules-operations.md#validation)
- [Redirect rules — simulate vs live](../guides/redirect-rules-operations.md#simulate-vs-live-redirect)
