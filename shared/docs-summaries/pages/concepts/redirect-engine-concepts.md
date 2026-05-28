---
source: shared/docs/pages/concepts/redirect-engine-concepts.md
generatedAt: 2026-05-28T15:48:19.019Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and engineers using the LinkShift redirect engine, explaining its core concepts including placeholders, modifiers, conditional logic, and edge cases.

## What this doc covers
- **Engine concept guides**
  - **Variables and modifiers**: Discusses request variables, modifiers, `{time()}`, `{random()}`, escaping, and handling missing placeholders.
  - **Conditional routing**: Covers ternary syntax, operators, the live pipeline, routing decision diagrams, and the `queryMatch` choice.
  - **Regex, link maps, and edge cases**: Explains regex and wildcard sources, link map key extraction, runtime edge cases, validation summaries, quick references, and advanced FAQs.

## Key workflows and rules
- **Rule Configuration**: For detailed workflows on configuring rules, refer to the [Redirect rules guide](../guides/redirect-rules.md).
- **Conditional Logic**: Utilize ternary syntax and operators to create dynamic routing decisions based on request parameters.
- **Link Map Integration**: Understand how to extract keys from link maps and handle various edge cases during runtime.

## Limits and constraints
- The document does not specify explicit quotas or field limits but emphasizes the importance of understanding edge cases and validation summaries in the context of regex and link maps.
- Users should be aware of potential pitfalls when using modifiers and placeholders, particularly in terms of escaping and handling missing values.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md)
- [Link map concepts](./link-map-concepts.md)
- [Variables and modifiers guide](./redirect-engine-variables.md)
- [Conditional routing guide](./redirect-engine-conditionals.md)
- [Regex and edge cases guide](./redirect-engine-edge-cases.md)
