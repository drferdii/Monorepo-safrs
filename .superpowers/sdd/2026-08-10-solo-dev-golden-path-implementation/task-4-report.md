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
- `AppType` applies Hono `ApplyGlobalResponse` with `500 { json: ApiError }`, so every RPC route advertises the real global error response without widening its existing success or validation response types.

## Red/green evidence

- Red: `pnpm --filter @safrs/api test` failed before `app.ts` and `client.ts` existed with `Cannot find module './app.js'`.
- Green: focused API suite passes 7 tests covering health, list ISO serialization, create, validation envelope, error redaction, correlation ID, and compile-time Hono client request/response inference.
- Follow-up red: API typecheck rejected the missing `ApiError` export and inferred `never` for global `500` RPC responses.
- Follow-up green: focused suite passes 8 tests. Type assertions cover GET `200|500`, POST `201|400|500`, and health `200|500`; an injected thrown store error verifies its response header and body carry the same correlation ID.

## Versions

- `hono`: `4.13.1`
- `zod`: `4.4.3`
- `@hono/zod-validator`: `0.9.0` (replacing incompatible catalog `0.5.0`)

## Commit

- `45fc591 feat: add typed Hono RPC API`
- `5e83efd fix: type global API error responses`

## Verification

- `pnpm install` — passed.
- `pnpm --filter @safrs/api typecheck` — passed.
- `pnpm --filter @safrs/api lint` — passed.
- `pnpm --filter @safrs/api test` — passed, 8/8 tests after the global-error type fix.
- `pnpm lint` — passed.
- `pnpm typecheck` — passed (4 Turbo tasks).
- `pnpm test` — passed (API 7/7; database integration suite remained intentionally skipped without its dedicated database).
- `bash scripts/safrs-verify.sh` — passed; it classifies the combined dirty workspace as R2 and requires independent integrity review because the pre-existing untracked SAFRS bootstrap includes governance controls.

## Concerns

- The supplied workspace was already broadly untracked at base; only the Task 4 files listed above are intended for this commit. The SAFRS R2 classification is caused in part by those pre-existing untracked governance files, which were not changed by Task 4.
