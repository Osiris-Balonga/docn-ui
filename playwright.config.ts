import { defineConfig, devices } from "@playwright/test";

const port = 4174;
const baseURL = `http://127.0.0.1:${port}`;
const usePreparedBuild = process.env.E2E_USE_BUILD === "1";
const serverCommand = usePreparedBuild
  ? "node tooling/testing/build-fingerprint.mjs verify && node node_modules/http-server/bin/http-server apps/www/out -a 127.0.0.1 -p 4174 -c-1"
  : "corepack pnpm --filter @docn-ui/www build && node tooling/testing/build-fingerprint.mjs write && node node_modules/http-server/bin/http-server apps/www/out -a 127.0.0.1 -p 4174 -c-1";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  outputDir: ".artifacts/e2e/test-results",
  reporter: [["list"], ["html", { outputFolder: ".artifacts/e2e/report" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  webServer: {
    command: serverCommand,
    url: `${baseURL}/templates/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
