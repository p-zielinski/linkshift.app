---
source: shared/docs/pages/guides/dashboard/redirect-rules-in-dashboard.md
generatedAt: 2026-06-07T10:05:26.021Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard who need to create, manage, and test redirect rules.

## What this doc covers
- Overview of accessing and using the **Redirect Rules** feature in the dashboard.
- Steps to **open redirect rules** and filter by site.
- Instructions to **create a redirect rule**, including setting scope, match criteria, destination, status, and summary.
- How to **edit or delete** existing redirect rules.
- Information on the **Redirect tests card** and how to run tests for redirect rules.
- Links to related documentation for further automation and validation.

## Key workflows and rules
### Open redirect rules
1. Select **Redirect Rules** from the sidebar.
2. Choose a **Site** from the page header menu.
3. Optionally use the search function to filter the rules table.

### Create a redirect rule
1. Ensure a site is selected; click **Add rule**.
2. Complete the following fields:
   - **Scope** (priority)
   - **Match** (path, method, query, optional link map)
   - **Destination**
   - **Status** (redirect code)
   - **Summary**
3. Click **Create** to save the rule.

### Edit or delete a redirect rule
- To **edit**, select the rule and use the wizard with existing values.
- To **delete**, confirm in the dialog titled **Delete redirect rule**.

### After saving a new rule
1. The rule wizard closes and the redirect test wizard opens with prefilled fields.
2. Complete the wizard and click **Create**.
3. Select **Run tests** on **Redirect Rules** or **Tests** to execute pending cases.

### Redirect tests card
1. Select a site in the page header **Site** menu to activate the card.
2. Click **Run tests** to execute tests that do not yet have results.

## Limits and constraints
- At least one **site** with a **domain or subdomain** must be attached for rules to run on live traffic.
- The **All sites** option is not available; a single site must be selected in the page header.
- The **Add rule** button is disabled if no site is selected.

## Related docs and API areas
- [Redirect rules (API index)](../redirect-rules.md) - for API endpoints related to redirect rules.
- [Tests in the dashboard](./tests-in-dashboard.md) - for testing redirect rules.
- [Redirect engine variables](../../concepts/redirect-engine-variables.md) - for dynamic destination placeholders.
- [Link maps in the dashboard](./link-maps-in-dashboard.md) - for managing link maps.
- [Redirect rules — operations (simulate & analytics)](../redirect-rules-operations.md) - for validation and analytics related to redirect rules.
