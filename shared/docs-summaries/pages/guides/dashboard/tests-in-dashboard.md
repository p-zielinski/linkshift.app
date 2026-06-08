---
source: shared/docs/pages/guides/dashboard/tests-in-dashboard.md
generatedAt: 2026-06-08T20:09:05.761Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard who want to define and manage redirect tests for their sites.

## What this doc covers
- **Open tests**: Instructions for selecting a site and viewing tests.
- **Create a test**: Steps to add a new redirect test including required fields.
- **Create a test after saving a new rule**: Information on how to create a test immediately after saving a new redirect rule.
- **Edit or delete**: Guidance on how to edit or delete existing tests.
- **Run pending tests**: Steps to execute tests that have not yet been run in the current session.
- **Read results in the UI**: Explanation of how to interpret test results in the dashboard.
- **Automate instead**: Overview of managing redirect test fixtures through the Management API.

## Key workflows and rules
1. **Open tests**:
   - Navigate to **Tests** in the sidebar.
   - Select a **Site** from the page header menu.
   - Use the paginator to navigate through test results.

2. **Create a test**:
   - Select **Add test** after choosing a site.
   - Fill in the **Scope**, **Request**, and **Expected** fields.
   - Optionally fetch the expected result.
   - Click **Create** to save the test.

3. **Create a test after saving a new rule**:
   - After saving a new redirect rule, the wizard may open with prefilled fields for creating a test.

4. **Edit or delete**:
   - Use row actions to reopen the test creation wizard or delete a test with confirmation.

5. **Run pending tests**:
   - Select a site and click **Run tests**.
   - The dialog will show progress as tests are executed, indicating completed tests.

6. **Read results in the UI**:
   - View the **Tests** table and **Redirect tests** card for statuses like **Passed**, **Needs attention**, and **Not run**.

## Limits and constraints
- At least one site with redirect rules is required to run tests.
- The **Run tests** function executes pending cases only for the selected site in the current session.
- The **All sites** option is not available; a specific site must be selected to view tests.

## Related docs and API areas
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Redirect tests (API)](../redirect-tests.md)
- Management API endpoints: 
  - `POST /api/v1/redirect-tests`
  - `GET /api/v1/redirect-tests`
  - `PUT /api/v1/redirect-tests/{id}`
  - `DELETE /api/v1/redirect-tests/{id}`
