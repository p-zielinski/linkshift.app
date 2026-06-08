---
source: shared/docs/pages/guides/redirect-tests.md
generatedAt: 2026-06-08T20:11:49.243Z
model: gpt-4o-mini
---

## Purpose
This document is for developers and CI/CD engineers, explaining how to create and manage redirect tests to ensure routing accuracy in LinkShift.

## What this doc covers
- Overview of redirect tests and their purpose
- Detailed structure of a redirect test, including fields like `domainGroupId`, `pathWithQuery`, `requestData`, and `expectedResult`
- Examples of creating different types of redirect tests
- CI workflow for running redirect tests
- Limitations and constraints related to redirect tests and simulations
- API endpoints for managing redirect tests
- Related guides for further reading

## Key workflows and rules
1. **Creating a Redirect Test**:
   - Use `POST /api/v1/redirect-tests` with a JSON body containing:
     - `domainGroupId`: ID of the rule set
     - `pathWithQuery`: Full request path with query (max 16,384 characters)
     - `expectedResult`: Object with `matched`, `statusCode`, and `target` (max 4,096 characters)

2. **Running Redirect Tests in CI**:
   - Deploy or sync redirect rules to the target environment.
   - Load test fixtures using `GET /api/v1/redirect-tests?domainGroupId=dmg_prod&limit=100`.
   - Build a simulate payload from the loaded tests.
   - Call `POST /api/v1/redirect-rules/simulate` with the payload.
   - Compare the results with expected outcomes and report discrepancies.

3. **Handling CI Pitfalls**:
   - Ensure valid `hostname` and `domainGroupId` to avoid `400` errors.
   - Check for organization access to avoid `402` errors.
   - Split simulate calls by hostname if mixed hostnames are present.

## Limits and constraints
- **Field Limits**:
  - `pathWithQuery`: Max 16,384 characters
  - `expectedResult.target`: Max 4,096 characters
  - `requestData.userAgent`: Max 512 characters
- **Pagination**: 
  - List API supports a limit of 1–100 entries per page.
- **Simulate Batch Size**: 
  - Max 100 entries per `POST /api/v1/redirect-rules/simulate`.
- **Authentication**: 
  - Requires API key for all requests.
- **Simulate Limitations**:
  - Certain checks (like blacklist checks) are not performed in simulation.
  - Invalid `hostname` or unknown `domainGroupId` results in a `400` error for the entire request.

## Related docs and API areas
- [Redirect rules — simulate](./redirect-rules-operations.md#simulate-before-rollout)
- [Redirect rules — analytics](./redirect-rules-operations.md#analytics)
- [Link maps](./link-maps.md)

## API endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/redirect-tests` | List tests with parameters for filtering and pagination |
| `GET` | `/api/v1/redirect-tests/:id` | Retrieve a specific test by ID |
| `POST` | `/api/v1/redirect-tests` | Create a new redirect test |
| `PUT` | `/api/v1/redirect-tests/:id` | Update an existing redirect test |
| `DELETE` | `/api/v1/redirect-tests/:id` | Delete a redirect test by ID |
