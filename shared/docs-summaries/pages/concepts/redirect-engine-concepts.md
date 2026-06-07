---
source: shared/docs/pages/concepts/redirect-engine-concepts.md
generatedAt: 2026-06-07T10:03:20.519Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and engineers working with the LinkShift redirect engine, explaining its core concepts including placeholders, modifiers, conditional logic, and edge cases.

## What this doc covers
- **Engine concept guides**
  - [Variables and modifiers](./redirect-engine-variables.md): Discusses request variables, modifiers, `{time()}`, `{random()}`, escaping, and handling missing placeholders.
  - [Conditional routing](./redirect-engine-conditionals.md): Covers ternary syntax, operators, the live pipeline, routing decision diagrams, and the queryMatch choice.
  - [Regex, link maps, and edge cases](./redirect-engine-edge-cases.md): Explains regex and wildcard sources, link map key extraction, runtime edge cases, validation summaries, quick references, and advanced FAQs.

## Key workflows and rules
- **Rule Configuration**: For detailed guidance on configuring rules, refer to the [Redirect rules guide](../guides/redirect-rules.md).
- **Conditional Logic**: Utilize ternary syntax and operators to create dynamic routing decisions based on request parameters.
- **Link Map Integration**: Understand how to extract keys from link maps and handle various edge cases that may arise during runtime.

## Limits and constraints
- The document does not specify explicit quotas or field limits but emphasizes the importance of understanding the behavior of placeholders and modifiers to avoid runtime errors.
- Authentication requirements are not detailed in this source.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md): Essential for rule configuration and matching modes.
- [Link map concepts](./link-map-concepts.md): Provides additional context on link maps relevant to the redirect engine.
- [FAQ and troubleshooting](../guides/faq.md): Offers an index of common questions and troubleshooting tips related to the redirect engine.
