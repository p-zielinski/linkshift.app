---
source: shared/docs/pages/concepts/redirect-engine-conditionals.md
generatedAt: 2026-05-28T15:48:29.365Z
model: gpt-4o-mini
---

## Purpose
This document is for developers implementing conditional routing in the LinkShift redirect engine, explaining the syntax, workflows, and rules for creating redirect conditions.

## What this doc covers
- **Conditional routing syntax**: Explanation of ternary expressions for destination resolution.
- **Destination resolution order**: Steps for resolving destinations within a rule.
- **Live redirect pipeline**: Overview of the end-to-end process for handling redirects.
- **Routing decision flow**: Diagram illustrating the redirect process.
- **Condition operators**: List of operators available for conditions.
- **Functions in conditions**: Functions that can be used within conditions.
- **Regex match (`~=`)**: Details on using regex for matching conditions.
- **Nested logic**: Guidelines for simulating logical AND with nested ternaries.
- **Nesting limit**: Maximum levels of nesting allowed in conditions.

## Key workflows and rules
1. **Destination Resolution Order**:
   - Match the request based on path, query, and method.
   - Substitute regex capture groups and resolve placeholders in the destination string.
   - Parse the top-level ternary and evaluate conditions.
   - Process the chosen branch recursively, with a maximum depth of 32.

2. **Live Redirect Pipeline**:
   - Check organization redirect rate limits and access.
   - Load applicable rules and evaluate each for a match.
   - Resolve destination based on whether a link map ID is set.
   - Perform domain blacklist checks for absolute URLs.
   - Return appropriate HTTP status codes based on the evaluation.

3. **Condition Evaluation**:
   - Each condition can only contain one operator.
   - If no operator is found, the condition evaluates to false.
   - Invalid conditions or functions yield false results.

## Limits and constraints
- **Nesting Limit**: Maximum of 32 nested ternaries is allowed; exceeding this results in a skipped rule.
- **Rate Limits**: Organizations have a redirect limit per minute; exceeding this results in a `429` status.
- **Access Checks**: Organizations may be suspended or exceed limits, resulting in a `402` status.
- **Dynamic Values**: Avoid using dynamic values that can inject `?` or `:` into placeholders, as this may cause parsing errors.

## Related docs and API areas
- [Redirect engine concepts](./redirect-engine-concepts.md)
- [Variables and modifiers](./redirect-engine-variables.md)
- [Redirect rules — simulate vs live](../guides/redirect-rules-operations.md#simulate-vs-live-redirect)
- [Link map concepts — choosing queryMatch](./link-map-concepts.md#choosing-querymatch--decision-guide)
- [Redirect rules — query matching](../guides/redirect-rules-core.md#query-matching-querymatch)
