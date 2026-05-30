---
source: shared/docs/pages/concepts/redirect-engine-concepts.md
generatedAt: 2026-05-30T06:58:49.939Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and engineers working with the LinkShift redirect engine, explaining its core concepts, including placeholders, modifiers, conditional logic, and edge cases.

## What this doc covers
- **Engine concept guides**
  - [Variables and modifiers](./redirect-engine-variables.md): Discusses request variables, modifiers, `{time()}`, `{random()}`, escaping, and handling missing placeholders.
  - [Conditional routing](./redirect-engine-conditionals.md): Covers ternary syntax, operators, live pipeline, routing decision diagrams, and queryMatch choices.
  - [Regex, link maps, and edge cases](./redirect-engine-edge-cases.md): Explores regex and wildcard sources, link map key extraction, runtime edge cases, validation summaries, quick references, and advanced FAQs.

## Key workflows and rules
- **Variables and Modifiers**: 
  - Use request variables and modifiers to manipulate incoming requests.
  - Implement `{time()}` and `{random()}` functions for dynamic content generation.
  - Ensure proper escaping of characters to avoid syntax errors.
  - Handle missing placeholders gracefully to prevent runtime errors.

- **Conditional Routing**:
  - Utilize ternary syntax for conditional logic in routing decisions.
  - Apply operators to evaluate conditions and determine routing paths.
  - Follow the routing decision diagram for visual guidance on routing logic.
  - Use queryMatch choices to refine routing based on query parameters.

- **Regex and Link Maps**:
  - Implement regex and wildcard sources for flexible matching.
  - Extract keys from link maps to facilitate dynamic routing.
  - Be aware of runtime edge cases that may affect routing outcomes.
  - Refer to the validation summary for rules on input formats and expected behaviors.

## Limits and constraints
- The document does not specify explicit quotas or field limits.
- Authentication requirements are not detailed within this source.
- Be cautious of edge cases that may arise during runtime, particularly when using regex and link maps.

## Related docs and API areas
- [Redirect rules guide](../guides/redirect-rules.md): For detailed information on rule configuration and matching modes.
- [Link map concepts](./link-map-concepts.md): For understanding link map integration and usage.
- [FAQ and troubleshooting](../guides/faq.md): For an overview of frequently asked questions and troubleshooting tips.
- [Advanced engineering FAQ](./redirect-engine-edge-cases.md#advanced-engineering-faq): For deeper insights into complex scenarios and solutions.
