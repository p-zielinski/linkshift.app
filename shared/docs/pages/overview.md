# LinkShift API and platform docs

Use this documentation to configure redirect routing, manage domains and link maps, and inspect API contracts from OpenAPI.

This page is the docs **hub** — follow the tutorial steps first, then use the map below when you know what you need.

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

## Tutorial — Your first redirect in 5 minutes

### In the dashboard

1. Sign in and open the dashboard. See [Dashboard overview](./guides/dashboard/dashboard-overview.md) for navigation and limits.
2. Create a **domain group** — [Domain groups in the dashboard](./guides/dashboard/domain-groups-in-dashboard.md).
3. Add a **domain** or subdomain in that group — [Domains and subdomains in the dashboard](./guides/dashboard/domains-and-subdomains-in-dashboard.md).
4. Create a **redirect rule** for `/old-page` → your new URL — [Redirect rules in the dashboard](./guides/dashboard/redirect-rules-in-dashboard.md).
5. Validate with **Run tests** or **Fetch expected result** — [Tests in the dashboard](./guides/dashboard/tests-in-dashboard.md).

Point DNS at LinkShift when you are ready for live traffic.

### Automate instead

1. Authenticate — all API calls use header `X-API-Key: <your_key>`. See [Getting started](./guides/getting-started.md).
2. Create domain group + domain:

```json
POST /api/v1/domain-groups
{ "name": "Production", "robotsPolicy": "NONE" }

POST /api/v1/domains
{ "name": "links.example.com", "domainGroupId": "dmg_xxx" }
```

3. Create redirect rule:

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

4. Verify with simulate:

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

Use this **index** when you know what you need — lookup and deep links, not a step-by-step lesson.

### Start here

| Guide | When to read |
|-------|--------------|
| [What is LinkShift.app?](./intro/what-is-linkshift.md) | Platform purpose, engine capabilities, who each doc is for |
| [Getting started](./guides/getting-started.md) | API keys, auth, plans, errors |
| [Redirect rules](./guides/redirect-rules.md) | **Main routing guide** — index to matching, link maps, simulate, recipes |
| [FAQ and troubleshooting](./guides/faq.md) | Index to overview FAQ, recipes, and engine edge-case FAQ |
| [Overview FAQ](./overview-faq.md) | Common questions and troubleshooting matrix |
| [Domains and domain groups](./guides/domains-and-groups.md) | Domain topology |
| [Account and access](./guides/account-and-access.md) | Sign in, invites, email verification, password reset, legal consent |
| **Invited to a team?** | [Account and access — Accept an invitation](./guides/account-and-access.md#accept-an-invitation) |
| [Billing and plans in the dashboard](./guides/billing-and-plans-in-dashboard.md) | Usage meters, upgrade, Paddle portal, cancel |
| [Public tools API](./guides/public-tools-api.md) | QR and redirect trace (not Management API) |

### Dashboard (authenticated app)

Task guides for the sidebar UI — start at [Dashboard overview](./guides/dashboard/dashboard-overview.md):

| Guide | When to read |
|-------|--------------|
| [Dashboard overview](./guides/dashboard/dashboard-overview.md) | Shell, nav, profile, billing summary, docs assistant |
| [Domain groups](./guides/dashboard/domain-groups-in-dashboard.md) | Create and manage domain groups |
| [Domains and subdomains](./guides/dashboard/domains-and-subdomains-in-dashboard.md) | Custom domains and LinkShift subdomains |
| [Redirect rules](./guides/dashboard/redirect-rules-in-dashboard.md) | Rule wizard, table, redirect tests card |
| [Link maps](./guides/dashboard/link-maps-in-dashboard.md) | Maps, entries, CSV import |
| [Tests](./guides/dashboard/tests-in-dashboard.md) | Redirect test fixtures and **Run tests** |
| [Analytics](./guides/dashboard/analytics-in-dashboard.md) | Traffic chart and rule drill-down |
| [Organization and API keys](./guides/dashboard/organization-and-api-keys-in-dashboard.md) | Members, invites, API keys |
| [Tools](./guides/dashboard/tools-in-dashboard.md) | QR generator and redirect tester (signed in) |

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

Quick answers and a live-redirect symptom matrix: [FAQ index](./guides/faq.md) · [Overview FAQ](./overview-faq.md).

## How this docs section is built

- OpenAPI 3.1 as source of truth for endpoint pages
- Markdown guides for routing concepts and workflows
- Schema tree for request/response inspection
- Built-in Try me with session-level API key persistence
- Guides synced from the published markdown source on each docs deploy
