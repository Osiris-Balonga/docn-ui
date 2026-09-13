import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const fixtureRoot = fileURLToPath(new URL("./", import.meta.url));
const fontSource = fileURLToPath(
  new URL("../../../packages/documents/assets/fonts/", import.meta.url),
);
const outputDirectory = fileURLToPath(new URL("./dist/", import.meta.url));

export default defineConfig({
  root: fixtureRoot,
  resolve: {
    alias: {
      "@react-pdf/renderer": resolve(
        fixtureRoot,
        "../../../packages/documents/node_modules/@react-pdf/renderer/lib/react-pdf.browser.js",
      ),
      "@docn-ui/documents/browser": resolve(
        fixtureRoot,
        "../../../packages/documents/src/render/browser-entry.ts",
      ),
      "@docn-ui/documents/templates": resolve(
        fixtureRoot,
        "../../../packages/documents/src/templates/index.ts",
      ),
      "@docn-ui/documents/internal-fonts": resolve(
        fixtureRoot,
        "../../../packages/documents/src/render/fonts.ts",
      ),
      "@docn-ui/documents/internal-manifest": resolve(
        fixtureRoot,
        "../../../packages/documents/src/assets/manifest.ts",
      ),
    },
  },
  build: { emptyOutDir: true, outDir: outputDirectory },
  plugins: [
    {
      name: "copy-qualified-document-fonts",
      async closeBundle() {
        const destination = new URL("./dist/generated/fonts/", import.meta.url);
        await mkdir(destination, { recursive: true });
        await cp(fontSource, destination, { recursive: true });
      },
    },
  ],
});
