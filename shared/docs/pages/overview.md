# LinkShift API and platform docs

Use this documentation to configure redirect routing, manage domains and link maps, and inspect API contracts from OpenAPI.

**New here?** Read [What is LinkShift.app?](./intro/what-is-linkshift.md) for a business-technical overview of the platform and rules engine.

---

## What LinkShift provides

LinkShift is a redirect management platform. You define **where incoming traffic should go** using redirect rules, optionally backed by link maps for thousands of short keys.

Core capabilities:

- **Domain groups** — organize domains, subdomains, and rules together
- **Redirect rules** — path/query/regex matching, dynamic destinations, conditional routing
- **Link maps** — scalable key → destination tables behind a single prefix rule
- **Simulation and tests** — validate routing before and after deploys
- **Analytics** — see which rules and link map keys get traffic

---

## Your first redirect in 5 minutes

### 1. Authenticate

All API calls use header `X-API-Key: <your_key>`. See [Getting started](./guides/getting-started.md).

### 2. Create domain group + domain

```json
POST /api/v1/domain-groups
{ "name": "Production", "robotsPolicy": "NONE" }

POST /api/v1/domains
{ "name": "links.example.com", "domainGroupId": "dmg_xxx" }
```

### 3. Create redirect rule

Simple path redirect:

```json
POST /api/v1/redirect-rules
{
  "domainGroupId": "dmg_xxx",
  "source": "/old-page",
  "destination": "https://example.com/new-page",
  "statusCode": 301,
  "queryMatch": "ignore"
}
```

### 4. Verify with simulate

```json
POST /api/v1/redirect-rules/simulate
{
  "entries": [
    {
      "domainGroupId": "dmg_xxx",
      "path": "/old-page",
      "hostname": "links.example.com"
    }
  ]
}
```

Expected: `matched: true`, `target: https://example.com/new-page`.

---

## Documentation map

### Start here

| Guide | When to read |
|-------|--------------|
| [What is LinkShift.app?](./intro/what-is-linkshift.md) | Platform purpose, engine capabilities, who each doc is for |
| [Getting started](./guides/getting-started.md) | API keys, auth, plans, errors |
| [Redirect rules](./guides/redirect-rules.md) | **Main routing guide** — index to matching, link maps, simulate, recipes |
| [Overview FAQ](./overview-faq.md) | Common questions and troubleshooting matrix |
| [Domains and domain groups](./guides/domains-and-groups.md) | Domain topology |

### Routing depth

| Guide | When to read |
|-------|--------------|
| [Redirect rules — matching](./guides/redirect-rules-core.md) | `pathMatch`, `queryMatch`, sources, destinations |
| [Redirect rules — link maps](./guides/redirect-rules-link-maps.md) | `linkMapId` on rules |
| [Redirect rules — simulate](./guides/redirect-rules-operations.md) | Validation, simulate, analytics |
| [Redirect rules — recipes](./guides/redirect-rules-recipes.md) | Cookbook and anti-patterns |
| [Redirect engine concepts](./concepts/redirect-engine-concepts.md) | Index to variables, conditionals, edge cases |
| [Engine — conditionals](./concepts/redirect-engine-conditionals.md) | Ternaries, [routing flow diagram](./concepts/redirect-engine-conditionals.md#routing-decision-flow-diagram) |
| [Link maps](./guides/link-maps.md) | Short links at scale |
| [Link map entries](./guides/link-map-entries.md) | Bulk import, key format |
| [Link map concepts](./concepts/link-map-concepts.md) | Normalization, cache, resolution |
| [Redirect tests](./guides/redirect-tests.md) | CI regression testing |

### API reference

| Resource | Description |
|----------|-------------|
| [API reference](./reference.md) | Endpoint index + routing cheat sheet |
| OpenAPI pages (`/docs/api/:operationId`) | Schema trees, Try me |

### Engine cheat sheet

One-page limits and syntax: [Redirect engine concepts — quick reference](./concepts/redirect-engine-edge-cases.md#quick-reference-card).

**Routing decision index** (which `source` / link map / regex to use): [API reference — routing decision index](./reference.md#routing-decision-index).

---

## Common questions and troubleshooting

Quick answers and a live-redirect symptom matrix: [Overview FAQ](./overview-faq.md).

## How this docs section is built

- OpenAPI 3.1 as source of truth for endpoint pages
- Markdown guides for routing concepts and workflows
- Schema tree for request/response inspection
- Built-in Try me with session-level API key persistence
- Guides synced via `npm run docs:sync` from repository root
