---
source: shared/docs/pages/guides/public-tools-api.md
generatedAt: 2026-06-04T19:33:42.991Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of the LinkShift platform, explaining the functionality and usage of the Public Tools API for QR code generation and redirect tracing.

## What this doc covers
- Overview of the Public Tools API and its purpose.
- Description of available tools: QR code generation and redirect tracing.
- Detailed endpoints for the Public Tools API:
  - `GET /api/v1/public/qr-code`
  - `GET /api/v1/public/trace`
  - `GET /trace`
  - `POST /api/v1/public/mcp`
- Single-hop trace semantics and behavior.
- Security measures and rate limits for the API.
- Accessing tools via the dashboard.
- Marketing URLs for public access to tools.
- Documentation MCP for AI clients.

## Key workflows and rules
1. **QR Code Generation**:
   - Use `GET /api/v1/public/qr-code` with query parameters for `url`, `format`, `size`, and an optional `download` flag to generate a QR code image.
   
2. **Redirect Tracing**:
   - Use `GET /api/v1/public/trace` or `GET /trace` to trace a single redirect hop for a specified URL, with an optional `User-Agent` header.
   - Each request returns only one hop; the client must handle subsequent hops if needed.

3. **Dashboard Access**:
   - After signing in, navigate to **Tools** in the sidebar to access the QR Code Generator or Redirect Tester, which function similarly to the public endpoints.

4. **Documentation MCP Access**:
   - AI clients can use the `POST /api/v1/public/mcp` endpoint for read-only access to documentation pages, trace, and QR generation.

## Limits and constraints
- **Rate Limits** (per client IP per minute):
  - QR Code Generation: 600 requests
  - Redirect Trace: 240 requests
  - MCP: 180 requests
- **SSRF Guard**: Blocks requests to localhost and private IP ranges to prevent probing of internal networks.
- **Hop Limits**: The API does not follow redirect chains in one call; the client must enforce hop limits and loop detection.
- **Caching**: Trace responses use `Cache-Control: no-store`, while QR responses may use `Cache-Control: public, max-age=300`.

## Related docs and API areas
- [Tools in the dashboard](./dashboard/tools-in-dashboard.md) - Access to authenticated tools.
- [Redirect engine — edge cases](../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq) - Information on loops and multi-hop behavior.
- [Overview FAQ](../overview-faq.md) - Common questions regarding trace and QR functionalities.
- [LinkShift docs MCP](./linkshift-mcp.md) - Details on the read-only docs MCP endpoint and configuration.
- [Getting started](./getting-started.md) - Introduction to the Management API, which is a separate product surface.
