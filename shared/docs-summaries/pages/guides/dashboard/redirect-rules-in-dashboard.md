---
source: shared/docs/pages/guides/dashboard/redirect-rules-in-dashboard.md
generatedAt: 2026-05-30T07:00:29.290Z
model: gpt-4o-mini
---

## Purpose
This document is for users managing redirect rules in the LinkShift dashboard, explaining how to create, edit, and test these rules.

## What this doc covers
- **Before you start**: Requirements for creating redirect rules.
- **Open redirect rules**: Steps to access and filter existing redirect rules.
- **Create a redirect rule**: Detailed steps for creating a new redirect rule through a wizard.
- **Edit or delete**: Instructions for modifying or removing existing redirect rules.
- **After you save a new rule**: What happens after saving a new rule, including testing.
- **Redirect tests card**: Overview of the redirect tests section and how to run tests.
- **What you should see**: Expected outcomes after creating and testing redirect rules.
- **Automate instead**: API endpoints for automating redirect rule management.

## Key workflows and rules
1. **Open Redirect Rules**:
   - Navigate to **Redirect Rules** (`/redirect-rules`).
   - Select a **Domain group** to filter rules.
   - Use search to narrow down the displayed rules.

2. **Create a Redirect Rule**:
   - Select **Add rule** after choosing a domain group.
   - Complete the wizard with the following steps:
     - **Scope**: Set priority for evaluation order.
     - **Match**: Define source path, method, query, and optional link map.
     - **Destination**: Specify target URL or link-map routing.
     - **Status**: Choose HTTP redirect status code.
     - **Summary**: Review all inputs before saving.
   - Click **Create** to save the rule.

3. **Edit or Delete a Rule**:
   - To edit, select the rule and use the same wizard with existing values.
   - To delete, confirm in the dialog titled **Delete redirect rule**.

4. **After Saving a New Rule**:
   - The rule wizard closes and the redirect test wizard opens with prefilled fields.
   - Complete the test wizard and use **Run tests** to execute pending cases.

5. **Redirect Tests Card**:
   - Select a domain group to activate the tests card.
   - Click **Run tests** to execute tests without results in the current session.

## Limits and constraints
- At least one domain group with a domain or subdomain is required to create redirect rules.
- The rules table displays a maximum of **20** rows per page.
- The Management API list default `limit` is also **20**.
- The **Add rule** option is disabled if no domain group is selected.

## Related docs and API areas
- [Redirect rules](../redirect-rules.md) — Overview of redirect rules.
- [Matching and destinations](../redirect-rules-core.md) — Details on matching behavior and destinations.
- [Tests in the dashboard](./tests-in-dashboard.md) — Information on testing redirect rules.
- API Endpoints:
  - `GET /api/v1/redirect-rules`
  - `POST /api/v1/redirect-rules`
  - `PUT /api/v1/redirect-rules`
  - `DELETE /api/v1/redirect-rules`
  - `POST /api/v1/redirect-rules/simulate` — Validate rules before rollout.
