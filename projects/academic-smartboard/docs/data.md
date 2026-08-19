# Data

Record actual data classes, ownership, retention, privacy constraints, environments, and migration rules. Identify production and safety-critical data as R3 surfaces.

## Generated capsule context

- Sensitive domains: education
- Computed risk: R1
- No credentials, production data, or environment entries are created.

## Data yang ada di capsule

- `data/curriculum/`: master kurikulum + hierarki + capaian pembelajaran (publik, R1)
- `data/reference/`: registri lisensi dan sumber (publik, R1)
- `data/synthetic/`: seed demo — HANYA data generate, lihat `data/synthetic/README.md`
- `ai/kayyisa/runtime/knowledge/`: JSONL knowledge pack, integritas dijaga
  `manifest.json` (sha256); perubahan terklasifikasi R2 via `.safrs/sensitive-paths.json`
  (pola `projects/**/ai/**`)

## Data yang DILARANG masuk

`raw_data/` repo arsip (nama siswa, email tentor, gaji, pembagian tim) — R3,
karantina permanen per ADR 0003. Semua `.env*` repo arsip juga dikarantina.

## Penyimpanan runtime (target port)

Postgres via Prisma 7 (`packages/database`) — menggantikan MongoDB multi-tenant
repo arsip. Skema per modul dirancang di plan fase api.
