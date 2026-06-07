# Redirect rules in the dashboard

**Advanced** view only. Open **Redirect Rules** from the sidebar under **Routing**.

Create and maintain redirect rules from the dashboard, filter by site, and run redirect tests from the rules page summary.

:::info
You need at least one **site** with a **domain or subdomain** attached before rules can run on live traffic. Matching behavior (path, query, link maps, destinations) is in [Redirect rules](../redirect-rules.md) — this page is UI flow only.
:::

## Open redirect rules

1. In the sidebar, select **Redirect Rules**.
2. Choose a **Site** in the page header menu (selection persists across visits). When you have only one site, the filter selects it automatically.
3. Optionally use search to narrow the table.

## Create a redirect rule

1. With a site selected in the page header menu, select **Add rule** (if no site is selected, create stays disabled).
2. Walk through **Scope** (priority), **Match** (path, method, query, optional link map), **Destination**, **Status** (redirect code), and **Summary**.
3. On **Summary**, select **Create** to save the rule.

On **Request matching**, you can open the link map wizard to **create a link map** in context, then select it on the rule.

Use **Search source or destination** to narrow the rules table.

Use the table footer paginator to change pages or rows per page.

### Table empty states

| State | What you see |
|-------|----------------|
| No site selected | *Choose a site in the page header Site menu to view redirect rules.* |
| Site selected, loading | **Loading redirect rules…** |
| Site selected, no rules | **No redirect rules found.** |

**All sites** is not available on this page — pick one site in the page header **Site** menu.

A static destination URL is enough for most first rules. Variable tokens (for example `domain.fqdn`) appear in the wizard only when your team uses dynamic destinations—see **Related** for engine docs.

## Edit or delete

- **Edit** — same wizard with existing values.
- **Delete** — confirm in the dialog titled **Delete redirect rule**.

## After you save a new rule

Saving a **new** rule closes the rule wizard and opens the redirect test wizard with fields prefilled.

1. Complete that wizard with **Create**
2. Select **Run tests** on **Redirect Rules** or **Tests** to execute pending cases

For **Fetch expected result**, result dialogs, and the standalone test flow, see [Tests in the dashboard](./tests-in-dashboard.md).

## Redirect tests card

Above the rules table, the **Redirect tests** section shows **Pass rate**, **Passed**, **Needs attention**, and **Not run** for the site selected in the page header **Site** menu.

1. Pick a site in the page header **Site** menu so the card activates.
2. Select **Run tests** to execute tests that do not yet have a result in this session.

The same **Run tests** flow is available on the **Tests** page — see [Tests in the dashboard](./tests-in-dashboard.md#run-pending-tests).

## Automate instead

See [Redirect rules (API index)](../redirect-rules.md), [Matching and destinations](../redirect-rules-core.md), and [Validation, simulate, and analytics](../redirect-rules-operations.md) for rule fields, CRUD, and simulate before rollout.

:::ai-only
Management API: GET/POST/PUT/DELETE `/api/v1/redirect-rules`; POST `/api/v1/redirect-rules/simulate` for pre-rollout validation.
:::

## Related

- [Redirect engine variables](../../concepts/redirect-engine-variables.md) — placeholders and modifiers for dynamic destinations
- [Link maps in the dashboard](./link-maps-in-dashboard.md)
- [Tests in the dashboard](./tests-in-dashboard.md)
- [Redirect rules — link maps](../redirect-rules-link-maps.md)
- [Redirect rules — operations (simulate & analytics)](../redirect-rules-operations.md)
