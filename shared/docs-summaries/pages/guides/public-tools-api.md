---
source: shared/docs/pages/guides/public-tools-api.md
generatedAt: 2026-05-30T07:02:01.856Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users who need to understand the public tools API for QR code generation and redirect tracing in LinkShift.

## What this doc covers
- Overview of the public tools API and its purpose
- Details on the available tools: QR code generation and redirect tracing
- List of API endpoints for public tools
- Explanation of single-hop trace semantics
- Security measures and limits for API usage
- Instructions for accessing tools in the dashboard
- Links to related documentation

## Key workflows and rules
1. **QR Code Generation**:
   - Use the endpoint `GET /api/v1/public/qr-code` with query parameters for:
     - `url`: The destination URL for the QR code
     - `format`: The desired image format (PNG, SVG, EPS)
     - `size`: The size of the QR code (optional)
     - `download`: Optional parameter to trigger a download
     
2. **Redirect Tracing**:
   - Use the endpoint `GET /api/v1/public/trace` or its alias `GET /trace` to trace a single redirect hop for a URL.
   - Optionally include a `User-Agent` header.
   - Each request will return only one hop, and the client must manage subsequent hops.

3. **Using the Dashboard**:
   - After signing in, navigate to **Tools** in the sidebar to access the QR Code Generator or Redirect Tester, which function similarly to the public endpoints.

## Limits and constraints
- **No API Key Required**: No authentication is needed to access the public tools API.
- **Rate Limits**:
  - QR Code Generation: 600 requests per IP per minute (configurable)
  - Redirect Trace: 240 requests per IP per minute (configurable)
- **SSRF Guard**: The service blocks localhost and private IP ranges to prevent probing of internal networks.
- **Cache Control**:
  - Trace responses: `Cache-Control: no-store` (no caching)
  - QR responses: `Cache-Control: public, max-age=300` (short public caching)
- **Redis Requirement**: Rate limiting requires Redis; if unavailable, limits may be temporarily skipped.

## Related docs and API areas
- [Tools in the dashboard](./dashboard/tools-in-dashboard.md) — for authenticated access to tools
- [Redirect engine — edge cases](../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq) — for information on loops and multi-hop behavior
- [Overview FAQ](../overview-faq.md) — for common questions regarding trace and QR functionalities
- [Getting started](./getting-started.md) — for information on the Management API, which is a separate product surface
