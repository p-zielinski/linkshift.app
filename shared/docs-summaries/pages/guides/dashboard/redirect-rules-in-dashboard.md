---
source: shared/docs/pages/guides/dashboard/redirect-rules-in-dashboard.md
generatedAt: 2026-06-08T20:08:47.983Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard who need to create, manage, and test redirect rules.

## What this doc covers
- Overview of accessing and using the Redirect Rules feature in the dashboard.
- Steps to open redirect rules and filter by site.
- Instructions for creating a redirect rule, including scope, match criteria, destination, status, and summary.
- Guidance on editing or deleting existing redirect rules.
- Information on the redirect tests card and how to run tests.
- References to related documentation for further automation and validation.

## Key workflows and rules
### Open redirect rules
1. Select **Redirect Rules** from the sidebar.
2. Choose a **Site** from the page header menu.
3. Optionally use the search function to filter the rules table.

### Create a redirect rule
1. Ensure a site is selected in the page header menu.
2. Click **Add rule**.
3. Complete the following fields:
   - **Scope** (priority)
   - **Match** (path, method, query, optional link map)
   - **Destination**
   - **Status** (redirect code)
   - **Summary**
4. Click **Create** to save the rule.

### Edit or delete a redirect rule
- **Edit**: Open the existing rule in the wizard and modify as needed.
- **Delete**: Confirm deletion in the dialog titled **Delete redirect rule**.

### After saving a new rule
1. The rule wizard closes and the redirect test wizard opens with prefilled fields.
2. Complete the test wizard and click **Create**.
3. Select **Run tests** on **Redirect Rules** or **Tests** to execute pending cases.

### Redirect tests card
1. Select a site in the page header **Site** menu to activate the card.
2. Click **Run tests** to execute tests without results in the current session.

## Limits and constraints
- At least one **site** with a **domain or subdomain** must be attached for rules to run on live traffic.
- The **All sites** option is not available; a specific site must be selected.
- The **Add rule** button is disabled if no site is selected.

## Related docs and API areas
- [Redirect rules (API index)](../redirect-rules.md) - for API operations related to redirect rules.
- [Tests in the dashboard](./tests-in-dashboard.md) - for information on running tests.
- [Redirect engine variables](../../concepts/redirect-engine-variables.md) - for dynamic destination placeholders.
- [Link maps in the dashboard](./link-maps-in-dashboard.md) - for managing link maps.
- [Redirect rules — operations (simulate & analytics)](../redirect-rules-operations.md) - for validation and analytics related to redirect rules.
