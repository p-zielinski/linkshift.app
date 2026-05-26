---
source: shared/docs/pages/guides/redirect-tests.md
generatedAt: 2026-05-26T21:11:19.081Z
model: gpt-4o-mini
---

## Purpose
This document is for developers implementing redirect tests in CI/CD workflows to ensure expected routing outcomes.

## What this doc covers
- Overview of redirect tests and their purpose
- Detailed explanation of the test model, including fields like `domainGroupId`, `pathWithQuery`, `requestData`, and `expectedResult`
- Instructions for creating various test examples (static redirects, link map short links, conditional routing)
- CI workflow for integrating redirect tests into deployment pipelines
- Limitations and constraints related to testing and simulation
- Guidelines for when to add or update tests

## Key workflows and rules
1. **Deploy or sync rules**: Apply redirect rules to the target environment.
2. **Load test fixtures**: Use `GET /api/v1/redirect-tests?domainGroupId=dmg_prod&limit=100` to retrieve tests. Paginate if more than 100 tests exist.
3. **Build simulate payload**: Map each test to a simulate entry.
4. **Call simulate**: Use `POST /api/v1/redirect-rules/simulate` to simulate the tests.
5. **Compare results**: Validate that the results match the expected outcomes.
6. **Report**: Include details of any mismatches in the failure output.

## Limits and constraints
- `pathWithQuery`: Max **16,384** characters.
- `expectedResult.target`: Max **4,096** characters.
- `requestData.userAgent`: Max **512** characters.
- List API limits: `limit` of **1–100** per page, default **100**.
- Simulate batch size: Max **100** entries per `POST /api/v1/redirect-rules/simulate`.
- Authentication is required for API calls (use `X-API-Key`).

## Related docs and API areas
- [Redirect rules — simulate](./redirect-rules.md#simulate-before-rollout)
- [Redirect rules — analytics](./redirect-rules.md#analytics)
- [Link maps](./link-maps.md)

## API endpoints
- `GET /api/v1/redirect-tests`: List tests with parameters `domainGroupId`, `limit`, `search`, `startAfterId`.
- `GET /api/v1/redirect-tests/:id`: Retrieve a specific test by ID.
- `POST /api/v1/redirect-tests`: Create a new test.
- `PUT /api/v1/redirect-tests/:id`: Update an existing test.
- `DELETE /api/v1/redirect-tests/:id`: Delete a test by ID.
