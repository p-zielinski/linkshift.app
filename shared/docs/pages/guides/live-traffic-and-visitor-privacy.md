# Live traffic and visitor privacy

Use this guide when LinkShift routes **live redirect traffic** for your sites or campaigns. It explains who is responsible for visitor data, what LinkShift processes, and what you need to cover in your own privacy notices.

---

## Who is responsible

| Role | Party | Scope |
|------|--------|--------|
| **Data controller** | You (the LinkShift customer) | End visitors who hit your redirect URLs |
| **Data processor** | LinkShift | Redirect routing, analytics, and configuration storage on your instructions |

You decide which rules run, which destinations receive traffic, and whether placeholders such as `{ip}` pass visitor data to third-party URLs. LinkShift processes redirect metadata to deliver the Service you configure.

---

## What LinkShift processes on live redirects

On each live redirect, LinkShift evaluates your rules and may record:

- **Request metadata** — path, query string, HTTP method, and resolved destination URL (hostname is used for routing but is not stored as a separate field in redirect analytics)
- **Link map keys** — the path suffix extracted when a link map rule wins
- **Aggregated analytics** — hourly hit counts, top link map keys, and top request variants per rule (see [Redirect rules — analytics](./redirect-rules-operations.md#analytics))

**Visitor IP is not stored in the analytics database.** IP may appear in short-lived operational logs on the edge (for example abuse prevention and debugging) and is retained for a limited period — see retention below.

Operational logs (Loki) may include request paths, status codes, and similar technical metadata. They are not intended for long-term visitor profiling.

---

## What you must do

1. **Publish a privacy notice** on your sites that receive redirect traffic. Tell visitors that redirects are processed by a third-party routing provider and describe what data you collect through redirects and analytics.
2. **Establish a lawful basis** for processing visitor data under applicable law (for example legitimate interests or consent, depending on your jurisdiction and use case).
3. **Avoid unnecessary personal data in URLs** — query parameters in redirect links may contain emails, names, or other identifiers from your campaigns. Do not put sensitive data in URLs when you can use opaque tokens instead.
4. **Cover analytics in your policy** — if you use LinkShift analytics, explain that you review aggregated traffic patterns (paths, destinations, link map keys) for operations and reporting.

---

## `{ip}` placeholder

The `{ip}` placeholder inserts the visitor's IP address into the **destination URL** LinkShift returns. The receiving server (your site or a third party you configure) then processes that IP under **your** responsibility.

- Case-sensitive: use `{ip}` exactly as documented — see [Redirect engine — request variables](../concepts/redirect-engine-variables.md#request-variables).
- Test with explicit `ip` in [simulate](./redirect-rules-operations.md#simulate-before-rollout) when rules branch on IP.
- You must have a lawful basis and disclose this forwarding in your privacy notice when you use `{ip}` in destinations.

---

## Data Processing Agreement

LinkShift offers an online Data Processing Agreement (DPA) that supplements the Terms when you use the Service for live redirect traffic:

- **DPA summary:** [Data Processing Agreement](/dpa) on the app
- **Questions:** email [privacy@linkshift.app](mailto:privacy@linkshift.app)

Enterprise customers who need a countersigned DPA can request a full signed copy at the same address.

---

## Retention

| Data type | Retention |
|-----------|-----------|
| Redirect traffic analytics | Limited period that **varies by plan** — see [Pricing](/pricing) and the retention indicator in your analytics dashboard |
| Operational logs (Loki) | Approximately 96 hours |
| Account and configuration | While your account is active, plus a reasonable period afterward |

For full retention details on account data and subprocessors, see the [Privacy Policy](/privacy).

---

## Related guides

- [Redirect rules — analytics](./redirect-rules-operations.md#analytics) — API fields, date ranges, and `topLinkMapKeys`
- [Redirect engine — variables](../concepts/redirect-engine-variables.md) — `{ip}`, path, query, and request metadata placeholders
