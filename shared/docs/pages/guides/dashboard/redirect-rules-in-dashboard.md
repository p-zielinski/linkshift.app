# Redirect rules in the dashboard

Create and maintain redirect rules from the dashboard, filter by domain group, and run redirect tests from the rules page summary.

:::info
You need at least one **domain group** with a **domain or subdomain** attached before rules can run on live traffic. Matching behavior (path, query, link maps, destinations) is in [Redirect rules](../redirect-rules.md) — this page is UI flow only.
:::

## Open redirect rules

1. In the sidebar, select **Redirect Rules**. The page title is **Redirect Rules**.
2. Choose a **Domain group** in the filter (selection persists across visits). When your organization has only one group, the filter selects it automatically.
3. Optionally use search to narrow the table.

## Create a redirect rule

1. With a domain group selected in the filter, select **Add rule** (if no group is selected, create stays disabled).
2. Walk through the wizard (nav label → step title):

| Nav label | Step title | Purpose |
|-----------|------------|---------|
| **Scope** | Scope & priority | Priority for evaluation order |
| **Match** | Request matching | Source path, method, query, optional link map |
| **Destination** | Destination logic | Target URL or link-map routing |
| **Status** | Status code | HTTP redirect status code |
| **Summary** | Review | Review before save |

3. On **Review**, select **Create** to save the rule.

On **Request matching**, you can open the link map wizard to **create a link map** in context, then select it on the rule.

Use **Search source or destination** to narrow the rules table.

The rules table shows **20** rows per page (fixed; the Management API list default `limit` is also 20).

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

Above the rules table, the **Redirect tests** section shows **Pass rate**, **Passed**, **Needs attention**, and **Not run** for the selected domain group.

1. Pick a domain group in the page filter so the card activates (otherwise you see *Select a domain group to preview tests.*).
2. Select **Run tests** to open the **Run tests** dialog and execute tests that do not yet have a result in this session. Footer copy notes that results reflect runs started from this session.

The same **Run tests** flow is available on the **Tests** page — see [Tests in the dashboard](./tests-in-dashboard.md#run-pending-tests).

## What you should see

- The rule appears in the table for the active domain group.
- After **Run tests**, metrics on the card update (passed, needs attention, not run).

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
