---
source: shared/docs/pages/guides/redirect-rules.md
generatedAt: 2026-05-28T15:50:33.041Z
model: gpt-4o-mini
---

## Purpose
This document is for developers using LinkShift, explaining how to implement and manage redirect rules for routing requests.

## What this doc covers
- **Redirect rules guides**
  - [Matching and destinations](./redirect-rules-core.md): Overview of routing mechanics, including rate limits, caching, rule fields, source types, `pathMatch`, `queryMatch`, `matchMethod`, priority, and both static and dynamic destinations.
  - [Link maps and redirect rules](./redirect-rules-link-maps.md): Details on `linkMapId`, two-layer query matching, handling lookup misses, and validation processes.
  - [Validation, simulate, and analytics](./redirect-rules-operations.md): Instructions for creating/updating validation, using `POST …/simulate`, and accessing analytics.
  - [Recipes and anti-patterns](./redirect-rules-recipes.md): A cookbook of how-to guides, recipe examples, and common anti-patterns to avoid.

## Key workflows and rules
- **Creating Redirect Rules**: Follow the guidelines in the [Matching and destinations](./redirect-rules-core.md) section to define when a request should be redirected and to where.
- **Simulating Redirects**: Use the `POST /api/v1/redirect-rules/simulate` endpoint to test redirect rules before deploying them.
- **Analytics**: Access analytics features to monitor the performance and effectiveness of redirect rules as outlined in the [Validation, simulate, and analytics](./redirect-rules-operations.md) section.

## Limits and constraints
- Rate limits and caching behaviors are discussed in the [Matching and destinations](./redirect-rules-core.md) guide.
- Specific validation rules and constraints for creating and updating redirect rules are detailed in the [Validation, simulate, and analytics](./redirect-rules-operations.md) section.

## Related docs and API areas
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md): For foundational concepts related to the redirect engine.
- [Link maps](./link-maps.md): Related to managing link maps in conjunction with redirect rules.
- [Redirect tests](./redirect-tests.md): For testing redirect rules.
- [Getting started](./getting-started.md): Initial setup and configuration guidance.
