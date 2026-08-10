import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";
import { loadCanonicalEnvironment } from "../../../../tools/doctor/src/checks.mjs";

const rootDirectory = fileURLToPath(new URL("../../../../", import.meta.url));
const canonicalEnvironment = process.env.DATABASE_URL
  ? {
      APP_URL: process.env.APP_URL ?? "http://127.0.0.1:3001",
      DATABASE_URL: process.env.DATABASE_URL,
      NODE_ENV: "test",
    }
  : { ...loadCanonicalEnvironment({ rootDirectory }), NODE_ENV: "test" };

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3001",
    cwd: fileURLToPath(new URL(".", import.meta.url)),
    env: canonicalEnvironment,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
