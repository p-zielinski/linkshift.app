---
source: shared/docs/pages/guides/getting-started.md
generatedAt: 2026-06-08T20:09:53.792Z
model: gpt-4o-mini
---

## Purpose
This document is for developers looking to use the LinkShift Management API with an organization API key to automate the creation of domain groups, rules, and link maps.

## What this doc covers
- **Authentication**: How to authenticate API calls using an API key.
- **Create an API key**: Steps to create an API key in the dashboard.
- **API automation checklist**: A sequence for automating routing with the Management API.
- **API key scope and plan behavior**: Details on the scope of API keys and limitations based on subscription plans.
- **Limits and constraints**: Information on rate limits and restrictions for API keys.
- **Routing documentation**: Links to guides for routing behavior and related concepts.
- **API surface**: Overview of API endpoints and their respective guides.
- **Error model**: Description of error payloads and common status codes.
- **Quick API example**: Sample API calls for listing redirect rules and simulating requests.

## Key workflows and rules
1. **Create an API Key**:
   - Sign in to the dashboard.
   - Navigate to **Organization** → **Manage API keys** → **Create API key**.
   - Set **Key name** and optional expiration settings.
   - Copy the secret from the reveal dialog.

2. **API Automation Checklist**:
   - Create an API key in the dashboard.
   - Create a domain group using `POST /api/v1/domain-groups`.
   - Add a subdomain or custom domain using `POST /api/v1/subdomains` or `POST /api/v1/domains`.
   - Create a redirect rule using `POST /api/v1/redirect-rules`.
   - Simulate the redirect rule before rollout using `POST /api/v1/redirect-rules/simulate`.

## Limits and constraints
- **API Key Scope**: API keys are scoped to an organization and cannot access user-centric auth endpoints or billing/member-management endpoints.
- **Free Plan Paywall**: API calls on the FREE plan return `402 Payment Required` until upgraded.
- **Per-Key Rate Limits**: Rate limits apply per API key based on the organization's plan. Exceeding limits results in `429 Too Many Requests`.
- **Redirect Rate Limits**: Applied to live redirect requests, not Management API calls. Simulations do not consume this limit.

## Related docs and API areas
- **Authentication and Access**: [Account and access](./account-and-access.md)
- **Billing and Plans**: [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md)
- **Public Tools API**: [Public tools API](./public-tools-api.md)
- **Redirect Rules**: [Redirect rules](./redirect-rules.md)
- **Domains and Domain Groups**: [Domains and groups](./domains-and-groups.md)
- **API Reference**: [API reference](../reference.md)
- **Error Handling**: [FAQ and troubleshooting](./faq.md) and [troubleshooting matrix](../overview-faq.md#troubleshooting-matrix-live-redirects)
