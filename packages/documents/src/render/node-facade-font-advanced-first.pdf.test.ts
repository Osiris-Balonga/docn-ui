import { copyFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { Font } from "@react-pdf/renderer";
import { afterAll, beforeAll, expect, it } from "vitest";
import { renderPdf } from "@docn-ui/documents/node";
import { assetManifest } from "../assets/manifest";
import { resolveFormat } from "../core/formats";
import { violetFounderBusinessCardDefinition } from "../templates/business-cards/violet-founder-business-card";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import type { TemplateSampleAssets } from "../templates/types";
import { createNodeAssetResolver } from "./assets.node";
import { renderDocumentInNode } from "./node";

interface TestFontSource {
  data: unknown;
  fontStyle: string;
  fontWeight: number;
  load(): Promise<void>;
  src: string;
}

const packagedAssetRoot = new URL("../../assets/", import.meta.url);
const unusedSampleAssets = {} as TemplateSampleAssets;
let assetRoot: string;

beforeAll(async () => {
  Font.reset();
  assetRoot = await mkdtemp(join(tmpdir(), "docn-l18-font-coexist-"));
  for (const asset of assetManifest.assets) {
    const destination = join(assetRoot, asset.file);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(new URL(asset.file, packagedAssetRoot), destination);
  }
});

afterAll(async () => {
  Font.reset();
  await rm(assetRoot, { force: true, recursive: true });
});

it("temporarily prioritizes verified bytes over a cached mismatched advanced source", async () => {
  const target = assetManifest.assets.find(
    (asset) => asset.family === "Noto Sans" && asset.weight === 400,
  );
  const substitute = assetManifest.assets.find(
    (asset) => asset.family === "Noto Serif" && asset.weight === 400,
  );
  if (!target || !substitute)
    throw new Error("Expected qualified font fixtures.");
  const targetPath = join(assetRoot, target.file);
  await copyFile(new URL(substitute.file, packagedAssetRoot), targetPath);

  const format = resolveFormat("card-85x55");
  if (format.kind !== "fixed") throw new Error("Expected a fixed card format.");
  const legacyResolver = createNodeAssetResolver(assetRoot);
  const advancedBytes = await renderDocumentInNode(
    {
      document:
        violetFounderBusinessCardDefinition.renderSample(unusedSampleAssets),
      format,
      printProfile: { kind: "screen" },
    },
    legacyResolver,
  );
  expect(new TextDecoder().decode(advancedBytes.slice(0, 4))).toBe("%PDF");

  const family = Font.getRegisteredFonts()[target.family] as
    { sources: TestFontSource[] } | undefined;
  const cachedMismatchedSource = family?.sources.find(
    (source) =>
      source.fontStyle === target.style &&
      source.fontWeight === target.weight &&
      source.src === targetPath,
  );
  if (!family || !cachedMismatchedSource) {
    throw new Error("Expected the advanced source to be registered.");
  }
  expect(cachedMismatchedSource.data).not.toBeNull();
  const sourceCountBeforeFacade = family.sources.length;
  const priorOrder = family.sources.slice();
  const originalLoad = cachedMismatchedSource.load;
  cachedMismatchedSource.load = async () => {
    throw new Error("Cached mismatched source was selected.");
  };
  await copyFile(new URL(target.file, packagedAssetRoot), targetPath);

  const result = await renderPdf(
    violetFounderBusinessCardRenderable,
    { data: {} },
    { fontAssetDirectory: assetRoot },
  );
  expect(result.pageCount).toBe(2);

  const restoredFamily = Font.getRegisteredFonts()[target.family] as {
    sources: TestFontSource[];
  };
  const restored = restoredFamily.sources;
  expect(restored).toHaveLength(sourceCountBeforeFacade + 2);
  for (const [index, source] of priorOrder.entries()) {
    expect(restored[index]).toBe(source);
  }
  cachedMismatchedSource.load = originalLoad;

  const advancedAfterFacade = await renderDocumentInNode(
    {
      document:
        violetFounderBusinessCardDefinition.renderSample(unusedSampleAssets),
      format,
      printProfile: { kind: "screen" },
    },
    legacyResolver,
  );
  expect(new TextDecoder().decode(advancedAfterFacade.slice(0, 4))).toBe(
    "%PDF",
  );

  await renderPdf(
    violetFounderBusinessCardRenderable,
    { data: {} },
    { fontAssetDirectory: assetRoot },
  );
  expect(restoredFamily.sources).toHaveLength(sourceCountBeforeFacade + 2);
});
