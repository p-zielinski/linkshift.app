---
source: shared/docs/pages/guides/redirect-tests.md
generatedAt: 2026-06-07T10:08:02.278Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and CI/CD engineers, explaining how to create and manage redirect tests to ensure routing accuracy in LinkShift.

## What this doc covers
- Overview of redirect tests and their purpose
- Detailed description of the redirect test model, including fields and their purposes
- Instructions for creating test examples
- CI workflow for running redirect tests
- Limitations and constraints related to redirect tests and simulations
- API endpoints for managing redirect tests
- Related guides for further reading

## Key workflows and rules
1. **Creating a Redirect Test**:
   - Use `POST /api/v1/redirect-tests` with the following fields:
     - `domainGroupId`: ID of the rule set to test against
     - `pathWithQuery`: Full request path including query string
     - `requestData` (optional): Includes method, headers, IP, User-Agent, etc.
     - `expectedResult`: Contains `matched`, `statusCode`, and `target`.

2. **CI Workflow**:
   - **Deploy or Sync Rules**: Apply redirect rules to the target environment.
   - **Load Test Fixtures**: Use `GET /api/v1/redirect-tests?domainGroupId=dmg_prod&limit=100` to retrieve tests.
   - **Build Simulate Payload**: Map tests to simulate entries.
   - **Call Simulate**: Use `POST /api/v1/redirect-rules/simulate` to run the tests.
   - **Compare Results**: Validate the results against expected outcomes.
   - **Report**: Include details of any mismatches in the output.

3. **Simulate Limitations**:
   - Be aware of potential issues such as invalid hostnames, unknown domain groups, and organization access limitations that can cause failures in the CI process.

## Limits and constraints
- `pathWithQuery`: Max **16,384** characters.
- `expectedResult.target`: Max **4,096** characters.
- `requestData.userAgent`: Max **512** characters.
- List API limits: **1–100** entries per page (default **100**).
- Simulate batch size: Max **100** entries per `POST /api/v1/redirect-rules/simulate`.
- Authentication is required via API keys for all requests.

## Related docs and API areas
- [Redirect rules — simulate](./redirect-rules-operations.md#simulate-before-rollout)
- [Redirect rules — analytics](./redirect-rules-operations.md#analytics)
- [Link maps](./link-maps.md)
- API Endpoints:
  - `GET /api/v1/redirect-tests`
  - `GET /api/v1/redirect-tests/:id`
  - `POST /api/v1/redirect-tests`
  - `PUT /api/v1/redirect-tests/:id`
  - `DELETE /api/v1/redirect-tests/:id`
