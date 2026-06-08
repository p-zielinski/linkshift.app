---
source: shared/docs/pages/guides/linkshift-mcp.md
generatedAt: 2026-06-08T20:10:27.933Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and AI clients looking to utilize the LinkShift Model Context Protocol (MCP) server for accessing documentation in a read-only format.

## What this doc covers
- Overview of the LinkShift MCP server and its functionalities.
- Details on the MCP endpoint and how to use it.
- Description of available tools: `docs_search_catalog`, `docs_get_page`, `trace_redirect`, and `generate_qr_code`.
- Rate limits and access requirements for using the MCP.
- Instructions for manual configuration of Cursor to connect to the MCP.

## Key workflows and rules
1. **Accessing the MCP Endpoint**:
   - Use the public tools base URL for your deployment.
   - Send a `POST` request to `{toolsBaseUrl}/api/v1/public/mcp`.
   - Example: `POST http://localhost:3030/api/v1/public/mcp`.

2. **Using Available Tools**:
   - **Search Documentation**: Call `docs_search_catalog` with a query to search the documentation catalog.
   - **Load Documentation Page**: Use `docs_get_page` to retrieve full documentation text for a specific catalog entry.
   - **Trace Redirect**: Call `trace_redirect` to trace one HTTP redirect hop for a given URL.
   - **Generate QR Code**: Use `generate_qr_code` to create a QR code for a URL, with options for PNG, SVG, or EPS formats as base64 JSON.

3. **Rate Limiting**:
   - Requests are limited to **180 requests per minute** per client IP.
   - Exceeding the limit results in a **`429 Too Many Requests`** response.

4. **Configuration for Cursor**:
   - Add a server entry under **Cursor Settings → MCP** pointing to the MCP endpoint in `mcp.json`.

## Limits and constraints
- **Rate Limits**: 180 requests per minute per client IP.
- **Access**: The MCP is public and does not require an API key, bearer token, or dashboard sign-in.
- **Transport**: Requests must be sent using Streamable HTTP with `POST`; other methods will return a `405` error.

## Related docs and API areas
- [Public tools API](./public-tools-api.md) — Contains REST endpoints for QR, trace, and documentation assistant functionalities.
- [Tools in the dashboard](./dashboard/tools-in-dashboard.md) — Discusses similar trace and QR functionalities available in the signed-in UI.
