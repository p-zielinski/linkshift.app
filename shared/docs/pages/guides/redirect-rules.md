# Redirect rules — routing guide

Redirect rules are the core of LinkShift routing. Each rule answers one question: **when a request looks like this, where should it go?**

Use the guides below for matching, link maps, testing, and recipes. For placeholder syntax, conditional operators, and engine limits, see [Redirect engine concepts](../concepts/redirect-engine-concepts.md).

Base path: `/api/v1/redirect-rules`

---

## Redirect rules guides

| Guide | Topics |
|-------|--------|
| [Matching and destinations](./redirect-rules-core.md) | How routing works, rate limits, caching, rule fields, source types, `pathMatch`, `queryMatch`, `matchMethod`, priority, static and dynamic destinations |
| [Link maps and redirect rules](./redirect-rules-link-maps.md) | `linkMapId`, two-layer query matching, lookup misses, validation |
| [Validation, simulate, and analytics](./redirect-rules-operations.md) | Create/update validation, `POST …/simulate`, analytics |
| [Recipes and anti-patterns](./redirect-rules-recipes.md) | How-To cookbook, recipe book, anti-patterns, API endpoints |
| [FAQ and troubleshooting](./faq.md) | Index to overview FAQ, recipes, engine edge-case FAQ |

Related: [Redirect engine concepts](../concepts/redirect-engine-concepts.md) · [Link maps](./link-maps.md) · [Redirect tests](./redirect-tests.md) · [Getting started](./getting-started.md)
