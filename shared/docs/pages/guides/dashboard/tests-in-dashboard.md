# Tests in the dashboard

Define redirect tests, run pending cases for a domain group, and read pass/fail status from the Tests page or the Redirect Rules summary card.

## Before you start

- At least one domain group with redirect rules you want to validate.
- For fixture design and CI patterns, see [Redirect tests](../redirect-tests.md).

## Open tests

1. In the sidebar, select **Tests** (`/tests`). The page title is **Tests** (*Validate redirect outcomes without leaving the dashboard.*).
2. Choose a **Domain group** in the filter (with one group, the filter selects it automatically) and optionally search by path or query.

The tests table uses a fixed page size of **100** rows per page (no other page-size options).

## Create a test

1. With a domain group selected, select **Add test**.
2. Complete the wizard (nav label → step title):

| Nav label | Step title | Purpose |
|-----------|------------|---------|
| **Scope** | Request scope | Domain group, hostname, path |
| **Request** | Request details | Method, headers, and request details |
| **Expected** | Expected outcome | Expected status and destination |

3. On **Expected outcome**, optionally select **Fetch expected result** (the button shows **Simulating...** while loading). What is returned depends on your rules and environment; for API-side simulate behavior, see [Redirect rules — operations](../redirect-rules-operations.md).

4. On **Expected outcome**, select **Create** to save the test.

## Create a test after saving a new rule

When you save a **new** redirect rule, the dashboard may open this wizard with fields prefilled. See [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md#after-you-save-a-new-rule).

## Edit or delete

Use row actions to reopen the wizard or delete with confirmation.

## Run pending tests

1. Select a domain group.
2. Select **Run tests** (on **Tests** or on the **Redirect tests** card under **Redirect Rules** — see [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md#redirect-tests-card)).

The **Run tests** dialog runs all tests in that group that do not yet have a result in the current session. Progress shows **Completed** `N`/`total`. When nothing is pending, you see **No tests to run.**

Open a row to view **Test result** in the result dialog, or review status in the **Tests** table.

## Read results in the UI

The **Tests** table and the **Redirect tests** card use status such as pass rate, **Passed**, **Needs attention** (failed and errors), and **Not run**. Wording on the card reflects runs started from the current session.

## What you should see

- New tests listed for the active domain group.
- Updated pass rate and counts after **Run tests** completes.

## Automate instead

Redirect test fixtures use the Management API on `/api/v1/redirect-tests`:

- `POST /api/v1/redirect-tests` — create
- `GET /api/v1/redirect-tests` — list
- `PUT /api/v1/redirect-tests/{id}` — update
- `DELETE /api/v1/redirect-tests/{id}` — delete

See [Redirect tests](../redirect-tests.md) for fields, simulate pairing, and CI patterns.

## Related

- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Redirect tests (API)](../redirect-tests.md)
