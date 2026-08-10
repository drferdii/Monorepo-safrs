import { execFileSync } from "node:child_process";
import { assertDisposableDatabase } from "./reset-guard.ts";

assertDisposableDatabase(process.env.DATABASE_URL ?? "");

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

execFileSync(pnpmCommand, ["exec", "prisma", "migrate", "reset", "--force"], {
  cwd: new URL("..", import.meta.url),
  stdio: "inherit",
});

execFileSync(pnpmCommand, ["exec", "prisma", "db", "seed"], {
  cwd: new URL("..", import.meta.url),
  stdio: "inherit",
});
