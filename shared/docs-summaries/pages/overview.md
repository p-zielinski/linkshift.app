---
source: shared/docs/pages/overview.md
generatedAt: 2026-06-08T20:12:03.601Z
model: gpt-4o-mini
---

## Purpose
This documentation is for users of LinkShift.app, explaining how to configure redirect routing, manage domains and link maps, and inspect API contracts.

## What this doc covers
- Overview of LinkShift.app and its capabilities
- Request flow for live redirects
- How redirects are decided
- User roles and their starting points in the documentation
- Tutorial for creating a redirect
- Documentation map for further reading

## Key workflows and rules
1. **Redirect Decision Process**:
   - Incoming HTTP request is rate-limited and checked for organization access.
   - Rules are sorted by priority, creation date, and ID.
   - The first rule that returns a redirect target is applied.
   - If a rule matches but fails to provide a target, the next rule is evaluated.

2. **Creating a Redirect in the Dashboard**:
   - Sign in to the dashboard.
   - For Campaign view:
     1. Connect your domain.
     2. Create a link.
     3. Validate traffic using the redirect tester.
   - For Advanced view:
     1. Create a domain group.
     2. Add a domain or subdomain.
     3. Create a redirect rule.
     4. Validate using tests.

3. **Automating Redirect Creation**:
   - Follow the API automation checklist to create domain groups, domains, and redirect rules programmatically.

## Limits and constraints
- **Redirect Rules**: Support for path, query, regex, and wildcard matching; can return HTTP status codes `301`, `302`, `307`, or `308`.
- **Dynamic Destinations**: Use placeholders and modifiers; up to 12 text/numeric modifiers allowed.
- **Link Maps**: Can handle a single prefix rule with a table of keys for static HTTPS URLs.
- **Rate Limits**: Each organization has a redirect rate limit.
- **Simulation Limits**: Up to 100 entries can be simulated in a single request using `POST /redirect-rules/simulate`.

## Related docs and API areas
- [Dashboard Overview](./guides/dashboard/dashboard-overview.md)
- [Redirect Rules](./guides/redirect-rules.md)
- [Getting Started](./guides/getting-started.md)
- [API Reference](./reference.md)
- [Redirect Tests](./guides/redirect-tests.md)
- [Link Maps](./guides/link-maps.md)
- [Redirect Engine Concepts](./concepts/redirect-engine-concepts.md)
- [Platform Status](https://status.linkshift.app)
