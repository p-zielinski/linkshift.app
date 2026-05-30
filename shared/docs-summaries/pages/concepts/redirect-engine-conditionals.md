---
source: shared/docs/pages/concepts/redirect-engine-conditionals.md
generatedAt: 2026-05-30T06:58:57.647Z
model: gpt-4o-mini
---

## Purpose
This document is for developers working with the LinkShift redirect engine, explaining the syntax and mechanics of conditional routing.

## What this doc covers
- **Conditional routing syntax**: Describes the ternary expression format for destinations.
- **Destination resolution order**: Details the steps for resolving destinations within a rule.
- **Live redirect pipeline**: Outlines the end-to-end process for handling incoming requests and applying redirect rules.
- **Routing decision flow**: Provides a flowchart for the live redirect process.
- **Condition operators**: Lists operators available for conditions in routing rules.
- **Functions in conditions**: Describes functions that can be used within conditions.
- **Regex match (`~=`)**: Explains how to use regex for matching conditions.
- **Nested logic**: Details how to simulate logical AND with nested ternaries.
- **Parentheses and URL colons**: Clarifies how the parser treats colons in URLs.
- **Nesting limit**: States the maximum depth for nested conditionals.

## Key workflows and rules
1. **Destination Resolution Order**:
   - Match the request based on path, query, and method.
   - Substitute regex capture groups in the destination string.
   - Resolve all placeholders in the string.
   - Parse the top-level ternary expression.
   - Evaluate each condition and process the chosen branch recursively (max depth of 32).
   - Return the redirect target string.

2. **Live Redirect Pipeline**:
   - Check organization redirect rate limit; return 429 if exceeded.
   - Verify organization redirect access; return 402 if suspended or over limits.
   - Handle requests to `/robots.txt` separately.
   - Load applicable rules and evaluate them in order.
   - If a rule matches, resolve the destination and check for domain blacklist.
   - Return appropriate HTTP status codes based on the evaluation.

3. **Simulate Redirects**:
   - Use `POST /api/v1/redirect-rules/simulate` to test rules without enforcing rate limits.
   - Enable domain blacklist checks with `checkDestinationBlacklist: true`.

## Limits and constraints
- **Nesting Limit**: Maximum of 32 nested conditionals is allowed; exceeding this results in a skipped rule.
- **Rate Limits**: Organizations are subject to a redirect limit per minute; exceeding this results in a 429 status code.
- **Access Checks**: Organizations may be suspended or over plan limits, resulting in a 402 status code.
- **Invalid Conditions**: If a condition is missing an operator or has invalid syntax, it evaluates to false.
- **Dynamic Values**: Avoid using dynamic values that could introduce `?` or `:` in placeholders before ternary parsing.

## Related docs and API areas
- [Redirect engine concepts](./redirect-engine-concepts.md)
- [Variables and modifiers](./redirect-engine-variables.md)
- [Redirect rules — simulate vs live](../guides/redirect-rules-operations.md#simulate-vs-live-redirect)
- [Destination domain blacklist](../concepts/redirect-engine-edge-cases.md#destination-domain-blacklist-runtime)
- [Link map concepts — choosing queryMatch](./link-map-concepts.md#choosing-querymatch--decision-guide)
- [Redirect rules — query matching](../guides/redirect-rules-core.md#query-matching-querymatch)
