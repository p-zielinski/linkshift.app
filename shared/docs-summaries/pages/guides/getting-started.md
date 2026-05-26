---
source: shared/docs/pages/guides/getting-started.md
generatedAt: 2026-05-26T21:10:02.343Z
model: gpt-4o-mini
---

## Purpose
This document is for developers looking to use the LinkShift Public API programmatically with organization API keys.

## What this doc covers
- **Authentication**: How to authenticate using API keys.
- **API key scope and plan behavior**: Details on what API keys can and cannot access.
- **Free plan paywall**: Restrictions for free organizations.
- **Per-key rate limits**: Rate limits based on the organization’s plan.
- **Redirect rate limits (edge traffic)**: Limits applied to live redirect requests.
- **Routing documentation**: Overview of routing concepts and guides.
- **API surface**: List of API endpoints and their corresponding guides.
- **Error model**: Structure of error payloads and common status codes.
- **Quick API example**: Sample API calls for listing redirect rules and simulating requests.

## Key workflows and rules
1. **Authentication**: Include the API key in the header as `X-API-Key: <your_api_key>`.
2. **API Key Management**: API keys are scoped to organizations and cannot access user-centric or billing endpoints.
3. **Rate Limiting**:
   - For free plans, any API call returns `402 Payment Required`.
   - Paid plans have per-key limits; handle `429 Too Many Requests` with backoff.
4. **Redirect Rate Limits**:
   - Limits are based on `redirectionLimitPerMinute` per organization.
   - Exceeding limits results in `429 Too Many Requests`.
5. **Simulate Requests**: Use `POST /api/v1/redirect-rules/simulate` to test redirects without consuming rate limits.

## Limits and constraints
- **API Key Scope**: API keys can manage domains, domain groups, redirect rules, link maps, and tests but cannot access `/api/v1/api-keys`.
- **Free Plan Restrictions**: Free organizations can create API keys but are limited by a paywall.
- **Rate Limits**:
  - Management API calls are limited per API key based on the organization’s plan.
  - Redirect traffic is limited by `redirectionLimitPerMinute`.
- **Error Codes**:
  - `401`: Invalid or missing API key.
  - `402`: Free plan or subscription restriction.
  - `429`: Rate limit exceeded.

## Related docs and API areas
- **Authentication**: [Authentication Guide](#)
- **Redirect Rules**: [Redirect rules](./redirect-rules.md)
- **Link Maps**: [Link maps](./link-maps.md)
- **Redirect Tests**: [Redirect tests](./redirect-tests.md)
- **API Reference**: [API reference](../reference.md)
- **Error Handling**: [Error model](#)
