---
source: shared/docs/pages/guides/redirect-rules.md
generatedAt: 2026-06-08T20:11:39.106Z
model: gpt-4o-mini
---

## Purpose
This document is for users of LinkShift who need guidance on creating and managing redirect rules for routing requests.

## What this doc covers
- Overview of redirect rules and their purpose
- Instructions for accessing and using the Redirect Rules feature in the dashboard
- Recommended reading order for understanding conditional routing
- Links to specific guides related to redirect rules:
  - Matching and destinations
  - Link maps and redirect rules
  - Validation, simulate, and analytics
  - Recipes and anti-patterns
  - FAQ and troubleshooting
  - Redirect rules in the dashboard

## Key workflows and rules
1. **Accessing Redirect Rules**: 
   - Open the **Redirect Rules** section in the sidebar.
   - Select **Add rule** to initiate the rule creation wizard.
   - Follow the wizard to define the scope, matching criteria, destination, and status of the rule.

2. **Recommended Reading Order for Conditional Routing**:
   - Read the following guides in order before editing production rules:
     1. [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
     2. [Engine — variables](../concepts/redirect-engine-variables.md)
     3. [Engine — conditionals](../concepts/redirect-engine-conditionals.md)
     4. [Redirect rules — recipes](./redirect-rules-recipes.md)
     5. [Redirect rules — matching](./redirect-rules-core.md)
     6. [Redirect rules — simulate](./redirect-rules-operations.md)

## Limits and constraints
- The document references limits related to the redirect engine, such as rate limits and caching, but does not specify exact numerical limits or quotas.
- Users should be aware of the validation requirements when creating or updating redirect rules, as detailed in the linked guides.

## Related docs and API areas
- [Redirect engine concepts](../concepts/redirect-engine-concepts.md)
- [Matching and destinations](./redirect-rules-core.md)
- [Link maps and redirect rules](./redirect-rules-link-maps.md)
- [Validation, simulate, and analytics](./redirect-rules-operations.md)
- [Recipes and anti-patterns](./redirect-rules-recipes.md)
- [FAQ and troubleshooting](./faq.md)
- [Redirect rules in the dashboard](./dashboard/redirect-rules-in-dashboard.md)
