import type { LiveSnapshot } from "../lib/control-center.ts";
import { readRegistry } from "../lib/repo/registry.ts";
import { ControlCenter } from "./control-center.tsx";

/**
 * Server boundary. The board itself stays a client component — it owns the
 * navigation state — so the repository reading happens here and is handed down
 * as a plain snapshot.
 *
 * No caching: a cached page could report a repository state that no longer
 * exists, which is the one thing this board must never do.
 */
export const dynamic = "force-dynamic";

export default async function Page() {
  const snapshot = await readRegistry();

  const live: LiveSnapshot = {
    readAt: snapshot.readAt,
    repoRoot: snapshot.repoRoot,
    branch: snapshot.git.branch,
    head: snapshot.git.head,
    dirtyPaths: snapshot.git.dirtyPaths,
    gitAvailable: snapshot.git.available,
    unmergedBranches: snapshot.git.unmergedBranches,
    counts: snapshot.counts,
    problems: snapshot.problems,
    features: snapshot.features.map((feature) => ({
      id: feature.id,
      name: feature.name,
      area: feature.area,
      purpose: feature.purpose,
      userValue: feature.userValue,
      whenToUse: feature.whenToUse,
      entryPoint: feature.entryPoint,
      risk: feature.risk,
      status: feature.status,
      statusReason: feature.statusReason,
      caveat: feature.caveat,
      branch: feature.branch,
      evidence: feature.evidence.map((item) => ({
        path: item.path,
        proves: item.proves,
        present: item.present,
      })),
    })),
  };

  return <ControlCenter live={live} />;
}
