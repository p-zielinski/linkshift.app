---
source: shared/docs/pages/guides/dashboard/tools-in-dashboard.md
generatedAt: 2026-06-08T20:09:12.056Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard, explaining how to utilize the QR generation and redirect tracing tools available within the authenticated shell.

## What this doc covers
- **Tools hub**: Overview of the sidebar labels and routes based on dashboard mode.
- **QR generator / QR code generator**: Instructions for generating QR codes.
- **Test a link / Redirect tester**: Instructions for testing and tracing URLs.

## Key workflows and rules
### QR generator / QR code generator
1. Open the QR card from the hub (labeled **QR generator** in Campaign mode or **QR code generator** in Advanced mode).
2. Enter a destination URL.
3. Choose an output format (PNG, SVG, or EPS).
4. Download the generated asset.
5. The tool performs **final-destination verification** to identify redirect issues before distribution.

### Test a link / Redirect tester
1. Open the redirect card from the hub (labeled **Test a link** in Campaign mode or **Redirect tester** in Advanced mode).
2. Enter a URL to trace.
3. Select a User-Agent profile or set a custom value.
4. Run the trace to inspect status, headers, and final destination hop by hop.
5. This tool is useful for identifying loops, broken hops, and User-Agent-specific behavior.

## Limits and constraints
- Tools do not require a domain group for access.
- Each trace request returns one hop; the UI handles chains client-side with hop limits and loop detection.
- The tools are not part of the Management API OpenAPI (`linkshift-api-keys`) and utilize a separate public tools service.

## Related docs and API areas
- [Public tools API](../public-tools-api.md)
- [Tests in the dashboard](./tests-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Redirect engine — edge cases](../../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq)
- [Dashboard overview](./dashboard-overview.md)
