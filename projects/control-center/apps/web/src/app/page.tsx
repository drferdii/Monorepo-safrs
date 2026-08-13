import { readRegistry } from "../lib/repo/registry.ts";
import type { ConnectionStatus, ResolvedFeature } from "../lib/repo/types.ts";

/**
 * The dashboard reads the repository on every request. Caching would let it
 * report a state that no longer exists, which is the one thing this page must
 * never do.
 */
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connected: "Terhubung",
  "partially-connected": "Terhubung sebagian",
  "not-yet-connected": "Belum terhubung",
  "requires-configuration": "Perlu konfigurasi",
  "requires-human-action": "Perlu keputusan Anda",
  error: "Bermasalah",
};

const AREA_LABEL: Record<string, string> = {
  governance: "Tata kelola",
  automation: "Otomasi",
  tooling: "Perkakas",
  packages: "Paket bersama",
  apps: "Aplikasi",
  data: "Data dan pengetahuan",
  knowledge: "Dokumentasi",
  quality: "Mutu dan pengujian",
};

/** Order that puts what needs attention at the top. */
const STATUS_ORDER: ConnectionStatus[] = [
  "error",
  "requires-human-action",
  "requires-configuration",
  "partially-connected",
  "not-yet-connected",
  "connected",
];

function byAttention(a: ResolvedFeature, b: ResolvedFeature): number {
  const delta = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  return delta !== 0 ? delta : a.name.localeCompare(b.name, "id");
}

export default async function Page() {
  const snapshot = await readRegistry();
  const features = [...snapshot.features].sort(byAttention);
  const needsAttention = features.filter(
    (feature) => feature.status !== "connected",
  );

  const readAt = new Date(snapshot.readAt).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="shell">
      <header className="page-header">
        <p className="eyebrow">Sentra Control Center</p>
        <h1>Keadaan repository Anda saat ini</h1>
        <p className="lede">
          Halaman ini membaca repository secara langsung setiap kali dibuka.
          Yang tertulis di sini adalah apa yang benar-benar ada di disk dan di
          git — bukan ringkasan yang ditulis sebelumnya.
        </p>

        <div className="meta-rail">
          <div>
            <span className="meta-label">Branch</span>
            <span className="meta-value">{snapshot.git.branch}</span>
          </div>
          <div>
            <span className="meta-label">Commit</span>
            <span className="meta-value">{snapshot.git.head}</span>
          </div>
          <div>
            <span className="meta-label">Perubahan belum disimpan</span>
            <span className="meta-value">{snapshot.git.dirtyPaths} berkas</span>
          </div>
          <div>
            <span className="meta-label">Dibaca pada</span>
            <span className="meta-value">{readAt}</span>
          </div>
        </div>
      </header>

      <section className="section">
        <h2>Ringkasan</h2>
        <p>
          {snapshot.features.length} fitur terdaftar.{" "}
          {needsAttention.length === 0
            ? "Semuanya terhubung dan terbaca."
            : `${needsAttention.length} di antaranya membutuhkan perhatian Anda.`}
        </p>

        <div className="summary-grid">
          {STATUS_ORDER.filter((status) => snapshot.counts[status] > 0).map(
            (status) => (
              <div className="summary-tile" key={status}>
                <span className="count">{snapshot.counts[status]}</span>
                <span className="label">{STATUS_LABEL[status]}</span>
              </div>
            ),
          )}
        </div>

        {snapshot.problems.length > 0 ? (
          <ul className="problem-list">
            {snapshot.problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {snapshot.git.unmergedBranches.length > 0 ? (
        <section className="section">
          <h2>Pekerjaan yang belum digabungkan ke main</h2>
          <p>
            Branch berikut memuat commit yang belum ada di <code>main</code>.
            Fitur yang kodenya ada di sana tetap ditampilkan di bawah, dengan
            status yang jujur.
          </p>
          <ul>
            {snapshot.git.unmergedBranches.map((branch) => (
              <li key={branch.name}>
                <code>{branch.name}</code> — {branch.commitsAhead} commit
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="section">
        <h2>Seluruh fitur</h2>
        <p>Diurutkan mulai dari yang paling membutuhkan perhatian.</p>

        <ul className="feature-list">
          {features.map((feature) => (
            <li
              className="feature-card"
              data-status={feature.status}
              key={feature.id}
            >
              <div className="feature-card__head">
                <h3>{feature.name}</h3>
                <span className="status-pill">
                  {STATUS_LABEL[feature.status]}
                </span>
              </div>

              <p>{feature.purpose}</p>
              <p>
                <strong>Manfaat untuk Anda:</strong> {feature.userValue}
              </p>
              <p>
                <strong>Kapan dipakai:</strong> {feature.whenToUse}
              </p>

              {feature.entryPoint ? (
                <p className="entry-point">
                  Titik masuk: <code>{feature.entryPoint}</code>
                </p>
              ) : null}

              <p className="reason">
                <strong>{AREA_LABEL[feature.area] ?? feature.area}</strong> ·
                risiko {feature.risk} · {feature.statusReason}
              </p>

              {feature.caveat ? (
                <p className="caveat">{feature.caveat}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
