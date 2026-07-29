# Contributing to LinkShift.app

Thanks for contributing. This repo is MIT-licensed open source. Keep changes focused and match existing patterns.

## Before you start

1. Read [README.md](./README.md) for local setup.
2. Backend conventions: [backend/CODING_STANDARDS.md](./backend/CODING_STANDARDS.md)
3. Frontend conventions: [frontend/CODING_STANDARDS.md](./frontend/CODING_STANDARDS.md)
4. Architecture map: [AI_CONTEXT.md](./AI_CONTEXT.md)

## Local development

- **Postgres + Redis:** `docker compose up -d` from the repo root
- **Backend:** Bun in `backend/` (`bun install`, `bun run start:dev` or `start:dev-offline`)
- **Frontend:** npm **10.9.4** via Corepack in `frontend/` (`npm install`, `npm run start`)
- **Tools API (optional):** Bun in `backend-tools/`

Copy `.env.example` files; **never commit** `.env`, `deploy/stack.env`, or Dozzle user YAML.

## Tests

Non-trivial business logic should have automated tests (services, validators, billing limits, guards, store derivation). Prefer extending existing `*.spec.ts` files in the same module.

```bash
cd backend && bun run test
cd frontend && npm run test
cd backend-tools && bun run test
```

## Pull requests

- One concern per PR when practical
- Update OpenAPI when API behavior changes: `shared/docs/openapi/linkshift-api-keys.openapi.yaml`, then `npm run docs:sync` from the repo root
- Do not hand-edit `frontend/src/app/features/documentation/generated/*`
- After `backend/package.json` changes, commit `backend/bun.lock`
- Keep secrets out of the diff

## Security reports

Do not open public issues for vulnerabilities. See [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the MIT License ([LICENSE](./LICENSE)).
