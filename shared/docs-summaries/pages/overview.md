---
source: shared/docs/pages/overview.md
generatedAt: 2026-06-03T17:00:48.339Z
model: gpt-4o-mini
---

## Purpose
This documentation is for users of LinkShift.app, explaining how to configure redirect routing, manage domains and link maps, and inspect API contracts.

## What this doc covers
- Overview of LinkShift.app as a programmable redirect platform
- Request flow for live redirects
- Capabilities provided by LinkShift
- Step-by-step tutorial for creating redirects
- Documentation map for further reading
- Common questions and troubleshooting

## Key workflows and rules
1. **Redirect Decision Process**:
   - Incoming HTTP request is checked against organization rate limits.
   - Organization access is verified.
   - If the request matches a `robots.txt` path, the policy is served.
   - Rules are sorted by priority, creation date, and ID.
   - The first rule that returns a redirect target is applied.
   - If no rules match, a 404 response is returned.

2. **Creating a Redirect**:
   - Sign in to the dashboard.
   - Create a domain group.
   - Add a domain or subdomain.
   - Create a redirect rule specifying the source path and destination URL.
   - Validate the redirect using the testing features.

3. **API Automation Sequence**:
   - POST `/api/v1/domain-groups` to create a domain group.
   - POST `/api/v1/domains` to add a domain.
   - POST `/api/v1/redirect-rules` to create a redirect rule.
   - POST `/api/v1/redirect-rules/simulate` to test the redirect.

## Limits and constraints
- **Rate Limits**: Each organization has a redirect rate limit.
- **Redirect Rules**: Up to 100 entries can be simulated in a single request.
- **Multi-Tenancy**: API keys and redirect traffic are scoped to organizations.
- **Redirect Types**: Supports HTTP status codes `301`, `302`, `307`, and `308`.
- **Dynamic Destinations**: Supports placeholders and modifiers but does not allow arbitrary JavaScript execution at the edge.

## Related docs and API areas
- **Redirect Rules**: [Redirect rules](./guides/redirect-rules.md) for matching and link maps.
- **Dashboard Overview**: [Dashboard overview](./guides/dashboard/dashboard-overview.md) for navigation and limits.
- **API Reference**: [API reference](./reference.md) for endpoint index and routing cheat sheet.
- **Common Questions**: [FAQ and troubleshooting](./guides/faq.md) for quick answers and symptom matrix.
