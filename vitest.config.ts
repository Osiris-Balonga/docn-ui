import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

const exclude = [
  ...configDefaults.exclude,
  "**/.artifacts/**",
  "**/.next/**",
  "**/out/**",
  "**/dist/**",
  "tests/e2e/**",
  "tests/visual/**",
  "**/*.pdf.test.{ts,tsx}",
  "**/*.consumer.test.{ts,tsx}",
];

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./apps/www/src", import.meta.url)) },
  },
  test: {
    maxWorkers: 2,
    retry: 0,
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reportsDirectory: ".artifacts/coverage",
      include: [
        "apps/www/src/features/**/*.{ts,tsx}",
        "packages/documents/src/**/*.ts",
      ],
      exclude: ["**/*.test.{ts,tsx}", "packages/documents/src/index.ts"],
      reporter: ["text", "html"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["{apps,packages,tooling}/**/*.test.ts"],
          exclude: [...exclude, "**/*.integration.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "pdf",
          environment: "node",
          include: ["packages/**/*.pdf.test.{ts,tsx}"],
          exclude: exclude.filter((pattern) => !pattern.includes(".pdf.test")),
          maxWorkers: 1,
          retry: 0,
          testTimeout: 15_000,
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          environment: "jsdom",
          include: ["apps/**/*.test.tsx"],
          exclude: [...exclude, "**/*.integration.test.{ts,tsx}"],
          setupFiles: ["./tooling/testing/setup-components.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          include: ["{apps,packages,tooling}/**/*.integration.test.{ts,tsx}"],
          exclude,
        },
      },
      {
        extends: true,
        test: {
          name: "consumers",
          environment: "node",
          include: ["tests/consumers/**/*.consumer.test.ts"],
          exclude: exclude.filter(
            (pattern) => !pattern.includes(".consumer.test"),
          ),
          maxWorkers: 1,
          retry: 0,
          hookTimeout: 600_000,
          testTimeout: 600_000,
        },
      },
    ],
  },
});
