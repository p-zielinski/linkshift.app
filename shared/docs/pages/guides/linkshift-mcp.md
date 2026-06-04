# LinkShift docs MCP (read-only)

The LinkShift **Model Context Protocol (MCP)** server is a **read-only docs and utilities** surface for AI clients. It searches and loads documentation pages from the catalog — it does **not** run the in-browser **Ask docs** LLM and does **not** manage redirect rules, domain groups, or billing.

It also exposes the same public **redirect trace** and **QR code** tools as the [Public tools API](./public-tools-api.md). The MCP server runs on the public tools service — not the LinkShift Management API. No organization API key or dashboard sign-in is required.

:::info
Use MCP in AI clients (for example Cursor) to **read docs** (`docs_search_catalog`, `docs_get_page`), trace one redirect hop, or generate a QR code. For Management API automation, use [Getting started](./getting-started.md). For conversational doc answers in the browser, use **Ask docs** — see [Public tools API — Documentation assistant](./public-tools-api.md#documentation-assistant).
:::

## Endpoint

Use your deployment’s **public tools base URL** (the same host as QR and trace on the marketing site or dashboard tools):

```http
POST {toolsBaseUrl}/api/v1/public/mcp
```

Example (local default):

```http
POST http://localhost:3030/api/v1/public/mcp
```

Transport is **Streamable HTTP** (stateless JSON). Send MCP requests with `POST`; other methods return `405`.

## Available tools

| Tool | Purpose |
|------|---------|
| `docs_search_catalog` | Search the documentation catalog by query (catalogId, user-facing ref, summary) |
| `docs_get_page` | Load full documentation text for a catalog entry from search results |
| `trace_redirect` | Trace **one HTTP redirect hop** for a URL (same SSRF guards as public trace) |
| `generate_qr_code` | Generate a QR code for a URL (PNG, SVG, or EPS as base64 JSON) |

There is **no** `docs_ask` tool on MCP. The in-browser **Ask docs** assistant uses Turnstile and a separate streaming search endpoint — see [Public tools API](./public-tools-api.md#documentation-assistant).

## Rate limits

- Limits apply **per client IP** on the public tools service (UTC calendar minute).
- Default: **180 requests per minute** per IP (`MCP_RATE_LIMIT_PER_MINUTE`).
- MCP does not run an LLM on the server; docs tools read catalog and page files only.
- Rate limiting uses Redis. If Redis is unavailable, limiting may be skipped temporarily until Redis recovers.

When you exceed the limit, the service returns **`429 Too Many Requests`**.

## Access

MCP is **public** — no API key, bearer token, or dashboard sign-in. Protection is the same as QR and trace: per-IP rate limits on the public tools service.

## Manual Cursor configuration

Add a server entry under **Cursor Settings → MCP** (or `mcp.json`), pointing `url` at the MCP endpoint:

```json
{
  "mcpServers": {
    "linkshift-docs-mcp": {
      "url": "https://your-tools-host.example/api/v1/public/mcp"
    }
  }
}
```

Replace the host with your public tools base URL. Do not publish internal service hostnames in client config.

## Related

- [Public tools API](./public-tools-api.md) — REST QR, trace, and documentation assistant endpoints
- [Tools in the dashboard](./dashboard/tools-in-dashboard.md) — same trace and QR in the signed-in UI
