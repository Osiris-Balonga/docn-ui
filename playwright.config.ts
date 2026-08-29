import { defineConfig, devices } from "@playwright/test";

const port = 4174;
const baseURL = `http://127.0.0.1:${port}`;

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
    command:
      "corepack pnpm --filter @docn-ui/www build && node node_modules/http-server/bin/http-server apps/www/out -a 127.0.0.1 -p 4174 -c-1",
    url: `${baseURL}/templates/business-card-minimal/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
