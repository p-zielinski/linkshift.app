---
source: shared/docs/pages/intro/what-is-linkshift.md
generatedAt: 2026-05-30T07:03:27.074Z
model: gpt-4o-mini
---

## Purpose
This document is for users of LinkShift.app, explaining its functionality as a programmable redirect and link-mapping platform.

## What this doc covers
- **What is LinkShift.app?**
- **Request flow (live redirect)**
- **What you get**
- **How a redirect is decided**
- **Who this documentation is for**
- **Try it yourself**
- **What LinkShift is not**
- **Next steps**

## Key workflows and rules
1. **Incoming Request Handling**:
   - An incoming HTTP request is first subjected to an organization redirect rate limit.
   - Next, an organization access check is performed.
   - If the request matches a `robots.txt` path, the robots policy is served.
   - If not, the rules are sorted by priority (descending), creation date (descending), and ID (descending).
   - The first rule that returns a redirect target is executed.
   - If a link map miss occurs without a fallback destination, the next rule is evaluated.
   - If no rule returns a target, a 404 response is issued.

2. **Redirect Decision Process**:
   - The redirect rules allow for path, query, regex, and wildcard matching, with support for `301`, `302`, `307`, and `308` redirects.
   - Dynamic destinations can utilize placeholders, modifiers, and conditionals.

## Limits and constraints
- **Redirect Simulation**: Up to 100 entries can be simulated using the `POST /redirect-rules/simulate` endpoint.
- **Multi-Tenancy**: API keys and redirect traffic are scoped to an organization.
- **Safety Features**: There is destination scanning on write and ongoing automated monitoring, with a platform blacklist for absolute targets.

## Related docs and API areas
- **Redirect Engine**: [Redirect engine — live pipeline](../concepts/redirect-engine-conditionals.md#live-redirect-pipeline-end-to-end)
- **Redirect Rules**: [Redirect rules — how routing works](../guides/redirect-rules-core.md#how-routing-works)
- **Dashboard Overview**: [Dashboard overview](../guides/dashboard/dashboard-overview.md)
- **Account and Access**: [Account and access](../guides/account-and-access.md)
- **Getting Started**: [Getting started](../guides/getting-started.md)
- **API Reference**: [API reference](../reference.md) and OpenAPI pages under `/docs/api/…`
- **Link Maps**: [Link maps](../guides/link-maps.md)
- **Redirect Tests**: [Redirect tests](../guides/redirect-tests.md) and simulation with `checkDestinationBlacklist`
- **FAQ and Troubleshooting**: [FAQ and troubleshooting](../guides/faq.md)
