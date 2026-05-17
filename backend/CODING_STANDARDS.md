# Backend Coding Standards

## Architecture and Responsibilities
- Keep controllers thin: auth, guard usage, request validation, logging, and mapping domain errors to HTTP responses.
- Keep business logic in services (`*.service.ts`), not in controllers.
- Keep multi-entity writes in a single transaction when partial writes would break consistency.
- Prefer explicit, descriptive method names that reflect backend intent (`createDomainGroup`, `checkSubdomainLimit`, `invalidateDomainCache`).

## Validation and DTOs
- Define API input schemas in `backend/src/zod-schames` and validate them via `ZodPipe` in controllers.
- Use strict schemas (`.strict()`) for auth/security-sensitive payloads to reject unknown fields.
- Reuse `getEntityIdRegex(...)` and `AppEntity` prefixes for ID-format validation.
- Normalize user-provided values before persistence (for example emails and hostnames).

## Errors and Request Context
- Use typed shared errors from `@shared/models/error.model`.
- Convert domain errors with `throwHttpException(...)` to keep API error shape consistent.
- Always include `requestId` from `ClsService` in backend error payloads and logs.
- Prefer specific errors (`NotFoundError`, `ConflictError`, `ForbiddenError`, `UnauthorizedError`) over generic ones.

## Security and Access Control
- Enforce organization scoping in all reads/writes (`organizationId` + `deletedAt: null`).
- Validate restricted names via dedicated blacklist services before create/update operations.
- Keep auth-protected endpoints behind `AuthGuard` or `ApiOrUserAuthGuard`.
- Treat API input as untrusted: validate, normalize, and only then persist.

## Data Layer (Prisma)
- Use `createCustomCuid(AppEntity.X)` for IDs instead of ad-hoc ID generation.
- Follow soft-delete conventions (`deletedAt`) and filter out deleted records in queries.
- Check existence and ownership before updates/deletes.
- Keep transactional code minimal and deterministic (prepare/normalize data before transaction where possible).

## Caching and Invalidation
- Cache canonical entities through `CacheManagerService` (`setDataExist`, `setDataFalse`) after writes.
- Invalidate redirect/domain cache after domain, subdomain, domain group, and redirect rule changes.
- Avoid bypassing cache invalidation paths when adding new write operations.

## Logging and Observability
- Log each controller action with `nestjs-pino` logger and include `requestId`.
- Include key business identifiers in logs (for example `organizationId`, `domainGroupId`, `ruleId`) without leaking secrets.
- Keep logs structured and machine-parsable; avoid free-form debug dumps in production paths.

## API Contract and Documentation
- Any API behavior or contract change must be reflected in `frontend/public/linkshift-api-keys.openapi.yaml`.
- After API-related changes, regenerate frontend docs from the `frontend` folder using:
  - `npm run docs:sync` (script: `node scripts/sync-documentation.mjs`)
- Treat OpenAPI sync as part of done criteria for backend API work.
