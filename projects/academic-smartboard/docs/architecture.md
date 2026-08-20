# Architecture

Record the project's real components, boundaries, dependencies, critical flows, and failure modes. Link accepted ADRs for material decisions. Do not duplicate root SAFRS policy.

## Generated capsule context

- App binding: `apps/web`
- Selected capabilities: ai
- This wizard creates no application code or package binding.

## Komposisi capsule (target akhir — ADR 0003)

| App | Peran | Status | Asal |
| --- | --- | --- | --- |
| `apps/web` | Aplikasi bimbel multi-tenant (37 halaman) | belum di-port | `frontend/` CRA di repo arsip |
| `apps/site` | Website promo/publik el-Kayyisa (7 halaman) | belum di-port | `landing/` Vite di repo arsip |
| `apps/api` | Backend (24 modul route) | belum di-port | `backend/` FastAPI+Mongo di repo arsip |
| `apps/demo` | Environment demo: seed sintetis + config deploy, tanpa fork kode | belum dibuat | menggantikan `demo/` di repo arsip |

Aset yang sudah bermigrasi:

- `ai/kayyisa/` — knowledge package Kayyisa v3.0.0 (manifest sha256-verified; path sensitif R2)
- `data/curriculum/`, `data/reference/` — data kurikulum dan registri sumber

## Urutan port

`site` → `web` → `api` (per modul di belakang facade) → `demo`.
Satu plan per fase; plan aktif: `docs/plans/active/2026-08-20-smartboard-migration.md`.

Sumber arsip read-only: `D:\Devops\abyss-monorepo\apps\academic\smartboard`.
Riwayat git arsip tidak di-graft (snapshot whitelist, ADR 0003).

## Keputusan material

- ADR 0003 — capsule tunggal, port bertahap, karantina `raw_data/` dan `.env*`.
