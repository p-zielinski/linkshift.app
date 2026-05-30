# Tools in the dashboard

Use QR generation and redirect tracing inside the authenticated shell—the same utilities as the public site, without leaving your session.

## Before you start

- Sign in (Tools do not require a domain group).

## Tools hub (`/tools`)

In the sidebar, select **Tools**.

The page title is **Tools** with subtitle *Operational utilities for diagnosing redirects and generating share-ready QR assets.* Two cards are available:

| Tool | Route | Action |
|------|-------|--------|
| QR Code Generator | `/tools/qr-code-generator` | **Open tool** |
| Redirect Tester | `/tools/redirect-tester` | **Open tool** |

Public equivalents (marketing shell) live at `/qr-code-generator` and `/redirect-tester` if you are not signed in.

These tools are **not** in the Management API OpenAPI (`linkshift-api-keys`). They use the separate public tools service. Each trace request returns **one hop**; the UI follows chains client-side with hop limits and loop detection. See [Public tools API](../public-tools-api.md) and [Redirect engine — edge cases](../../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq).

## QR Code Generator

1. Open **QR Code Generator** from the hub.
2. Enter a destination URL and choose output format (PNG, SVG, or EPS).
3. Download the asset.

The tool includes **final-destination verification** to surface redirect issues before you distribute the code.

## Redirect Tester

1. Open **Redirect Tester** from the hub.
2. Enter a URL to trace.
3. Select a User-Agent profile (or set a custom value).
4. Run the trace and inspect status, headers, and final destination hop by hop.

Use this for loops, broken hops, and User-Agent-specific behavior. It does not replace [Tests in the dashboard](./tests-in-dashboard.md) tied to your organization's rules.

## What you should see

- Generated QR files or a hop-by-hop trace table in the tool view.
- No change to redirect rules or link maps unless you edit those sections separately.

## Related

- [Public tools API](../public-tools-api.md)
- [Tests in the dashboard](./tests-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Redirect engine — edge cases](../../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq) — redirect loops and multi-hop behavior (trace follows hops client-side; each trace request is single-hop on the tools service)
- [Dashboard overview](./dashboard-overview.md)
