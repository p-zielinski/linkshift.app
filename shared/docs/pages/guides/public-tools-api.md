# Public tools API

QR code generation and redirect tracing run on a **separate public tools service** — not the LinkShift Management API. No API key or account is required.

:::info
These endpoints are **not** in the Management API OpenAPI contract. Use the public tools base URL. Signed-in users can open the same tools in the dashboard — [Tools in the dashboard](./dashboard/tools-in-dashboard.md).
:::

## What the public tools do

| Tool | Purpose |
|------|---------|
| QR code | Generate PNG, SVG, or EPS QR images for a destination URL |
| Redirect trace | Inspect **one HTTP redirect hop** per request — status, headers, latency, and destination |

The redirect tester on the marketing site or under dashboard **Tools** → **Redirect Tester** may follow a full chain **client-side** by calling trace repeatedly. Each API call still returns only one hop.

## Endpoints

Base path on the public tools service:

| Method | Path | Role |
|--------|------|------|
| `GET` | `/api/v1/public/qr-code` | Generate a QR image (query parameters for URL, format, size, optional download) |
| `GET` | `/api/v1/public/trace` | Trace a single redirect hop for a URL (optional User-Agent) |
| `GET` | `/trace` | Alias for single-hop trace (same behavior as `/api/v1/public/trace`) |
| `POST` | `/api/v1/public/mcp` | Read-only docs MCP for AI clients (catalog search, page load, trace, QR) — see [LinkShift docs MCP](./linkshift-mcp.md) |

These paths are **not** listed in the Management API OpenAPI contract.

## Single-hop trace semantics

- One request = one hop (`maxRedirects: 0` on the server).
- The client decides whether to request the next hop and enforces hop limits and loop detection.
- Trace responses use `Cache-Control: no-store` so results are not cached for reuse.
- QR responses may use short public caching (`Cache-Control: public, max-age=300`).

## Security and limits

:::warning
Trace, QR, and MCP apply **SSRF guards** (where URLs are fetched) and **per-IP rate limits** (defaults below). Do not use the service to probe internal networks; contact support if you need higher throughput.
:::

- **SSRF guard** — trace and related logic block localhost and private IP ranges so the service cannot be used to probe internal networks.
- **Hop limits** — enforced in the client when building multi-hop chains; the API does not follow redirect chains in one call.
- **Rate limits** — apply per client IP on the public tools service (UTC calendar minute). Default deployment limits:

| Endpoint family | Default limit (per IP per minute) | Notes |
|-----------------|-------------------------------------|-------|
| QR (`/api/v1/public/qr-code`) | 600 | Configurable per deployment |
| Trace (`/api/v1/public/trace`, `/trace`) | 240 | Configurable per deployment |
| MCP (`POST /api/v1/public/mcp`) | 180 | Configurable per deployment (`MCP_RATE_LIMIT_PER_MINUTE`) |

Rate limiting requires Redis. If Redis is unavailable, rate limiting may be skipped temporarily until Redis recovers. Contact support if you need higher throughput.

Do not publish internal service hostnames in integrations — use the same public base URL as the LinkShift marketing tools pages.

## In the dashboard

After sign-in:

1. Sidebar **Tools** → `/tools`
2. **QR Code Generator** or **Redirect Tester** (same behavior as public routes, inside the app shell)

Details: [Tools in the dashboard](./dashboard/tools-in-dashboard.md).

## Marketing URLs (not signed in)

| Page | Route |
|------|-------|
| QR Code Generator | `/qr-code-generator` |
| Redirect Tester | `/redirect-tester` |

These pages call the same public tools endpoints through the configured tools API base URL.

## Docs MCP (read-only)

AI clients can search and load documentation pages over MCP (Streamable HTTP), plus call single-hop trace and QR generation. There is no `docs_ask` on MCP — no server-side LLM. The browser **Ask docs** assistant is separate.

See [LinkShift docs MCP](./linkshift-mcp.md) for the endpoint URL, tools, rate limits, and Cursor configuration.

## Documentation assistant

The in-browser **Ask docs** assistant (dashboard and docs site) calls `POST /api/v1/public/docs/search` with a Turnstile token. That flow streams search status and returns an answer from the docs catalog. Questions are sent to OpenAI for answer generation only; LinkShift does not share this data with OpenAI for model training. MCP exposes `docs_search_catalog` and `docs_get_page` instead — no Turnstile and no server-side LLM on the MCP path.

## Related

- [Tools in the dashboard](./dashboard/tools-in-dashboard.md) — authenticated tools hub
- [Redirect engine — edge cases](../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq) — loops and multi-hop behavior
- [Overview FAQ](../overview-faq.md) — trace and QR in common questions
- [LinkShift docs MCP](./linkshift-mcp.md) — read-only docs MCP endpoint and Cursor setup
- [Getting started](./getting-started.md) — Management API (separate product surface)
