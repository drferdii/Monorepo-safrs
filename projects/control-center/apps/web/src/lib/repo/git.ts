import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { repoRoot } from "./root.ts";
import type { GitSnapshot, UnmergedBranch } from "./types.ts";

const run = promisify(execFile);

/**
 * Read-only git inspection.
 *
 * `execFile` is used deliberately: arguments are passed as an array and never
 * interpolated into a shell string, so no repository content can become a
 * command. Nothing here mutates the repository.
 */
async function git(args: string[]): Promise<string> {
  const cwd = await repoRoot();
  const { stdout } = await run("git", args, {
    cwd,
    // A repository read should never take this long; a hang must not wedge a page render.
    timeout: 10_000,
    maxBuffer: 8 * 1024 * 1024,
    windowsHide: true,
  });
  return stdout.trim();
}

/** Branches that are not merge targets and carry no unique work worth surfacing. */
const BRANCH_DENYLIST = new Set(["main", "HEAD"]);

export async function readGit(): Promise<GitSnapshot> {
  try {
    const [branch, head, status, branchList] = await Promise.all([
      git(["rev-parse", "--abbrev-ref", "HEAD"]),
      git(["rev-parse", "--short", "HEAD"]),
      git(["status", "--porcelain=v1"]),
      git(["for-each-ref", "--format=%(refname:short)", "refs/heads"]),
    ]);

    const dirtyPaths = status
      .split("\n")
      .filter((line) => line.trim().length > 0).length;

    const candidates = branchList
      .split("\n")
      .map((line) => line.trim())
      .filter((name) => name.length > 0 && !BRANCH_DENYLIST.has(name));

    const unmergedBranches: UnmergedBranch[] = [];
    for (const name of candidates) {
      try {
        const count = await git(["rev-list", "--count", `main..${name}`]);
        const commitsAhead = Number.parseInt(count, 10);
        if (Number.isFinite(commitsAhead) && commitsAhead > 0) {
          unmergedBranches.push({ name, commitsAhead });
        }
      } catch {
        // A branch that cannot be compared is skipped rather than failing the read.
      }
    }

    unmergedBranches.sort((a, b) => b.commitsAhead - a.commitsAhead);

    return { branch, head, dirtyPaths, unmergedBranches, available: true };
  } catch {
    return {
      branch: "unknown",
      head: "unknown",
      dirtyPaths: 0,
      unmergedBranches: [],
      available: false,
    };
  }
}

/**
 * True when `branchName` exists locally. Used to tell "the feature lives on a
 * branch" apart from "the feature does not exist at all".
 */
export async function branchExists(branchName: string): Promise<boolean> {
  try {
    await git(["rev-parse", "--verify", `refs/heads/${branchName}`]);
    return true;
  } catch {
    return false;
  }
}

/** List the files a branch adds or changes relative to `main`. */
export async function branchFiles(branchName: string): Promise<string[]> {
  try {
    const output = await git(["diff", "--name-only", `main...${branchName}`]);
    return output.split("\n").filter((line) => line.trim().length > 0);
  } catch {
    return [];
  }
}
