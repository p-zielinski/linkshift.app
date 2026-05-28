---
source: shared/docs/pages/guides/getting-started.md
generatedAt: 2026-05-28T15:49:13.398Z
model: gpt-4o-mini
---

## Purpose
This document is for developers looking to use the LinkShift API programmatically with organization API keys.

## What this doc covers
- **Authentication**: How to send API keys using the `X-API-Key` header.
- **API key scope and plan behavior**: Details on API key permissions and limitations.
- **Free plan paywall**: Information on restrictions for free organizations.
- **Per-key rate limits**: Rate limits based on the organization's plan.
- **Redirect rate limits (edge traffic)**: Limits on live redirect requests.
- **Routing documentation**: A structured guide to understanding LinkShift routing.
- **API surface**: Overview of available API endpoints and their base paths.
- **Error model**: Description of error payloads and common status codes.
- **Quick API example**: Sample API calls for listing redirect rules and simulating requests.

## Key workflows and rules
1. **Authentication**: Include your API key in the header for all requests.
2. **Rate Limiting**:
   - Management API calls are rate-limited per API key.
   - Handle `429 Too Many Requests` with backoff strategies.
3. **Redirect Simulation**: Use `POST /api/v1/redirect-rules/simulate` to test redirects without consuming live traffic limits.
4. **Redirect Rules**: Follow the routing documentation to understand how to set up and manage redirect rules effectively.

## Limits and constraints
- **API Key Scope**: API keys are scoped to an organization and cannot access user-centric auth or billing endpoints.
- **Free Plan Restrictions**: Free plan API calls return `402 Payment Required` if they exceed limits.
- **Rate Limits**:
  - Management API calls are limited based on the organization's plan.
  - Live redirect requests are limited by `redirectionLimitPerMinute` and return `429 Too Many Requests` when exceeded.
- **Error Codes**:
  - `401`: Invalid or missing API key.
  - `402`: Free plan or subscription restriction.
  - `404`: Resource not found.
  - `429`: Rate limit exceeded.

## Related docs and API areas
- **Authentication**: [API Key Authentication](#authentication)
- **Redirect Rules**: [Redirect Rules Guide](./redirect-rules.md)
- **Link Maps**: [Link Maps Guide](./link-maps.md)
- **Redirect Tests**: [Redirect Tests Guide](./redirect-tests.md)
- **Domains and Domain Groups**: [Domains and Groups Guide](./domains-and-groups.md)
- **API Reference**: [API Reference](../reference.md) for interactive documentation.
