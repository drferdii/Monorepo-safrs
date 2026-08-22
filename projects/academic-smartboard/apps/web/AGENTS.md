# apps/web — Aplikasi Smartboard Utama (sub-fase 1/5)

Static export Next.js 16 (`output: "export"`), client-only — tanpa server Next.js,
tanpa env runtime. Auth cookie-session (`session_token` httpOnly, `withCredentials`)
langsung ke backend FastAPI arsip; role-gating dilakukan di komponen client
(`ProtectedRoute`), bukan middleware.

Sub-fase 1 baru mencakup: login, shell ber-navigasi role-aware, satu halaman data
(Master › Murid). 4 sub-fase lain (penjadwalan/akademik, payroll/finance,
komunikasi/operasional, admin platform + Kayyisa AI) belum ditulis — lihat
`docs/plans/active/2026-08-21-smartboard-web-roadmap.md`.

## Aturan kerja

- `NEXT_PUBLIC_BACKEND_URL` WAJIB di-set (env, build-time public) supaya `dev`/`build`
  benar-benar bisa memanggil backend arsip; `NEXT_PUBLIC_DEV_TENANT_SLUG` opsional
  (dev-only, header `X-Tenant-Slug`).
- Semua warna/radius via token `@sentra/token`; app ini dalam scope gate
  `scripts/check-tokens.mjs` (`packages/token/scope.txt`).
- Session `session_token` di-set BACKEND (`Set-Cookie`) — frontend TIDAK PERNAH
  membaca/menyimpan token secara eksplisit (tidak ada `localStorage`, tidak ada
  header `Authorization` manual).
- Risk default R1; perubahan `package.json`/lock/`pnpm-workspace.yaml` = R2
  (sensitive paths).

## Perintah

- `pnpm --filter @sentra/smartboard-web dev|lint|typecheck|test|build|test:build`
