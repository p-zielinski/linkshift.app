---
source: shared/docs/pages/overview.md
generatedAt: 2026-06-03T21:35:20.788Z
model: gpt-4o-mini
---

## Purpose
This documentation is for users of LinkShift.app, explaining how to configure redirect routing, manage domains and link maps, and inspect API contracts.

## What this doc covers
- Overview of LinkShift.app as a programmable redirect platform
- Request flow for live redirects
- Capabilities of LinkShift, including redirect rules, dynamic destinations, link maps, domains, simulation, analytics, and safety features
- Step-by-step tutorial for creating a redirect
- Documentation map for further reading

## Key workflows and rules
1. **Request Processing Flow**:
   - Incoming HTTP request is checked against the organization redirect rate limit.
   - Organization access is verified.
   - If the request path matches `robots.txt`, the policy is served.
   - Rules are sorted by priority, creation date, and ID.
   - The first rule that returns a redirect target is executed.
   - If no rules match, a 404 response is returned.

2. **Creating a Redirect**:
   - Sign in to the dashboard.
   - Create a domain group.
   - Add a domain or subdomain.
   - Create a redirect rule specifying the source path and destination URL.
   - Validate the redirect using test features.

3. **API Automation**:
   - Use the API to create domain groups, domains, and redirect rules programmatically.
   - Simulate redirects to ensure correct behavior.

## Limits and constraints
- **Redirect Rules**: Supports path, query, regex, and wildcard matching with priorities.
- **Dynamic Destinations**: Supports placeholders, 12 text/numeric modifiers, and nested conditionals.
- **Link Maps**: Can handle one prefix rule with a table of keys for static HTTPS URLs.
- **Rate Limits**: Each organization has a redirect rate limit.
- **Multi-Tenancy**: API keys and redirect traffic are scoped to organizations.
- **Simulation Limits**: Up to 100 entries can be simulated at once.

## Related docs and API areas
- **Redirect Rules**: [Redirect rules](./guides/redirect-rules.md) - Main routing guide.
- **Dashboard Overview**: [Dashboard overview](./guides/dashboard/dashboard-overview.md) - Navigation and limits.
- **API Reference**: [API reference](./reference.md) - Endpoint index and routing cheat sheet.
- **Redirect Tests**: [Redirect tests](./guides/redirect-tests.md) - CI regression testing.
- **Link Maps**: [Link maps](./guides/link-maps.md) - Managing short links at scale.
