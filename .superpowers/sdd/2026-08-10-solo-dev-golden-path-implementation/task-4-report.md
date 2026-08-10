# Task 4 Report: Typed Hono RPC API

## Scope

- Added `@safrs/api` with typed Hono routes for `GET /api/health`, `GET /api/demos`, and `POST /api/demos`.
- Updated the workspace catalog and lockfile for the compatible validator version.

## Files

- `packages/api/package.json`
- `packages/api/tsconfig.json`
- `packages/api/src/app.ts`
- `packages/api/src/client.ts`
- `packages/api/src/error.ts`
- `packages/api/src/index.ts`
- `packages/api/src/app.test.ts`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`

## Design decisions

- `createApp({ getStore })` permits a test store; the public `app` lazily imports Prisma only when a demo route requires it. Importing the package, health checks, and validation tests therefore do not eagerly require environment validation.
- The Hono route chain and explicit HTTP status literals retain `AppType` RPC inference. `ApiClient` is precomputed, while `createApiClient` creates clients for a supplied base URL.
- Zod 4 validation uses `z.flattenError`; validation and internal errors use the common schema envelope and include a generated `x-correlation-id`. Internal errors deliberately omit thrown-error details.

## Red/green evidence

- Red: `pnpm --filter @safrs/api test` failed before `app.ts` and `client.ts` existed with `Cannot find module './app.js'`.
- Green: focused API suite passes 7 tests covering health, list ISO serialization, create, validation envelope, error redaction, correlation ID, and compile-time Hono client request/response inference.

## Versions

- `hono`: `4.13.1`
- `zod`: `4.4.3`
- `@hono/zod-validator`: `0.9.0` (replacing incompatible catalog `0.5.0`)

## Verification

- `pnpm install` — passed.
- `pnpm --filter @safrs/api typecheck` — passed.
- `pnpm --filter @safrs/api lint` — passed.
- `pnpm --filter @safrs/api test` — passed, 7/7 tests.
- `pnpm lint` — passed.
- `pnpm typecheck` — passed (4 Turbo tasks).
- `pnpm test` — passed (API 7/7; database integration suite remained intentionally skipped without its dedicated database).
- `bash scripts/safrs-verify.sh` — passed; it classifies the combined dirty workspace as R2 and requires independent integrity review because the pre-existing untracked SAFRS bootstrap includes governance controls.

## Concerns

- The supplied workspace was already broadly untracked at base; only the Task 4 files listed above are intended for this commit. The SAFRS R2 classification is caused in part by those pre-existing untracked governance files, which were not changed by Task 4.
