---
source: shared/docs/pages/overview.md
generatedAt: 2026-06-04T19:33:49.802Z
model: gpt-4o-mini
---

## Purpose
This documentation is for users of LinkShift.app, explaining how to configure redirect routing, manage domains and link maps, and inspect API contracts.

## What this doc covers
- Overview of LinkShift.app and its capabilities
- Request flow for live redirects
- How a redirect is decided
- User roles and starting points for different readers
- Tutorial for creating a redirect in the dashboard
- Documentation map for navigating various guides and resources

## Key workflows and rules
1. **Request Flow for Live Redirects**:
   - Incoming HTTP request is checked against the organization’s redirect rate limit.
   - Organization access is verified.
   - If the request path matches `robots.txt`, the policy is served.
   - Redirect rules are sorted by priority, creation date, and ID.
   - The first rule that returns a redirect target is applied.
   - If no rules match, a 404 response is returned.

2. **Creating a Redirect in the Dashboard**:
   - Sign in to the dashboard.
   - Create a domain group.
   - Add a domain or subdomain.
   - Create a redirect rule for a specific path to a new URL.
   - Validate the redirect using tests.

3. **Automating Redirect Creation**:
   - Use the API to create domain groups, domains, and redirect rules.
   - Simulate redirects to ensure correctness.

## Limits and constraints
- **Redirect Rules**: Support for path, query, regex, and wildcard matching; can return HTTP status codes `301`, `302`, `307`, or `308`.
- **Dynamic Destinations**: Up to 12 text/numeric modifiers and nested conditionals can be used.
- **Link Maps**: One prefix rule can be defined with a table of keys for static HTTPS URLs.
- **Rate Limits**: Each organization has a redirect rate limit that must be adhered to.
- **Multi-Tenant Architecture**: API keys and redirect traffic are scoped to individual organizations.

## Related docs and API areas
- [Dashboard Overview](./guides/dashboard/dashboard-overview.md)
- [Redirect Rules](./guides/redirect-rules.md)
- [Getting Started](./guides/getting-started.md)
- [Redirect Tests](./guides/redirect-tests.md)
- [API Reference](./reference.md)
- [Redirect Engine Concepts](./concepts/redirect-engine-concepts.md)
- [Link Maps](./guides/link-maps.md)
