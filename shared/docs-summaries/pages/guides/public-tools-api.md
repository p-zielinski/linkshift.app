---
source: shared/docs/pages/guides/public-tools-api.md
generatedAt: 2026-06-07T10:07:08.518Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of the LinkShift platform, explaining the public tools API for QR code generation and redirect tracing.

## What this doc covers
- Overview of public tools and their purposes
- Detailed list of API endpoints for QR code generation and redirect tracing
- Single-hop trace semantics
- Security measures and rate limits
- Dashboard integration for tools
- Documentation MCP (read-only) for AI clients

## Key workflows and rules
1. **QR Code Generation**:
   - Endpoint: `GET /api/v1/public/qr-code`
   - Query parameters: `url`, `format` (PNG, SVG, EPS), `size`, `download` (optional).
   
2. **Redirect Tracing**:
   - Endpoint: `GET /api/v1/public/trace` or `GET /trace`
   - Optional query parameter: `User-Agent`.
   - Each request traces only one HTTP redirect hop.
   - Clients must manage multi-hop tracing by making repeated calls.

3. **Dashboard Access**:
   - After signing in, navigate to **Tools** in the sidebar to access the QR Code Generator and Redirect Tester.

## Limits and constraints
- **SSRF Guard**: Blocks localhost and private IP ranges to prevent probing of internal networks.
- **Hop Limits**: The API does not follow redirect chains in one call; clients must enforce hop limits.
- **Rate Limits** (per client IP per minute):
  - QR Code: 600 requests
  - Trace: 240 requests
  - MCP: 180 requests
- Rate limiting requires Redis; if unavailable, limits may be temporarily skipped.
- Do not publish internal service hostnames; use the public base URL.

## Related docs and API areas
- [Tools in the dashboard](./dashboard/tools-in-dashboard.md) - Access to authenticated tools.
- [Redirect engine — edge cases](../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq) - Information on loops and multi-hop behavior.
- [Overview FAQ](../overview-faq.md) - Common questions regarding trace and QR functionalities.
- [LinkShift docs MCP](./linkshift-mcp.md) - Read-only documentation MCP endpoint and configuration.
- [Getting started](./getting-started.md) - Introduction to the Management API, which is a separate product surface.
