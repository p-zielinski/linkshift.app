---
source: shared/docs/pages/overview.md
generatedAt: 2026-06-07T10:08:18.615Z
model: gpt-4o-mini
---

## Purpose
This documentation is for users of the LinkShift platform, explaining how to configure redirect routing, manage domains and link maps, and inspect API contracts.

## What this doc covers
- Overview of LinkShift.app and its capabilities
- Request flow for live redirects
- Detailed explanation of how redirects are decided
- User roles and starting points for different types of users
- Tutorial for creating a redirect in the dashboard
- Documentation map for further exploration

## Key workflows and rules
1. **Redirect Decision Process**:
   - Incoming HTTP request is subjected to rate limiting and organization access checks.
   - Rules are sorted by priority (highest first), then by creation date, and finally by ID.
   - The first rule that returns a redirect target is applied.
   - If a rule matches the path but does not return a target (e.g., link map miss without a fallback), the next rule is evaluated.

2. **Creating a Redirect in the Dashboard**:
   - **Campaign View**:
     1. Connect your domain via the Overview or Links section.
     2. Create a link.
     3. Validate traffic using the Redirect tester.
   - **Advanced View**:
     1. Create a domain group.
     2. Add a domain or subdomain.
     3. Create a redirect rule.
     4. Validate with tests.

3. **API Automation**:
   - Follow the API automation checklist to create domain groups, domains, redirect rules, and simulate redirects.

## Limits and constraints
- **Redirect Rules**: Supports path, query, regex, and wildcard matching with status codes `301`, `302`, `307`, and `308`.
- **Dynamic Destinations**: Allows placeholders and modifiers, with a limit of 12 text/numeric modifiers.
- **Link Maps**: Can handle one prefix rule with a table of keys for static HTTPS URLs.
- **Rate Limiting**: Each organization is subject to a redirect rate limit.
- **Simulation**: Up to 100 entries can be simulated in a single request using `POST /redirect-rules/simulate`.

## Related docs and API areas
- [Dashboard overview](./guides/dashboard/dashboard-overview.md) for dashboard navigation.
- [Redirect rules](./guides/redirect-rules.md) for detailed routing guidance.
- [Getting started](./guides/getting-started.md) for API keys and authentication.
- [Redirect tests](./guides/redirect-tests.md) for CI regression testing.
- [API reference](./reference.md) for endpoint index and routing cheat sheet.
- OpenAPI pages under `/docs/api/…` for schema trees and interactive API testing.
