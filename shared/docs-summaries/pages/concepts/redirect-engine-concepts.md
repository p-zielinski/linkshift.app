---
source: shared/docs/pages/concepts/redirect-engine-concepts.md
generatedAt: 2026-06-08T20:06:31.291Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and engineers working with the LinkShift redirect engine, providing in-depth explanations of its concepts, including placeholders, modifiers, conditional logic, and edge cases.

## What this doc covers
- **Engine concept guides**
  - **Variables and modifiers**: Discusses request variables, modifiers, `{time()}`, `{random()}`, escaping, and handling missing placeholders.
  - **Conditional routing**: Covers ternary syntax, operators, the live pipeline, routing decision diagrams, and the queryMatch choice.
  - **Regex, link maps, and edge cases**: Explains regex and wildcard sources, link map key extraction, runtime edge cases, validation summaries, quick references, and an advanced FAQ.

## Key workflows and rules
- **Rule Configuration**: For detailed workflows regarding rule configuration and matching modes, refer to the [Redirect rules guide](../guides/redirect-rules.md).
- **Conditional Logic**: The document outlines the use of ternary syntax and operators to implement conditional routing decisions.
- **Link Map Integration**: Integration with link maps is discussed, including how to extract keys and handle edge cases during runtime.

## Limits and constraints
- The document does not specify explicit limits or constraints regarding quotas or field limits. However, it implies that understanding regex and wildcard sources is crucial for avoiding runtime edge cases.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md)
- [Link map concepts](./link-map-concepts.md)
- [FAQ and troubleshooting](../guides/faq.md) for general inquiries and advanced engineering FAQ related to the redirect engine.
