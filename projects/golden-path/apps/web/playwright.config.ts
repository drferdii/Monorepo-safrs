import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";
import { resolvePlaywrightEnvironment } from "./e2e/environment.js";

const canonicalEnvironment = resolvePlaywrightEnvironment(process.env);

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
