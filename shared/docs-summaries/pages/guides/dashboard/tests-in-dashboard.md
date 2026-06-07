---
source: shared/docs/pages/guides/dashboard/tests-in-dashboard.md
generatedAt: 2026-06-07T10:05:49.252Z
model: gpt-4o-mini
---

## Purpose
This document is for users of the LinkShift dashboard who need to define and manage redirect tests for their sites.

## What this doc covers
- **Open tests**: Instructions on how to access and view tests for a selected site.
- **Create a test**: Steps to define a new redirect test including scope, request, and expected results.
- **Create a test after saving a new rule**: Guidance on creating a test immediately after saving a new redirect rule.
- **Edit or delete**: Instructions on how to edit or delete existing tests.
- **Run pending tests**: Steps to execute tests that have not yet been run in the current session.
- **Read results in the UI**: Overview of how to interpret test results displayed in the dashboard.
- **Automate instead**: Information on managing redirect test fixtures through the Management API.

## Key workflows and rules
### Open tests
1. Select **Tests** from the sidebar.
2. Choose a **Site** from the page header menu and optionally search by path or query.
3. Use the table footer paginator to navigate through pages or adjust rows per page.

### Create a test
1. With a site selected, click **Add test**.
2. Fill out the **Scope** (site, hostname, path), **Request** (method and headers), and **Expected** (status and destination).
3. Optionally select **Fetch expected result** to simulate loading.
4. Click **Create** to save the test.

### Run pending tests
1. Select a site from the page header menu.
2. Click **Run tests** on the **Tests** page or the **Redirect tests** card.
3. The **Run tests** dialog will execute all tests without results in the current session, showing progress as **Completed** `N`/`total`.

### Read results in the UI
- The **Tests** table and **Redirect tests** card display statuses such as **Passed**, **Needs attention**, and **Not run**.

## Limits and constraints
- At least one site with redirect rules is required to run tests.
- The **All sites** option is not available; a specific site must be selected.
- The **Run tests** dialog only runs tests that do not have a result in the current session.

## Related docs and API areas
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Redirect tests (API)](../redirect-tests.md)
- Management API endpoints:
  - `POST /api/v1/redirect-tests`
  - `GET /api/v1/redirect-tests`
  - `PUT /api/v1/redirect-tests/{id}`
  - `DELETE /api/v1/redirect-tests/{id}`
