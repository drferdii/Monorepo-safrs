import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resolveLocalToolingDatabaseUrl } from "./local-tooling.js";

const integrationDescribe =
  process.env.DATABASE_INTEGRATION_TESTS === "1" ? describe : describe.skip;
const rootDirectory = fileURLToPath(new URL("../../../", import.meta.url));
const runner = fileURLToPath(
  new URL("../scripts/run-local-prisma.mjs", import.meta.url),
);
const databaseUrl = resolveLocalToolingDatabaseUrl(process.env, rootDirectory);
const connection = new Client({ connectionString: databaseUrl });

function runSeed() {
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", runner, "seed"],
    {
      cwd: rootDirectory,
      encoding: "utf8",
      env: { ...process.env, DATABASE_URL: databaseUrl },
    },
  );

  expect(result.status, result.stderr).toBe(0);
}

integrationDescribe("deterministic seed sequence", () => {
  beforeAll(async () => {
    await connection.connect();
    await connection.query(
      'TRUNCATE TABLE "transaction_samples" RESTART IDENTITY',
    );
  });

  afterAll(async () => {
    await connection.end();
  });

  it("leaves the next generated ID above the fixed seed ID after repeated seeds", async () => {
    runSeed();
    runSeed();

    const result = await connection.query<{ id: string }>(
      "SELECT nextval(pg_get_serial_sequence('transaction_samples', 'id')) AS id",
    );

    expect(BigInt(result.rows[0]?.id ?? "0")).toBe(2n);
  });
});
