---
source: shared/docs/pages/guides/redirect-tests.md
generatedAt: 2026-06-03T17:00:32.150Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and CI/CD engineers, explaining how to create and manage redirect tests to ensure routing accuracy in LinkShift.

## What this doc covers
- Overview of redirect tests and their purpose
- Fields and structure of a redirect test
- Creating test examples for various scenarios
- CI workflow for running redirect tests
- Limitations and constraints for redirect tests and simulations
- API endpoints related to redirect tests
- Guidelines for when to add or update tests

## Key workflows and rules
1. **Creating a Redirect Test**:
   - Use `POST /api/v1/redirect-tests` with the following fields:
     - `domainGroupId`: ID of the rule set to test against
     - `pathWithQuery`: Full request path including query string
     - `requestData` (optional): Contains method, headers, IP, User-Agent, etc.
     - `expectedResult`: Contains `matched`, `statusCode`, and `target`.

2. **CI Workflow**:
   - **Deploy or Sync Rules**: Apply redirect rules to the target environment.
   - **Load Test Fixtures**: Use `GET /api/v1/redirect-tests?domainGroupId=dmg_prod&limit=100` to retrieve tests.
   - **Build Simulate Payload**: Map tests to simulate entries.
   - **Call Simulate**: Use `POST /api/v1/redirect-rules/simulate` to run tests.
   - **Compare Results**: Validate the results against expected outcomes.
   - **Report Failures**: Output mismatches for debugging.

3. **Testing Dynamic Destinations**:
   - Use fixed inputs for testing non-deterministic rules like `random()` or `time()`.

## Limits and constraints
- **Field Limits**:
  - `pathWithQuery`: Max **16,384** characters
  - `expectedResult.target`: Max **4,096** characters
  - `requestData.userAgent`: Max **512** characters
- **List Limits**:
  - `GET /api/v1/redirect-tests`: Limit of **1–100** per page (default **100**)
- **Simulate Batch Size**: Max **100** entries per `POST /api/v1/redirect-rules/simulate`
- **Authentication**: Requires API key for all requests.
- **CI Pitfalls**: Various errors can occur if domain groups or hostnames are incorrect, or if the organization is suspended.

## Related docs and API areas
- [Redirect rules — simulate](./redirect-rules-operations.md#simulate-before-rollout)
- [Redirect rules — analytics](./redirect-rules-operations.md#analytics)
- [Link maps](./link-maps.md)

### API Endpoints
- `GET /api/v1/redirect-tests`: List tests with parameters `domainGroupId`, `limit`, `search`, `startAfterId`
- `GET /api/v1/redirect-tests/:id`: Retrieve a specific test
- `POST /api/v1/redirect-tests`: Create a new test
- `PUT /api/v1/redirect-tests/:id`: Update an existing test
- `DELETE /api/v1/redirect-tests/:id`: Remove a test
