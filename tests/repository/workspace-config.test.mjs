import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("root exposes the solo-developer command contract", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  for (const command of [
    "setup", "doctor", "dev", "build", "lint", "format", "fix",
    "typecheck", "test", "test:e2e", "check", "db:start", "db:stop",
    "db:studio", "db:generate", "db:migrate", "db:seed", "db:reset",
    "project:new", "capability:add",
  ]) {
    assert.equal(typeof pkg.scripts[command], "string", command);
  }
  assert.match(pkg.packageManager, /^pnpm@11\./);
});
