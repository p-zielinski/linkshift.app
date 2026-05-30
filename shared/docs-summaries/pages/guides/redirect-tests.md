---
source: shared/docs/pages/guides/redirect-tests.md
generatedAt: 2026-05-30T07:03:20.269Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and CI/CD engineers, explaining how to create and run redirect tests to ensure routing outcomes are as expected.

## What this doc covers
- Overview of redirect tests and their purpose
- Structure of a redirect test model
- Creating redirect test examples
- CI workflow for running redirect tests
- Limitations and constraints for testing
- API endpoints for managing redirect tests
- Guidelines for when to add or update tests

## Key workflows and rules
1. **Creating a Redirect Test**:
   - Use `POST /api/v1/redirect-tests` with the following fields:
     - `domainGroupId`: ID of the rule set.
     - `pathWithQuery`: Full request path (max 16,384 characters).
     - `requestData`: Optional fields including `method`, `hostname`, `ip`, `userAgent`, `headers`, and `query`.
     - `expectedResult`: Fields include `matched` (boolean), `statusCode` (100–599), and `target` (max 4,096 characters).

2. **CI Workflow**:
   - Deploy or sync redirect rules.
   - Load test fixtures using `GET /api/v1/redirect-tests?domainGroupId=dmg_prod&limit=100`.
   - Build a simulate payload from loaded tests.
   - Call `POST /api/v1/redirect-rules/simulate` with the payload.
   - Compare results from the simulation with expected results.
   - Report discrepancies in the CI pipeline.

3. **Simulate Limitations**:
   - Be aware of potential issues such as invalid hostnames, unknown domain groups, and organization access limitations that can cause the entire request to fail.

## Limits and constraints
- **Field Limits**:
  - `pathWithQuery`: Max 16,384 characters.
  - `expectedResult.target`: Max 4,096 characters.
  - `requestData.userAgent`: Max 512 characters.
- **Pagination**: 
  - List API supports 1–100 entries per page (default 100).
- **Simulate Batch Size**: 
  - Max 100 entries per `POST /api/v1/redirect-rules/simulate`.
- **Authentication**: 
  - Requires API key for all requests.

## Related docs and API areas
- [Redirect rules — simulate](./redirect-rules-operations.md#simulate-before-rollout)
- [Redirect rules — analytics](./redirect-rules-operations.md#analytics)
- [Link maps](./link-maps.md)
- API Endpoints:
  - `GET /api/v1/redirect-tests`: List tests.
  - `GET /api/v1/redirect-tests/:id`: Get a specific test.
  - `POST /api/v1/redirect-tests`: Create a new test.
  - `PUT /api/v1/redirect-tests/:id`: Update an existing test.
  - `DELETE /api/v1/redirect-tests/:id`: Delete a test.
