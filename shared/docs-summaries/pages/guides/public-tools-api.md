---
source: shared/docs/pages/guides/public-tools-api.md
generatedAt: 2026-06-08T20:10:46.724Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of the LinkShift platform, explaining the public tools API for QR code generation and redirect tracing.

## What this doc covers
- Overview of public tools and their purposes.
- Detailed endpoints for the public tools API.
- Single-hop trace semantics.
- Security measures and limits for API usage.
- Dashboard integration for tools.
- Marketing URLs for public access.
- Documentation MCP for AI clients.

## Key workflows and rules
1. **QR Code Generation**:
   - Endpoint: `GET /api/v1/public/qr-code`
   - Query parameters: URL, format (PNG, SVG, EPS), size, optional download.
   
2. **Redirect Trace**:
   - Endpoint: `GET /api/v1/public/trace` or `GET /trace`
   - Optional parameter: User-Agent.
   - Each request returns only one redirect hop.
   - The client must handle multi-hop tracing by making repeated requests.

3. **Dashboard Access**:
   - After signing in, navigate to **Tools** → `/tools` to access the QR Code Generator or Redirect Tester.

4. **Documentation MCP**:
   - AI clients can access documentation via `POST /api/v1/public/mcp` for catalog search, page load, trace, and QR generation.

## Limits and constraints
- **Rate Limits** (per IP per minute):
  - QR Code: 600 requests.
  - Trace: 240 requests.
  - MCP: 180 requests.
- **SSRF Guard**: Blocks localhost and private IP ranges to prevent probing of internal networks.
- **Hop Limits**: The API does not follow redirect chains in one call; clients must enforce hop limits.
- **Caching**:
  - Trace responses: `Cache-Control: no-store`.
  - QR responses: `Cache-Control: public, max-age=300`.
- Rate limiting requires Redis; if unavailable, limits may be temporarily skipped.

## Related docs and API areas
- [Tools in the dashboard](./dashboard/tools-in-dashboard.md) — for authenticated tool access.
- [Redirect engine — edge cases](../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq) — for handling loops and multi-hop behavior.
- [Overview FAQ](../overview-faq.md) — common questions regarding trace and QR functionalities.
- [LinkShift docs MCP](./linkshift-mcp.md) — details on the read-only docs MCP endpoint and configuration.
- [Getting started](./getting-started.md) — information on the Management API, which is a separate product surface.
