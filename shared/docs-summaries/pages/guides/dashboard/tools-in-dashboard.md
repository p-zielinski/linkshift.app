---
source: shared/docs/pages/guides/dashboard/tools-in-dashboard.md
generatedAt: 2026-06-03T16:58:28.235Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard, explaining how to utilize the QR Code Generator and Redirect Tester tools.

## What this doc covers
- Overview of the Tools hub in the dashboard.
- Details on the **QR Code Generator** tool, including usage and output formats.
- Details on the **Redirect Tester** tool, including usage and User-Agent profile selection.
- Explanation of the expected outputs from both tools.

## Key workflows and rules
### QR Code Generator
1. Open **QR Code Generator** from the Tools hub.
2. Enter a destination URL.
3. Choose an output format: PNG, SVG, or EPS.
4. Download the generated QR code.
   - Includes **final-destination verification** to identify redirect issues before distribution.

### Redirect Tester
1. Open **Redirect Tester** from the Tools hub.
2. Enter a URL to trace.
3. Select a User-Agent profile or set a custom value.
4. Run the trace to inspect:
   - Status
   - Headers
   - Final destination, hop by hop.
   - Useful for identifying loops, broken hops, and User-Agent-specific behavior.
   - Does not replace the functionality of [Tests in the dashboard](./tests-in-dashboard.md).

## Limits and constraints
- Tools do not require a domain group for access.
- Each trace request in the Redirect Tester returns one hop; the UI follows chains client-side with hop limits and loop detection.
- Generated QR files and trace outputs do not alter redirect rules or link maps unless edited separately.

## Related docs and API areas
- [Public tools API](../public-tools-api.md)
- [Tests in the dashboard](./tests-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Redirect engine — edge cases](../../concepts/redirect-engine-edge-cases.md#advanced-engineering-faq)
- [Dashboard overview](./dashboard-overview.md)
