import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";
import { resolvePlaywrightEnvironment } from "./e2e/environment.js";

const canonicalEnvironment = resolvePlaywrightEnvironment(process.env);

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    },
  },
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
  },
  snapshotPathTemplate:
    "{testDir}/screenshots/{projectName}/{testFileName}-snapshots/{arg}{ext}",
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3001",
    cwd: fileURLToPath(new URL(".", import.meta.url)),
    env: canonicalEnvironment,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
