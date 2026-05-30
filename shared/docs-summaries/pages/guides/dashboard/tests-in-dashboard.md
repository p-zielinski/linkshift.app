---
source: shared/docs/pages/guides/dashboard/tests-in-dashboard.md
generatedAt: 2026-05-30T07:00:44.943Z
model: gpt-4o-mini
---

## Purpose
This document is for users who want to define and manage redirect tests within the LinkShift dashboard.

## What this doc covers
- **Before you start**: Requirements for setting up redirect tests.
- **Open tests**: Instructions for accessing the Tests page and filtering domain groups.
- **Create a test**: Step-by-step guide to adding a new redirect test.
- **Create a test after saving a new rule**: How to create a test immediately after saving a new redirect rule.
- **Edit or delete**: Instructions for modifying or removing existing tests.
- **Run pending tests**: Steps to execute tests that have not yet been run.
- **Read results in the UI**: How to interpret the results displayed in the Tests table and Redirect tests card.
- **What you should see**: Expected outcomes after running tests.
- **Automate instead**: Overview of using the Management API for redirect tests.

## Key workflows and rules
1. **Open Tests**:
   - Navigate to **Tests** (`/tests`).
   - Select a **Domain group** and optionally filter by path or query.
   - The tests table displays a maximum of **100** rows per page.

2. **Create a Test**:
   - Select **Add test** after choosing a domain group.
   - Complete the wizard:
     - **Scope**: Define the request scope (domain group, hostname, path).
     - **Request**: Specify method, headers, and request details.
     - **Expected**: Set expected status and destination; optionally fetch expected results.
   - Click **Create** to save the test.

3. **Run Pending Tests**:
   - Select a domain group.
   - Click **Run tests** to execute all tests without results in the current session.
   - Progress is displayed as **Completed** `N`/`total`.

4. **Read Results**:
   - Check the **Tests** table and **Redirect tests** card for status indicators like **Passed**, **Needs attention**, and **Not run**.

## Limits and constraints
- The tests table has a fixed page size of **100** rows.
- The **Run tests** dialog only executes tests that do not have results in the current session.
- The dashboard may prefill fields in the test creation wizard if a new redirect rule is saved.

## Related docs and API areas
- [Redirect rules in the dashboard](./redirect-rules-in-dashboard.md)
- [Redirect rules — operations](../redirect-rules-operations.md)
- [Redirect tests (API)](../redirect-tests.md)
- Management API endpoints:
  - `POST /api/v1/redirect-tests` — create a redirect test.
  - `GET /api/v1/redirect-tests` — list redirect tests.
  - `PUT /api/v1/redirect-tests/{id}` — update a redirect test.
  - `DELETE /api/v1/redirect-tests/{id}` — delete a redirect test.
