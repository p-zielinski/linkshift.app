---
source: shared/docs/pages/guides/redirect-tests.md
generatedAt: 2026-05-28T15:50:44.154Z
model: gpt-4o-mini
---

## Purpose
This document is for developers implementing redirect tests in CI/CD pipelines to ensure expected routing outcomes.

## What this doc covers
- Overview of redirect tests and their purpose
- Detailed explanation of the test model including fields like `domainGroupId`, `pathWithQuery`, `requestData`, and `expectedResult`
- Examples of creating redirect tests for various scenarios
- CI workflow for deploying and validating redirect tests
- Limitations and constraints of the simulate functionality
- Guidelines for testing dynamic destinations and A/B rules
- Recommendations for when to add or update tests

## Key workflows and rules
1. **Create Redirect Test**: 
   - Use `POST /api/v1/redirect-tests` with fields:
     - `domainGroupId`: Required
     - `pathWithQuery`: Required
     - `requestData`: Optional
     - `expectedResult`: Required
2. **CI Workflow**:
   - Deploy or sync rules to the target environment.
   - Load test fixtures using `GET /api/v1/redirect-tests?domainGroupId=dmg_prod&limit=100`.
   - Build simulate payload from loaded fixtures.
   - Call `POST /api/v1/redirect-rules/simulate` with the simulate payload.
   - Compare results against expected outcomes.
   - Report mismatches in the pipeline.
3. **Handling Pagination**: If more than 100 tests exist, paginate using `startAfterId`.

## Limits and constraints
- `pathWithQuery`: Max **16,384** characters.
- `expectedResult.target`: Max **4,096** characters.
- `requestData.userAgent`: Max **512** characters.
- Simulate batch size: Max **100** entries per `POST /api/v1/redirect-rules/simulate`.
- List API limits: `limit` can be 1–**100** per page.
- Authentication is required via `X-API-Key`.

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
