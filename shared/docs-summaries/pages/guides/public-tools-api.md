---
source: shared/docs/pages/guides/public-tools-api.md
generatedAt: 2026-06-03T16:59:30.399Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of the LinkShift platform, explaining the public tools API for QR code generation and redirect tracing.

## What this doc covers
- Overview of the public tools and their purposes
- Endpoints for QR code generation and redirect tracing
- Single-hop trace semantics
- Security measures and limits for API usage
- Accessing tools in the dashboard and marketing URLs

## Key workflows and rules
1. **QR Code Generation**:
   - Use the endpoint `GET /api/v1/public/qr-code` with query parameters for:
     - `url`: The destination URL for the QR code.
     - `format`: Desired image format (PNG, SVG, EPS).
     - `size`: Optional size for the QR code.
     - `download`: Optional parameter to trigger a download.
   
2. **Redirect Tracing**:
   - Use the endpoint `GET /api/v1/public/trace` or its alias `GET /trace` to trace a single redirect hop for a URL.
   - Optionally include a `User-Agent` in the request.
   - Each request returns only one hop; the client must manage subsequent hops.

3. **Dashboard Access**:
   - After signing in, navigate to **Tools** → `/tools` to access the QR Code Generator or Redirect Tester, which function similarly to the public endpoints.

## Limits and constraints
- **SSRF Guard**: Blocks requests to localhost and private IP ranges to prevent internal network probing.
- **Hop Limits**: The API does not follow redirect chains; the client must enforce hop limits and loop detection.
- **Rate Limits**:
  - QR Code Generation: 600 requests per IP per minute (configurable).
  - Redirect Trace: 240 requests per IP per minute (configurable).
- Rate limiting requires Redis; if Redis is unavailable, limits may be temporarily skipped.
- Do not publish internal service hostnames; use the public base URL.

## Related docs and API areas
- [Tools in the dashboard](./dashboard/tools-in-dashboard.md) — for authenticated access to tools.
- [Redirect engine — edge cases](../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq) — for advanced behavior regarding loops and multi-hop tracing.
- [Overview FAQ](../overview-faq.md) — for common questions about trace and QR functionalities.
- [Getting started](./getting-started.md) — for information on the Management API, which is a separate product surface.
