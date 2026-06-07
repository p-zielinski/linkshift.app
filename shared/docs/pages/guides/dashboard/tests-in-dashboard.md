# Tests in the dashboard

**Advanced** view only. Open **Tests** from the sidebar under **Quality**.

Define redirect tests, run pending cases for a site, and read pass/fail status from the Tests page or the Redirect Rules summary card.

:::info
You need at least one site with redirect rules. **Run tests** executes pending cases for the selected site in the current session only. Fixture design and CI: [Redirect tests](../redirect-tests.md).
:::

## Open tests

1. In the sidebar, select **Tests**.
2. Choose a **Site** in the page header menu (with one site, the filter selects it automatically) and optionally search by path or query.

Use the table footer paginator to change pages or rows per page.

### Table empty states

| State | What you see |
|-------|----------------|
| No site selected | *Choose a site in the page header Site menu to view tests.* |
| Site selected, loading | **Loading tests…** |
| Site selected, no tests | **No redirect tests found.** |

**All sites** is not available on this page — pick one site in the page header **Site** menu.

## Create a test

1. With a site selected in the page header menu, select **Add test**.
2. Complete **Scope** (site, hostname, path), **Request** (method and headers), and **Expected** (status and destination).
3. On **Expected**, optionally select **Fetch expected result** (shows **Simulating…** while loading). For API-side simulate behavior, see [Redirect rules — operations](../redirect-rules-operations.md).
4. Select **Create** to save the test.

## Create a test after saving a new rule

When you save a **new** redirect rule, the dashboard may open this wizard with fields prefilled. See [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md#after-you-save-a-new-rule).

## Edit or delete

Use row actions to reopen the wizard or delete with confirmation.

## Run pending tests

1. Select a site in the page header menu.
2. Select **Run tests** (on **Tests** or on the **Redirect tests** card under **Redirect Rules** — see [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md#redirect-tests-card)).

The **Run tests** dialog runs all tests in that group that do not yet have a result in the current session. Progress shows **Completed** `N`/`total`. When nothing is pending, you see **No tests to run.**

Open a row to view **Test result** in the result dialog, or review status in the **Tests** table.

## Read results in the UI

The **Tests** table and the **Redirect tests** card use status such as pass rate, **Passed**, **Needs attention** (failed and errors), and **Not run**. Wording on the card reflects runs started from the current session.

## Automate instead

Redirect test fixtures are managed through the Management API. See [Redirect tests](../redirect-tests.md) for fields, simulate pairing, and CI patterns.

:::ai-only
Management API: POST/GET `/api/v1/redirect-tests`; PUT/DELETE `/api/v1/redirect-tests/{id}`.
:::

## Related

- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Redirect tests (API)](../redirect-tests.md)
