import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { format } from "prettier";
import { createViteServer } from "vitest/node";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const outputRoot = resolve(root, "apps/www/public/generated/templates");
const catalogPath = resolve(
  root,
  "packages/documents/src/catalog/generated-templates.ts",
);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const checkOnly = process.argv.includes("--check");
const unexpectedArguments = process.argv
  .slice(2)
  .filter((argument) => argument !== "--check");
if (unexpectedArguments.length)
  throw new Error("Use generate.mjs with no arguments or --check.");

async function persistOutput(path, bytes) {
  if (checkOnly) {
    const current = await readFile(path);
    assert.equal(
      digest(current),
      digest(bytes),
      `Generated asset is stale: ${path}`,
    );
    return;
  }
  await writeFile(path, bytes);
}

async function persistPdf(path, bytes) {
  if (checkOnly) {
    const current = await readFile(path);
    assert.ok(current.length > 0, `Generated PDF is empty: ${path}`);
    return;
  }
  await writeFile(path, bytes);
}

const server = await createViteServer({
  configFile: false,
  root,
  server: { middlewareMode: true },
  appType: "custom",
  ssr: { external: ["react", "@react-pdf/renderer"] },
});

async function build() {
  const { templateDefinitions } = await server.ssrLoadModule(
    "/packages/documents/src/templates/index.ts",
  );
  const {
    normalizeGeneratedPdf,
    prepareTemplateFonts,
    renderTemplateDefinition,
  } = await server.ssrLoadModule(
    "/packages/documents/src/templates/render.tsx",
  );
  prepareTemplateFonts(resolve(root, "packages/documents/assets"));
  const assetDefinitions = {
    badgeCreativePortraitSource: ["badge-creative-portrait.png", "image/png"],
    badgeDeveloperPortraitSource: ["badge-developer-portrait.png", "image/png"],
    badgePatternSource: ["badge-blue-pattern.png", "image/png"],
    invoiceLandscapeSource: ["invoice-landscape.png", "image/png"],
    portraitSource: ["designer-portrait.png", "image/png"],
    productCardDeckSource: ["product-card-deck.png", "image/png"],
    productNotebookSource: ["product-notebook.png", "image/png"],
    studioLogoSource: ["studio-north-mark.png", "image/png"],
    supportPortraitSource: ["support-customer-portrait.png", "image/png"],
  };
  const assets = Object.fromEntries(
    await Promise.all(
      Object.entries(assetDefinitions).map(async ([key, [file, mime]]) => {
        const bytes = await readFile(
          resolve(root, "tooling/docs/assets", file),
        );
        return [key, `data:${mime};base64,${bytes.toString("base64")}`];
      }),
    ),
  );
  const outputs = [];
  for (const definition of templateDefinitions) {
    const pdfBytes = await normalizeGeneratedPdf(
      new Uint8Array(await renderTemplateDefinition(definition, assets)),
    );
    const pdfName = `${definition.id}.pdf`;
    await persistPdf(resolve(outputRoot, pdfName), pdfBytes);
    const loadingTask = getDocument({
      data: pdfBytes.slice(),
      useSystemFonts: false,
    });
    try {
      const document = await loadingTask.promise;
      assert.equal(
        document.numPages,
        definition.sides,
        `${definition.id} page count differs from metadata.`,
      );
      const pages = [];
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
        const page = await document.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = createCanvas(
          Math.ceil(viewport.width),
          Math.ceil(viewport.height),
        );
        await page.render({
          canvas,
          canvasContext: canvas.getContext("2d"),
          viewport,
        }).promise;
        const bytes = canvas.toBuffer("image/png");
        const name = `${definition.id}-${pageNumber}.png`;
        await persistOutput(resolve(outputRoot, name), bytes);
        pages.push({
          fixture: `${definition.id}-example`,
          height: canvas.height,
          page: pageNumber,
          sha256: digest(bytes),
          src: `/generated/templates/${name}`,
          width: canvas.width,
        });
      }
      const metadata = Object.fromEntries(
        Object.entries(definition).filter(([key]) => key !== "renderSample"),
      );
      outputs.push({
        ...metadata,
        pages,
        pdf: {
          revision: digest(
            Buffer.from(pages.map((page) => page.sha256).join(":")),
          ),
          src: `/generated/templates/${pdfName}`,
        },
        thumbnail: pages[0],
      });
    } finally {
      await loadingTask.destroy();
    }
  }
  return outputs;
}

try {
  if (!checkOnly) {
    await rm(outputRoot, { recursive: true, force: true });
    await mkdir(outputRoot, { recursive: true });
  } else {
    await mkdir(outputRoot, { recursive: true });
  }
  const catalog = await build();
  const source = await format(
    [
      'import type { TemplateCatalogEntry } from "./manifest";',
      "",
      `export const generatedTemplateCatalog = ${JSON.stringify(catalog, null, 2)} as const satisfies readonly TemplateCatalogEntry[];`,
      "",
    ].join("\n"),
    { parser: "typescript" },
  );
  if (checkOnly) {
    const current = await readFile(catalogPath, "utf8");
    assert.equal(current, source, "Generated template catalog is stale.");
  } else {
    await writeFile(catalogPath, source);
  }
  console.log(
    `${checkOnly ? "Verified" : "Generated"} ${catalog.length} template PDFs and ${catalog.reduce((sum, entry) => sum + entry.pages.length, 0)} preview pages.`,
  );
} finally {
  await server.close();
}
