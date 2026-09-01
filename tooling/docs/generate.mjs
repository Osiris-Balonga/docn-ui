import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createViteServer } from "vitest/node";
import { componentRegistryItems } from "../registry/component-items.mjs";
import { registrySourceManifest } from "../registry/source-manifest.mjs";
import { createApiReader, readExampleSource } from "./source-reference.mjs";

const root = fileURLToPath(new URL("../..", import.meta.url));
const publicRoot = resolve(root, "apps/www/public");
const indexPath = resolve(root, ".artifacts/docs/catalog.json");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const inputs = execFileSync(
  "git",
  [
    "ls-files",
    "-z",
    "--cached",
    "--others",
    "--exclude-standard",
    "--",
    "packages/documents",
    "tooling/docs",
    "tooling/registry",
    "pnpm-lock.yaml",
  ],
  { cwd: root },
)
  .toString()
  .split("\0")
  .filter(Boolean)
  .sort();
const hash = createHash("sha256");
for (const file of inputs) {
  hash.update(file);
  hash.update(await readFile(resolve(root, file)));
}
const inputHash = hash.digest("hex");
try {
  const cached = JSON.parse(await readFile(indexPath, "utf8"));
  if (
    cached.inputHash === inputHash &&
    (
      await Promise.all(
        cached.outputs.map(
          async (output) =>
            digest(await readFile(resolve(publicRoot, output.path))) ===
            output.sha256,
        ),
      )
    ).every(Boolean)
  ) {
    console.log(
      `Verified cached PDF documentation: ${cached.components.length} components and ${cached.themes.length} themes.`,
    );
    process.exit(0);
  }
} catch {
  /* A missing or stale generated catalog is rebuilt below. */
}

const server = await createViteServer({
  configFile: false,
  root,
  server: { middlewareMode: true },
  appType: "custom",
  ssr: { external: ["react", "@react-pdf/renderer"] },
});
try {
  const { componentCatalog } = await server.ssrLoadModule(
    "/packages/documents/src/catalog/components.ts",
  );
  const { renderComponentExample, prepareExampleFonts } =
    await server.ssrLoadModule(
      "/packages/documents/src/examples/components/render.tsx",
    );
  const { formats } = await server.ssrLoadModule(
    "/packages/documents/src/core/formats.ts",
  );
  const { templateCatalog } = await server.ssrLoadModule(
    "/packages/documents/src/catalog/manifest.ts",
  );
  const { getPdfTheme } = await server.ssrLoadModule(
    "/packages/documents/src/themes/themes.ts",
  );
  assert.deepEqual(
    componentCatalog.map((entry) => `docn-${entry.slug}`).sort(),
    componentRegistryItems.map((entry) => entry.name).sort(),
  );
  prepareExampleFonts(resolve(root, "packages/documents/assets"));
  const api = createApiReader(root);
  const imageSource = `data:image/jpeg;base64,${(
    await readFile(resolve(root, "tooling/docs/assets/desk-setup.jpg"))
  ).toString("base64")}`;
  const logoSource = `data:image/png;base64,${(
    await readFile(resolve(root, "tooling/docs/assets/penpot-logo.png"))
  ).toString("base64")}`;
  const outputs = [];
  await mkdir(resolve(publicRoot, "generated/docs"), { recursive: true });
  await mkdir(resolve(root, ".artifacts/docs"), { recursive: true });
  async function save(path, bytes) {
    await writeFile(resolve(publicRoot, path), bytes);
    outputs.push({ path, sha256: digest(bytes) });
  }
  async function render(id, name, height, themeId = "neutral") {
    const bytes = await renderComponentExample({
      name,
      height,
      imageSource,
      logoSource,
      themeId,
    });
    const pdf = `/generated/docs/${id}.pdf`;
    await save(pdf.slice(1), bytes);
    const task = getDocument({
      data: new Uint8Array(bytes),
      useSystemFonts: false,
    });
    try {
      const doc = await task.promise;
      assert.ok(
        doc.numPages >= 1 && doc.numPages <= 4,
        `Unexpected page count: ${id}`,
      );
      const pages = [];
      for (let number = 1; number <= doc.numPages; number++) {
        const page = await doc.getPage(number);
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
        const src = `/generated/docs/${id}-${number}.png`;
        await save(src.slice(1), canvas.toBuffer("image/png"));
        const content = await page.getTextContent();
        const text = content.items
          .filter((item) => "str" in item)
          .map((item) => item.str)
          .join(" ");
        assert.ok(text.trim(), `Empty PDF content: ${id}, page ${number}`);
        pages.push({ src, width: canvas.width, height: canvas.height, text });
      }
      return { pdf, sha256: digest(bytes), pages };
    } finally {
      await task.destroy();
    }
  }
  const components = [];
  for (const entry of componentCatalog) {
    const item = componentRegistryItems.find(
      (item) => item.name === `docn-${entry.slug}`,
    );
    const example = await readExampleSource(
      root,
      entry.exampleFile,
      entry.exampleExport,
    );
    const recipes = await Promise.all(
      (entry.recipes ?? []).map(async (recipe) => ({
        title: recipe.title,
        description: recipe.description,
        code: (
          await readExampleSource(root, entry.exampleFile, recipe.exampleExport)
        ).code,
      })),
    );
    const exampleItems = [
      ...new Set(
        example.imports
          .filter((path) => path.startsWith("."))
          .map((path) => {
            const base = posix.normalize(
              posix.join(posix.dirname(entry.exampleFile), path),
            );
            const owner = registrySourceManifest.items.find((candidate) =>
              candidate.files.some(
                (file) => file === `${base}.ts` || file === `${base}.tsx`,
              ),
            );
            assert.ok(owner, `Unowned example import: ${base}`);
            return owner.name;
          }),
      ),
    ].sort();
    components.push({
      ...entry,
      api: api(item),
      usage: example.code,
      recipes,
      exampleItems,
      ...(await render(entry.slug, entry.exampleExport, entry.height)),
    });
  }
  const themes = [];
  assert.ok(
    !JSON.stringify(components).includes(
      root.replaceAll("\\", "/").replace(/\/$/, ""),
    ),
    "Documentation must not expose local filesystem paths.",
  );
  for (const id of ["neutral", "editorial", "bold"])
    themes.push({
      id,
      tokens: getPdfTheme(id),
      ...(await render(`theme-${id}`, "ThemeExample", 300, id)),
    });
  const formatEntries = Object.values(formats).map((format) => ({
    ...format,
    templates: templateCatalog
      .filter((entry) => entry.supportedFormatIds.includes(format.id))
      .map((entry) => ({ title: entry.title, slug: entry.slug })),
  }));
  await writeFile(
    indexPath,
    JSON.stringify(
      {
        schemaVersion: 1,
        inputHash,
        components,
        themes,
        formats: formatEntries,
        outputs,
      },
      null,
      2,
    ),
  );
  console.log(
    `Generated ${components.length} component PDFs and ${themes.length} theme PDFs, with source-derived API/usage and ${formatEntries.length} formats.`,
  );
} finally {
  await server.close();
}
