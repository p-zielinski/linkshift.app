---
source: shared/docs/pages/guides/dashboard/redirect-rules-in-dashboard.md
generatedAt: 2026-06-03T16:58:13.613Z
model: gpt-4o-mini
---

## Purpose
This document is for users who need to create and manage redirect rules from the dashboard, including filtering by domain group and running redirect tests.

## What this doc covers
- Overview of creating and maintaining redirect rules in the dashboard.
- Steps to open redirect rules and filter by domain group.
- Detailed process for creating a redirect rule through a wizard.
- Instructions for editing or deleting existing redirect rules.
- Information on redirect tests and how to run them.
- Automation options and related API documentation.

## Key workflows and rules
1. **Open Redirect Rules**:
   - Navigate to **Redirect Rules** in the sidebar.
   - Select a **Domain group** to filter rules.
   - Optionally use search to narrow the displayed rules.

2. **Create a Redirect Rule**:
   - Select **Add rule** after choosing a domain group.
   - Follow the wizard through the following steps:
     - **Scope**: Set priority for evaluation order.
     - **Match**: Define source path, method, query, and optional link map.
     - **Destination**: Specify target URL or link-map routing.
     - **Status**: Choose HTTP redirect status code.
     - **Summary**: Review all settings before saving.
   - Click **Create** to save the rule.

3. **Edit or Delete a Rule**:
   - To **Edit**, select the rule and use the same wizard with pre-filled values.
   - To **Delete**, confirm in the dialog titled **Delete redirect rule**.

4. **After Saving a New Rule**:
   - The rule wizard closes and the redirect test wizard opens with prefilled fields.
   - Complete the test wizard and select **Run tests** to execute pending cases.

5. **Redirect Tests Card**:
   - Select a domain group to activate the tests card.
   - Click **Run tests** to execute tests that have not yet been run in the session.

## Limits and constraints
- A minimum of one **domain group** with an attached **domain or subdomain** is required for rules to function on live traffic.
- The rules table displays a fixed limit of **20 rows per page**.
- The Management API list default limit is also **20**.
- Variable tokens for dynamic destinations only appear if the team uses them.

## Related docs and API areas
- [Redirect rules (API index)](../redirect-rules.md) - for CRUD operations and simulation.
- [Matching and destinations](../redirect-rules-core.md) - details on rule fields.
- [Validation, simulate, and analytics](../redirect-rules-operations.md) - for pre-rollout validation.
- [Redirect engine variables](../../concepts/redirect-engine-variables.md) - for dynamic destination placeholders.
- [Link maps in the dashboard](./link-maps-in-dashboard.md) - for managing link maps.
- [Tests in the dashboard](./tests-in-dashboard.md) - for executing and managing tests.
- [Redirect rules — link maps](../redirect-rules-link-maps.md) - for link map specifics.
