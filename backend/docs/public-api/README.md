# LinkShift Public API Guide

This guide explains how to use LinkShift programmatically with organization API keys.

## Authentication

Send your API key in one of the following ways:

1. Recommended header:

```http
X-API-Key: <your_api_key>
```

2. Alternative header format (also accepted by backend):

```http
Authorization: ApiKey <your_api_key>
```

## API Key Scope and Plan Behavior

- API keys are scoped to an **organization**, not a single user.
- API keys can manage redirect resources (domains, domain groups, redirect rules, link maps, link map entries, redirect tests).
- API keys cannot access:
  - `/api/v1/api-keys` (key lifecycle is dashboard/user-auth only)
  - user-centric auth endpoints
  - billing and member-management endpoints

### Free Plan Paywall

- Free organizations may still create/manage API keys in dashboard.
- Any API-key-authenticated call on Free plan returns `402 Payment Required`.

### Per-Key Rate Limits

Rate limits are enforced **per API key**:

- Free: blocked by paywall before usage
- Basic: `10 requests/minute/key`
- Pro: `50 requests/minute/key`

This is separate from redirect runtime rate limiting used by public redirect traffic.

## API Surface

- [Domains and Domain Groups](./domains-and-groups.md)
- [Redirect Rules](./redirect-rules.md)
- [Link Maps](./link-maps.md)
- [Link Map Entries](./link-map-entries.md)
- [Redirect Tests](./redirect-tests.md)

## OpenAPI Specification

Use the strict OpenAPI file:

- `backend/docs/openapi/linkshift-api-keys.openapi.yaml`

## Error Model

Error payloads are normalized and include:

- `code`: HTTP-like numeric code
- `key`: machine-readable key (for example `payment_required`)
- `message`: short message
- `details`: human-readable explanation (when available)
- `requestId`: request correlation ID

Common status codes:

- `401` invalid/missing API key
- `402` free plan or subscription restrictions for API usage
- `404` not found / out-of-scope resource
- `409` conflict (for example duplicate domain)
- `429` per-key rate limit exceeded
