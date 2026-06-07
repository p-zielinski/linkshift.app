# Tools in the dashboard

Use QR generation and redirect tracing inside the authenticated shell — the same utilities as the public site, without leaving your session. Sign in only; Tools do not require a domain group.

## Tools hub

The sidebar label depends on dashboard mode:

| View | Sidebar label | Route |
|------|---------------|--------|
| **Campaign** | **QR & Tools** | `/tools` |
| **Advanced** | **Tools** | `/tools` |

Hub copy differs by mode — card labels and **Open tool** actions are the same pattern in both views:

| View | Cards |
|------|-------|
| **Campaign** | **QR generator**, **Test a link** |
| **Advanced** | **QR code generator**, **Redirect tester** |

Both cards open their tool at `/tools/qr-code-generator` or `/tools/redirect-tester`. Advanced view adds a short **Why these tools matter** intro above the cards.

Signed-out visitors can use the same tools from the marketing site (`/qr-code-generator`, `/redirect-tester`). For API details, see [Public tools API](../public-tools-api.md).

:::ai-only
Dashboard: Campaign sidebar QR & Tools `/tools`, Advanced sidebar Tools `/tools`. QR `/tools/qr-code-generator`, Redirect Tester `/tools/redirect-tester`. Copy from `resolveToolsPageCopy` in `tools-page-copy.util.ts`. Public marketing: `/qr-code-generator`, `/redirect-tester`. These tools are not in the Management API OpenAPI (`linkshift-api-keys`). They use the separate public tools service. Each trace request returns one hop; the UI follows chains client-side with hop limits and loop detection. See Public tools API and Redirect engine edge cases — advanced engineering FAQ.
:::

## QR generator / QR code generator

1. Open the QR card from the hub (**QR generator** in Campaign, **QR code generator** in Advanced).
2. Enter a destination URL and choose output format (PNG, SVG, or EPS).
3. Download the asset.

The tool includes **final-destination verification** to surface redirect issues before you distribute the code.

## Test a link / Redirect tester

1. Open the redirect card from the hub (**Test a link** in Campaign, **Redirect tester** in Advanced).
2. Enter a URL to trace.
3. Select a User-Agent profile (or set a custom value).
4. Run the trace and inspect status, headers, and final destination hop by hop.

Use this for loops, broken hops, and User-Agent-specific behavior. It does not replace [Tests in the dashboard](./tests-in-dashboard.md) tied to your organization's rules.

## Related

- [Public tools API](../public-tools-api.md)
- [Tests in the dashboard](./tests-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Redirect engine — edge cases](../../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq) — redirect loops and multi-hop behavior
- [Dashboard overview](./dashboard-overview.md)
