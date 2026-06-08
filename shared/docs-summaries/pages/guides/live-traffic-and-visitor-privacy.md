---
source: shared/docs/pages/guides/live-traffic-and-visitor-privacy.md
generatedAt: 2026-06-08T20:10:34.395Z
model: gpt-4o-mini
---

## Purpose
This document is for LinkShift customers and explains the responsibilities regarding visitor data when using live redirect traffic for sites or campaigns.

## What this doc covers
- **Who is responsible**: Defines the roles of data controller (customer) and data processor (LinkShift).
- **What LinkShift processes on live redirects**: Details the request metadata, link map keys, and aggregated analytics recorded during redirects.
- **What you must do**: Outlines the requirements for publishing a privacy notice, establishing lawful data processing, avoiding personal data in URLs, and covering analytics in privacy policies.
- **`{ip}` placeholder**: Explains the use of the `{ip}` placeholder for inserting visitor IP addresses into destination URLs.
- **Data Processing Agreement**: Provides information about the Data Processing Agreement (DPA) and how to request a countersigned copy.
- **Retention**: Lists the retention periods for different types of data processed by LinkShift.
- **Related guides**: Links to additional resources on redirect rules and request variables.

## Key workflows and rules
1. **Publish a privacy notice**: Inform visitors about third-party processing and data collection.
2. **Establish a lawful basis**: Determine the legal grounds for processing visitor data.
3. **Avoid unnecessary personal data in URLs**: Use opaque tokens instead of sensitive data in query parameters.
4. **Cover analytics in your policy**: Explain the use of aggregated traffic patterns in your privacy policy.
5. **Using the `{ip}` placeholder**: Ensure the placeholder is used correctly and disclose its use in your privacy notice.

## Limits and constraints
- **Data retention**:
  - Redirect traffic analytics: Retention varies by plan (see [Pricing](/pricing)).
  - Operational logs (Loki): Approximately 96 hours.
  - Account and configuration data: Retained while the account is active, plus a reasonable period afterward.
- **IP address handling**: The `{ip}` placeholder must be used exactly as documented, and a lawful basis must be established for its use.

## Related docs and API areas
- [Redirect rules — analytics](./redirect-rules-operations.md#analytics): Information on API fields and analytics.
- [Redirect engine — variables](../concepts/redirect-engine-variables.md): Details on request metadata placeholders, including `{ip}`. 
- [Data Processing Agreement](/dpa): Access to the DPA for customers using live redirect traffic.
- [Privacy Policy](/privacy): For full retention details on account data and subprocessors.
