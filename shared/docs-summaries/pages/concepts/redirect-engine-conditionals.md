---
source: shared/docs/pages/concepts/redirect-engine-conditionals.md
generatedAt: 2026-06-07T10:03:28.916Z
model: gpt-4o-mini
---

## Purpose
This document is for developers implementing conditional routing in the LinkShift redirect engine, explaining the syntax, workflows, and rules for creating conditional redirects.

## What this doc covers
- **Conditional routing syntax**: Explanation of ternary expressions and destination resolution order.
- **Live redirect pipeline**: Detailed flow of how requests are processed through the redirect engine.
- **Routing decision flow**: Diagram illustrating the steps taken during a live redirect.
- **Condition operators**: List of operators available for conditions, including examples.
- **Functions in conditions**: Overview of functions that can be used in conditions, with return values and examples.
- **Regex match (`~=`)**: Explanation of regex matching in conditions, including syntax and flags.
- **Nested logic**: How to simulate logical AND using nested ternaries.
- **Limits on nesting**: Maximum nesting levels for conditions and rules.

## Key workflows and rules
1. **Destination Resolution Order**:
   - Matches the request based on path, query, and method.
   - Substitutes regex capture groups and resolves placeholders in the destination string.
   - Parses the top-level ternary expression and evaluates conditions.
   - Processes the chosen branch recursively, with a maximum depth of 32.
   - Treats URLs starting with `http://`, `https://`, or `/` as literal destinations.

2. **Live Redirect Pipeline**:
   - Checks organization redirect rate limit and access.
   - Loads applicable rules and matches the source.
   - Resolves destination based on whether a link map is used or not.
   - Performs domain blacklist checks on absolute URLs.
   - Returns appropriate HTTP status codes based on the evaluation.

3. **Routing Decision Flow**:
   - A flowchart outlines the decision-making process from receiving a request to determining the redirect target.

4. **Condition Operators**:
   - Supports operators like `==`, `!=`, `<`, `>`, `~=` (regex match), and `includes`.
   - Each condition can only have one operator; combine logic using nested ternaries.

5. **Functions in Conditions**:
   - Functions include `time()`, `random(min,max)`, and `datetime('date')`.
   - Invalid function arguments lead to conditions evaluating to false.

6. **Regex Match**:
   - Right-hand side can be a plain pattern or regex with flags.
   - Flags for regex in conditions differ from those in rule sources.

7. **Nested Logic**:
   - Logical AND can be simulated using nested ternaries.
   - Maximum nesting limit is 32 levels.

## Limits and constraints
- **Nesting Limit**: Maximum of 32 levels for nested conditionals; exceeding this limit results in rule skipping.
- **Rate Limits**: Organizations have a redirect limit per minute; exceeding this results in a `429` status code.
- **Access Checks**: Organizations may receive a `402` status code if access is suspended or over plan limits.
- **Invalid Conditions**: Missing or invalid conditions evaluate to false, leading to the false branch being executed.

## Related docs and API areas
- [Redirect engine concepts](./redirect-engine-concepts.md)
- [Variables and modifiers](./redirect-engine-variables.md)
- [Redirect rules — simulate vs live](../guides/redirect-rules-operations.md#simulate-vs-live-redirect)
- [Destination domain blacklist](../concepts/redirect-engine-edge-cases.md#destination-domain-blacklist-runtime)
- [Link map concepts — choosing queryMatch](./link-map-concepts.md#choosing-querymatch--decision-guide)
- [Redirect rules — query matching](../guides/redirect-rules-core.md#query-matching-querymatch)
