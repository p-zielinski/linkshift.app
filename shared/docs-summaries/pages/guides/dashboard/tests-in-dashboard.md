---
source: shared/docs/pages/guides/dashboard/tests-in-dashboard.md
generatedAt: 2026-06-03T16:58:21.757Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard who need to define and manage redirect tests for domain groups.

## What this doc covers
- Overview of the **Tests** page for validating redirect outcomes.
- Steps to **Open tests** and filter by domain group.
- Instructions to **Create a test** including the wizard steps and fields.
- Process for **Editing or deleting** tests.
- How to **Run pending tests** and view results.
- Explanation of the **Tests** table and **Redirect tests** card status indicators.
- Automation options for managing redirect test fixtures through the Management API.

## Key workflows and rules
1. **Open tests**:
   - Navigate to **Tests** in the sidebar.
   - Select a **Domain group** and optionally search by path or query.
   - The tests table displays a maximum of **100 rows per page**.

2. **Create a test**:
   - Select **Add test** after choosing a domain group.
   - Complete the wizard:
     - **Scope**: Define request scope (domain group, hostname, path).
     - **Request**: Specify method, headers, and request details.
     - **Expected**: Set expected status and destination; optionally fetch expected results.
   - Click **Create** to save the test.

3. **Create a test after saving a new rule**:
   - The wizard may open automatically with prefilled fields after saving a new redirect rule.

4. **Edit or delete a test**:
   - Use row actions to reopen the wizard or delete the test with confirmation.

5. **Run pending tests**:
   - Select a domain group and click **Run tests**.
   - The dialog will execute all tests without results in the current session, showing progress as **Completed** `N`/`total`.
   - If no tests are pending, the message **No tests to run** will be displayed.

6. **Read results in the UI**:
   - The **Tests** table and **Redirect tests** card display status indicators such as **Passed**, **Needs attention**, and **Not run**.

## Limits and constraints
- The tests table has a fixed page size of **100 rows**.
- The **Run tests** feature executes only tests that do not have results in the current session.
- Users must have at least one **domain group** with redirect rules to run tests.

## Related docs and API areas
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Redirect tests (API)](../redirect-tests.md)
- Management API endpoints:
  - `POST /api/v1/redirect-tests`
  - `GET /api/v1/redirect-tests`
  - `PUT /api/v1/redirect-tests/{id}`
  - `DELETE /api/v1/redirect-tests/{id}`
