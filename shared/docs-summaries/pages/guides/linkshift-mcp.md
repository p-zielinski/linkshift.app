---
source: shared/docs/pages/guides/linkshift-mcp.md
generatedAt: 2026-06-04T19:33:31.884Z
model: gpt-4o-mini
---

## Purpose
This document is for developers using the LinkShift Model Context Protocol (MCP) server, explaining its read-only capabilities for accessing documentation and related tools.

## What this doc covers
- Overview of the LinkShift MCP server and its functionalities.
- Details on the available tools:
  - `docs_search_catalog`
  - `docs_get_page`
  - `trace_redirect`
  - `generate_qr_code`
- Endpoint information for accessing the MCP server.
- Rate limits and access requirements.
- Manual configuration for Cursor settings.

## Key workflows and rules
1. **Searching Documentation**:
   - Use the `docs_search_catalog` tool to search the documentation catalog by query parameters such as `catalogId`, user-facing reference, or summary.
   
2. **Loading Documentation**:
   - After obtaining search results, use the `docs_get_page` tool to load the full documentation text for a specific catalog entry.

3. **Tracing Redirects**:
   - Use the `trace_redirect` tool to trace one HTTP redirect hop for a given URL.

4. **Generating QR Codes**:
   - Use the `generate_qr_code` tool to create a QR code for a URL, with output formats available in PNG, SVG, or EPS as base64 JSON.

5. **Manual Configuration for Cursor**:
   - Configure Cursor by adding a server entry under **Cursor Settings → MCP** or in `mcp.json`, pointing the `url` to the MCP endpoint.

## Limits and constraints
- **Rate Limits**:
  - Default limit is **180 requests per minute** per client IP.
  - Rate limiting is enforced per IP on the public tools service and uses Redis for tracking.
  - If the limit is exceeded, a **`429 Too Many Requests`** response is returned.

- **Access Requirements**:
  - The MCP server is public and does not require an API key, bearer token, or dashboard sign-in.
  - Protection is enforced through per-IP rate limits.

## Related docs and API areas
- [Public tools API](./public-tools-api.md) — Contains REST endpoints for QR code generation, redirect tracing, and the documentation assistant.
- [Tools in the dashboard](./dashboard/tools-in-dashboard.md) — Discusses similar trace and QR functionalities available in the signed-in UI.
