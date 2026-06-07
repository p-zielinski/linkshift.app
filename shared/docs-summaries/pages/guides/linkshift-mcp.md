---
source: shared/docs/pages/guides/linkshift-mcp.md
generatedAt: 2026-06-07T10:07:00.724Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and users of AI clients who need to understand how to utilize the LinkShift Model Context Protocol (MCP) server for accessing documentation.

## What this doc covers
- Overview of the LinkShift MCP server and its functionalities.
- Description of available tools: `docs_search_catalog`, `docs_get_page`, `trace_redirect`, and `generate_qr_code`.
- Endpoint details for accessing the MCP server.
- Rate limits applicable to the MCP server.
- Access requirements for using the MCP server.
- Manual configuration for Cursor settings to connect to the MCP server.
- Links to related documentation.

## Key workflows and rules
1. **Searching Documentation:**
   - Use the `docs_search_catalog` tool to search the documentation catalog by query parameters such as `catalogId`, user-facing reference, or summary.
   
2. **Loading Documentation Pages:**
   - After obtaining search results, use the `docs_get_page` tool to load the full documentation text for a specific catalog entry.

3. **Tracing Redirects:**
   - Use the `trace_redirect` tool to trace one HTTP redirect hop for a given URL.

4. **Generating QR Codes:**
   - Use the `generate_qr_code` tool to create a QR code for a URL, which can be returned in PNG, SVG, or EPS formats as base64 JSON.

5. **Manual Configuration for Cursor:**
   - Add a server entry under **Cursor Settings → MCP** or in `mcp.json` to point to the MCP endpoint.

## Limits and constraints
- **Rate Limits:**
  - The default limit is **180 requests per minute** per client IP.
  - Rate limiting is enforced per IP and uses Redis for tracking. If Redis is unavailable, limits may be temporarily skipped.
  - Exceeding the rate limit results in a **`429 Too Many Requests`** response.

- **Access:**
  - The MCP server is public and does not require an API key, bearer token, or dashboard sign-in.
  - Protection is based on per-IP rate limits similar to those for QR and trace functionalities.

## Related docs and API areas
- [Public tools API](./public-tools-api.md) — Contains REST endpoints for QR code generation, redirect tracing, and the documentation assistant.
- [Tools in the dashboard](./dashboard/tools-in-dashboard.md) — Discusses similar trace and QR functionalities available in the signed-in user interface.
