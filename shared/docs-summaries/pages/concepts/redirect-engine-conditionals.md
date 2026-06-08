---
source: shared/docs/pages/concepts/redirect-engine-conditionals.md
generatedAt: 2026-06-08T20:06:42.278Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and engineers using the LinkShift redirect engine, explaining the syntax and workflows for conditional routing.

## What this doc covers
- **Conditional routing syntax**: Describes the ternary expression format for destinations.
- **Destination resolution order**: Details the steps for resolving a destination within a rule.
- **Live redirect pipeline**: Outlines the end-to-end process for handling incoming requests.
- **Routing decision flow**: Provides a diagram illustrating the redirect decision-making process.
- **Condition operators**: Lists operators available for conditions in routing.
- **Functions in conditions**: Details functions that can be used within conditions.
- **Regex match (`~=`)**: Explains how to use regex for matching conditions.
- **Nested logic**: Discusses how to simulate logical operations using nested ternaries.
- **Limits on nesting**: Specifies the maximum depth for nested conditionals.

## Key workflows and rules
1. **Destination Resolution Order**:
   - Match the request based on path, query, and method.
   - Substitute regex capture groups and resolve placeholders in the destination string.
   - Parse the top-level ternary expression.
   - Evaluate conditions (e.g., `time()`, `random()`, comparisons).
   - Process the chosen branch recursively, with a maximum depth of 32.
   - Return the redirect target string.

2. **Live Redirect Pipeline**:
   - Incoming requests are checked against organization redirect rate limits and access.
   - Rules are loaded based on priority and creation date, skipping deleted or blocked rules.
   - Each rule is evaluated for a match, and if a link map is used, the corresponding key is resolved.
   - If a valid target is found, an HTTP redirect is issued; otherwise, a 404 response is returned.

3. **Condition Operators**:
   - Each condition can only contain one operator.
   - Use nested ternaries to combine conditions.
   - Invalid or missing conditions evaluate to false.

4. **Functions in Conditions**:
   - Functions like `time()`, `random(min,max)`, and `datetime('date')` can be used for dynamic evaluations.

5. **Regex Matching**:
   - Regex can be used for pattern matching in conditions, with specific rules for flags.

## Limits and constraints
- **Nesting Limit**: Maximum of 32 levels of nesting for conditional expressions.
- **Rate Limits**: Organizations are subject to a redirect limit per minute, exceeding which results in a 429 status code.
- **Access Checks**: Organizations may receive a 402 status code if access is suspended or over plan limits.
- **Invalid Conditions**: Invalid conditions or functions yield false evaluations, and certain invalid inputs (e.g., bad timezone) result in a 400 status code during validation.

## Related docs and API areas
- [Redirect engine concepts](./redirect-engine-concepts.md)
- [Variables and modifiers](./redirect-engine-variables.md)
- [Simulate vs live redirect](../guides/redirect-rules-operations.md#simulate-vs-live-redirect)
- [Destination domain blacklist](../concepts/redirect-engine-edge-cases.md#destination-domain-blacklist-runtime)
- [Link map concepts — choosing queryMatch](./link-map-concepts.md#choosing-querymatch--decision-guide)
- [Redirect rules — query matching](../guides/redirect-rules-core.md#query-matching-querymatch)
