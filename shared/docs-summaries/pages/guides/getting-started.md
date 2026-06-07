---
source: shared/docs/pages/guides/getting-started.md
generatedAt: 2026-06-07T10:06:32.922Z
model: gpt-4o-mini
---

## Purpose
This document is for developers looking to use the LinkShift Management API with an organization API key to automate the creation of domain groups, rules, and link maps.

## What this doc covers
- **Authentication**: How to authenticate using an API key.
- **Create an API key**: Steps to create an API key in the dashboard.
- **API automation checklist**: A sequence for automating routing with the Management API.
- **API key scope and plan behavior**: Details on API key permissions and limitations based on subscription plans.
- **Limits and constraints**: Rate limits and paywall information for API usage.
- **Routing documentation**: Links to guides on redirect rules and engine concepts.
- **API surface**: Overview of API endpoints and their corresponding guides.
- **Error model**: Explanation of error payloads and common status codes.
- **Quick API example**: Sample API calls for listing redirect rules and simulating requests.

## Key workflows and rules
1. **Create an API key**:
   - Sign in to the dashboard.
   - Navigate to **Organization** → **Manage API keys** → **Create API key**.
   - Set **Key name** and optional expiration settings.
   - Copy the secret from the reveal dialog.

2. **API automation checklist**:
   - Create an API key in the dashboard.
   - Create a domain group using `POST /api/v1/domain-groups`.
   - Add a subdomain or custom domain using `POST /api/v1/subdomains` or `POST /api/v1/domains`.
   - Create a redirect rule using `POST /api/v1/redirect-rules`.
   - Simulate the redirect rule before rollout using `POST /api/v1/redirect-rules/simulate`.

## Limits and constraints
- **API key scope**: API keys are scoped to an organization and cannot access user-centric auth endpoints or billing/member-management endpoints.
- **Free plan paywall**: All Management API calls return `402 Payment Required` on the Free plan. Users must upgrade to a paid plan to automate resources.
- **Rate limits**: 
  - Free plan: Blocked by paywall (`402`) before rate limits apply.
  - Paid plans: Rate limits are per API key and vary by subscription tier. Exceeding limits results in `429 Too Many Requests`.
- **Redirect rate limits**: Applied to live redirect requests, not Management API calls. Simulate and redirect-test fixtures do not consume this limit.

## Related docs and API areas
- **Authentication and access**: [Account and access](./account-and-access.md)
- **Billing and plans**: [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md)
- **Public tools API**: [Public tools API](./public-tools-api.md)
- **Redirect rules**: [Redirect rules](./redirect-rules.md)
- **Domains and domain groups**: [Domains and groups](./domains-and-groups.md)
- **API reference**: [API reference](../reference.md)
- **Error handling**: [FAQ and troubleshooting](./faq.md) and [troubleshooting matrix](../overview-faq.md#troubleshooting-matrix-live-redirects)
