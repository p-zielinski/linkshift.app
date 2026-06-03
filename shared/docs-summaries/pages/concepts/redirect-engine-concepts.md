---
source: shared/docs/pages/concepts/redirect-engine-concepts.md
generatedAt: 2026-06-03T16:56:30.043Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and engineers working with the LinkShift redirect engine, explaining its core concepts including placeholders, modifiers, conditional logic, and edge cases.

## What this doc covers
- **Engine concept guides**  
  - [Variables and modifiers](./redirect-engine-variables.md): Discusses request variables, modifiers, `{time()}`, `{random()}`, escaping, and handling missing placeholders.
  - [Conditional routing](./redirect-engine-conditionals.md): Covers ternary syntax, operators, live pipeline, routing decision diagrams, and queryMatch choices.
  - [Regex, link maps, and edge cases](./redirect-engine-edge-cases.md): Explains regex and wildcard sources, link map key extraction, runtime edge cases, validation summaries, quick references, and advanced FAQs.

## Key workflows and rules
- **Rule Configuration**: For detailed guidance on configuring rules, refer to the [Redirect rules guide](../guides/redirect-rules.md).
- **Conditional Logic**: Utilize ternary syntax and operators to create dynamic routing decisions based on request parameters.
- **Link Map Integration**: Understand how to extract keys from link maps and handle various edge cases during runtime.

## Limits and constraints
- The document does not specify explicit limits or constraints regarding quotas, field limits, or authentication requirements.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md)
- [Link map concepts](./link-map-concepts.md)
- [FAQ and troubleshooting](../guides/faq.md) for general inquiries and advanced engineering FAQs related to the redirect engine.
