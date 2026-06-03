---
source: shared/docs/pages/concepts/redirect-engine-conditionals.md
generatedAt: 2026-06-03T16:56:38.026Z
model: gpt-4o-mini
---

## Purpose
This document is for developers implementing conditional routing in the LinkShift redirect engine, explaining the syntax, workflows, and rules for creating conditional redirects.

## What this doc covers
- **Conditional routing syntax**: Explanation of ternary expressions for destinations.
- **Destination resolution order**: Steps for resolving the destination string within a rule.
- **Live redirect pipeline**: Detailed flow of how requests are processed through the redirect engine.
- **Routing decision flow**: Diagram illustrating the decision-making process for redirects.
- **Condition operators**: List of operators available for conditions in routing.
- **Functions in conditions**: Functions that can be used within conditions and their expected outputs.
- **Regex match (`~=`)**: Details on how to use regex for matching in conditions.
- **Nested logic**: Explanation of how to simulate logical AND using nested ternaries.
- **Limits on nesting**: Maximum nesting levels for conditions.

## Key workflows and rules
1. **Destination Resolution Order**:
   - Match request against the rule.
   - Substitute regex capture groups in the destination string.
   - Resolve all placeholders in the string.
   - Parse the top-level ternary expression.
   - Evaluate conditions in the chosen branch recursively (max depth of 32).
   - Return the redirect target string.

2. **Live Redirect Pipeline**:
   - Check organization redirect rate limit (returns 429 if exceeded).
   - Verify organization redirect access (returns 402 if suspended).
   - Load applicable rules and match against the request.
   - Resolve destination based on the rule type (link map or standard).
   - Perform domain blacklist checks for absolute URLs (returns 403 if blocked).
   - Execute HTTP redirect with the specified status code or return 404 if no target is found.

3. **Condition Evaluation**:
   - Each condition can only contain one operator.
   - Use nested ternaries for complex logic.
   - Invalid conditions evaluate to false.

## Limits and constraints
- **Nesting Limit**: Maximum of 32 levels of nesting for conditional expressions.
- **Rate Limits**: Organizations are subject to a redirect limit per minute, exceeding which results in a 429 status code.
- **Access Checks**: Organizations may receive a 402 status code if they are suspended or exceed plan limits.
- **Dynamic Values**: Avoid using dynamic values that could introduce `?` or `:` in placeholders before ternary parsing to prevent misinterpretation.
- **Invalid Conditions**: Conditions that are invalid or missing operators will evaluate to false.

## Related docs and API areas
- [Redirect engine concepts](./redirect-engine-concepts.md)
- [Variables and modifiers](./redirect-engine-variables.md)
- [Redirect rules — simulate vs live](../guides/redirect-rules-operations.md#simulate-vs-live-redirect)
- [Destination domain blacklist](../concepts/redirect-engine-edge-cases.md#destination-domain-blacklist-runtime)
- [Link map concepts — choosing queryMatch](./link-map-concepts.md#choosing-querymatch--decision-guide)
- [Redirect rules — query matching](../guides/redirect-rules-core.md#query-matching-querymatch)
