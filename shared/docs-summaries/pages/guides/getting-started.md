---
source: shared/docs/pages/guides/getting-started.md
generatedAt: 2026-06-03T16:59:04.306Z
model: gpt-4o-mini
---

## Purpose
This document is for developers looking to use the LinkShift Management API with an organization API key to automate the creation of domain groups, rules, and link maps.

## What this doc covers
- **Authentication**: How to authenticate using an API key.
- **Create an API key**: Steps to create an API key in the dashboard.
- **API automation checklist**: Sequence of steps for automating routing with the Management API.
- **API key scope and plan behavior**: Details on API key permissions and limitations based on subscription plans.
- **Redirect rate limits**: Information on rate limits for live redirect requests.
- **Routing documentation**: Links to additional guides for routing behavior.
- **API surface**: Overview of available API endpoints and their corresponding guides.
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

3. **Error Handling**:
   - Handle `429 Too Many Requests` by implementing backoff strategies.
   - Validate rules and check for specific error messages in the response.

## Limits and constraints
- **API Key Scope**: API keys are scoped to an organization and cannot access user-centric auth endpoints or billing/member-management endpoints.
- **Free Plan Paywall**: On the **FREE** plan, all Management API calls return `402 Payment Required` until upgraded.
- **Rate Limits**:
  - **Free Plan**: Blocked by paywall (`402`) before rate limits apply.
  - **Paid Plans**: Rate limits are per API key and vary by plan. Check usage with `GET /api/v1/organization/usage`.
- **Redirect Rate Limits**: Applied to live redirect requests, not Management API calls. Simulations do not consume this limit.

## Related docs and API areas
- **Authentication and Access**: [Account and access](./account-and-access.md)
- **Billing and Plans**: [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md)
- **Domain Groups**: [Domains and domain groups](./domains-and-groups.md)
- **Redirect Rules**: [Redirect rules](./redirect-rules.md)
- **API Reference**: [API reference](../reference.md)
- **Error Handling**: [FAQ and troubleshooting](./faq.md) and [troubleshooting matrix](../overview-faq.md#troubleshooting-matrix-live-redirects)
