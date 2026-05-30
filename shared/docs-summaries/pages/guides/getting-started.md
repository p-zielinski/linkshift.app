---
source: shared/docs/pages/guides/getting-started.md
generatedAt: 2026-05-30T07:01:32.315Z
model: gpt-4o-mini
---

## Purpose
This document is for developers looking to use LinkShift programmatically with organization API keys.

## What this doc covers
- **Authentication**: How to send API keys and the distinction between web app flows and Management API.
- **Create an API key**: Steps to create an API key in the dashboard.
- **API automation checklist**: Sequence for automating routing with the Management API.
- **API key scope and plan behavior**: Details on API key permissions and limitations based on the organization’s plan.
- **Per-key rate limits**: Explanation of rate limits for Management API calls.
- **Redirect rate limits (edge traffic)**: Limits applied to live redirect requests.
- **Routing documentation**: Recommended reading order for understanding LinkShift routing.
- **API surface**: Overview of API endpoints and their corresponding guides.
- **Error model**: Structure of error payloads and common status codes.
- **Quick API example**: Sample API calls for listing redirect rules and simulating requests.

## Key workflows and rules
1. **Create an API key**:
   - Sign in to the dashboard.
   - Navigate to **Organization** → **Manage API keys**.
   - Click **Create API key** and fill in the details.
   - Copy the secret from the reveal dialog.

2. **API automation checklist**:
   - Create an API key in the dashboard.
   - Use `POST /api/v1/domain-groups` to create domain groups.
   - Use `POST /api/v1/subdomains` or `POST /api/v1/domains` to create subdomains or domains.
   - Use `POST /api/v1/redirect-rules` to create redirect rules.
   - Use `POST /api/v1/redirect-rules/simulate` to test redirect rules before rollout.

3. **Error handling**:
   - Handle common status codes such as `401`, `402`, `404`, `409`, and `429`.
   - Validation errors will provide specific messages in the `errors.details` array.

## Limits and constraints
- **API Key Scope**: API keys are scoped to an organization and cannot access user-centric auth endpoints or billing/member-management endpoints.
- **Free Plan Paywall**: Free organizations can create API keys but will receive a `402 Payment Required` for any API-key-authenticated call.
- **Per-key Rate Limits**: Management API calls are rate-limited per API key based on the organization’s plan. Exceeding limits results in a `429 Too Many Requests` response.
- **Redirect Rate Limits**: Live redirect requests are limited by the `redirectionLimitPerMinute` field per organization. Exceeding this limit results in a `429 Too Many Requests` response.

## Related docs and API areas
- **Authentication**: [Account and access](./account-and-access.md)
- **Billing**: [Billing and plans in the dashboard](./billing-and-plans-in-dashboard.md)
- **Public tools API**: [Public tools API](./public-tools-api.md)
- **Domains and Domain Groups**: [Domains and groups](./domains-and-groups.md)
- **Redirect Rules**: [Redirect rules](./redirect-rules.md)
- **Link Maps**: [Link maps](./link-maps.md)
- **Redirect Tests**: [Redirect tests](./redirect-tests.md)
- **API Reference**: [API reference](../reference.md) and `/docs/api/:operationId` pages.
