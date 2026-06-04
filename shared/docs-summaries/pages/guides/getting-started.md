---
source: shared/docs/pages/guides/getting-started.md
generatedAt: 2026-06-04T19:33:25.996Z
model: gpt-4o-mini
---

## Purpose
This document is for developers looking to use the LinkShift Management API with an organization API key to automate the creation of domain groups, rules, and link maps.

## What this doc covers
- **Authentication**: How to authenticate API calls using an API key.
- **Create an API key**: Steps to create an API key in the dashboard.
- **API automation checklist**: A sequence for automating routing with the Management API.
- **API key scope and plan behavior**: Details on API key permissions and limitations.
- **Limits and constraints**: Information on rate limits and plan restrictions.
- **Routing documentation**: Links to guides on routing behavior and related concepts.
- **API surface**: Overview of API endpoints and their corresponding guides.
- **Error model**: Explanation of error payloads and common status codes.
- **Quick API example**: Sample API calls for listing redirect rules and simulating requests.

## Key workflows and rules
1. **Create an API key**:
   - Sign in to the dashboard.
   - Navigate to **Organization** → **Manage API keys** → **Create API key**.
   - Set **Key name** and optional expiration settings.
   - Copy the secret from the one-time reveal dialog.

2. **API automation checklist**:
   - Create an API key in the dashboard.
   - Create a domain group using `POST /api/v1/domain-groups`.
   - Add a subdomain or custom domain using `POST /api/v1/subdomains` or `POST /api/v1/domains`.
   - Create a redirect rule using `POST /api/v1/redirect-rules`.
   - Run a simulation before rollout using `POST /api/v1/redirect-rules/simulate`.

## Limits and constraints
- **API Key Scope**: API keys are scoped to an organization and can manage redirect resources but cannot access user-centric auth endpoints or billing/member-management endpoints.
- **Free Plan Paywall**: On the **FREE** plan, all Management API calls return `402 Payment Required`. API keys can still be created in the dashboard.
- **Per-Key Rate Limits**: Management API calls are rate-limited per API key based on the organization's plan. Exceeding the limit results in a `429 Too Many Requests` error.
- **Redirect Rate Limits**: Applied to live redirect requests, not Management API calls. Simulations and redirect-test fixtures do not consume this limit.

## Related docs and API areas
- [Account and access](./account-and-access.md)
- [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md)
- [Redirect rules](./redirect-rules.md)
- [Domains and domain groups](./domains-and-groups.md)
- [Link maps](./link-maps.md)
- [Redirect tests](./redirect-tests.md)
- [API reference](../reference.md) for detailed endpoint information.
