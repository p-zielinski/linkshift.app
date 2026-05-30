---
source: shared/docs/pages/guides/dashboard/tools-in-dashboard.md
generatedAt: 2026-05-30T07:00:53.491Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard, explaining how to utilize the QR Code Generator and Redirect Tester tools.

## What this doc covers
- Overview of the Tools hub (`/tools`)
- Details on the QR Code Generator tool (`/tools/qr-code-generator`)
- Details on the Redirect Tester tool (`/tools/redirect-tester`)
- Expected outputs from the tools

## Key workflows and rules
### QR Code Generator
1. Open the **QR Code Generator** from the Tools hub.
2. Enter a destination URL.
3. Choose an output format (PNG, SVG, or EPS).
4. Download the generated QR code.
5. The tool performs **final-destination verification** to identify redirect issues before distribution.

### Redirect Tester
1. Open the **Redirect Tester** from the Tools hub.
2. Enter the URL you want to trace.
3. Select a User-Agent profile or input a custom User-Agent.
4. Run the trace to inspect:
   - Status codes
   - Response headers
   - Final destination, displayed hop by hop
5. Use this tool to diagnose loops, broken hops, and User-Agent-specific behaviors.

## Limits and constraints
- The tools do not require a domain group for access.
- Each trace request in the Redirect Tester returns **one hop**; the UI handles chains client-side with limits on hops and loop detection.
- The tools are not part of the Management API OpenAPI (`linkshift-api-keys`) and utilize a separate public tools service.

## Related docs and API areas
- [Public tools API](../public-tools-api.md)
- [Tests in the dashboard](./tests-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Redirect engine — edge cases](../../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq)
- [Dashboard overview](./dashboard-overview.md)
