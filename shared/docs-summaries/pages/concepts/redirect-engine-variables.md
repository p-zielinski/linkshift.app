---
source: shared/docs/pages/concepts/redirect-engine-variables.md
generatedAt: 2026-05-28T15:48:57.908Z
model: gpt-4o-mini
---

## Purpose
This document is for developers using the LinkShift redirect engine, explaining the request variables, modifiers, and function placeholders available for configuring redirects.

## What this doc covers
- **Request variables**: Overview of variables derived from incoming requests.
- **Domain variables**: Placeholders for domain-related information.
- **Path variables**: Placeholders for segments of the request path.
- **Query variables**: Placeholders for query parameters in the request.
- **Request metadata**: Placeholders for metadata like HTTP method and client IP.
- **Modifiers**: How to apply transformations to placeholders.
- **Function placeholders**: Functions available for use in destination strings.
- **Functions in conditions**: Syntax for using functions in conditional statements.
- **Escaping literal braces**: How to include literal braces in destination strings.
- **Missing placeholders**: Behavior when placeholders are missing.

## Key workflows and rules
1. **Using Request Variables**:
   - Placeholders are used in the format `{placeholder}` within destinations and conditions.
   - Domain variables are parsed from the request hostname and include `{domain.fqdn}`, `{domain.label}`, `{domain.root}`, etc.
   - Path variables are derived from the request path, e.g., `{path}`, `{segments.N}`.
   - Query variables are accessed via `{query.paramName}`.

2. **Modifiers**:
   - Modifiers are appended after a colon, e.g., `{query.code:to_upper_case.url_encode}`.
   - They can be chained, and their order matters (left to right).
   - Examples include `to_lower_case`, `url_encode`, and mathematical operations.

3. **Function Placeholders**:
   - Functions like `{time()}` and `{random(min,max)}` can be used in destination strings.
   - In conditions, call functions without curly braces, e.g., `random(0,100) < 30`.

4. **Handling Missing Placeholders**:
   - If a placeholder is missing and has no modifiers, it remains unchanged in the output.
   - If modifiers are present but the value is missing, the raw key name may be passed to modifiers.

## Limits and constraints
- **Domain Variables**: The engine does not treat the registrable apex as `{domain.root}`; it uses the second-to-last label.
- **Single-part Hostnames**: For hostnames like `localhost`, certain placeholders will be empty.
- **Query Parameters**: In `{query.*}` substitution, the last occurrence of a parameter in the query string is used if it appears multiple times.
- **No Generic Placeholders**: There are no `{header.*}` or `{cookie.*}` placeholders; cookie-based routing is not supported.
- **IPv6 Support**: The `{ip}` placeholder can reflect IPv6 addresses, and testing should match production expectations.

## Related docs and API areas
- [Redirect engine concepts](./redirect-engine-concepts.md)
- [Conditionals](./redirect-engine-conditionals.md)
- [Edge cases](./redirect-engine-edge-cases.md)
- [Redirect rules guide](../guides/redirect-rules.md)
- [Simulate before rollout](../guides/redirect-rules-operations.md#simulate-before-rollout)
