import { Font } from "@react-pdf/renderer";
import { afterAll, beforeAll, expect, it } from "vitest";
import { renderPdf } from "@docn-ui/documents/node";
import { assetManifest } from "../assets/manifest";
import { resolveFormat } from "../core/formats";
import { violetFounderBusinessCardDefinition } from "../templates/business-cards/violet-founder-business-card";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import type { TemplateSampleAssets } from "../templates/types";
import { renderDocumentInNode } from "./node";
import { createVerifiedNodeAssetResolver } from "./verified-assets.node";

const unusedSampleAssets = {} as TemplateSampleAssets;

function qualifiedSourceCount(): number {
  const registered = Font.getRegisteredFonts() as Record<
    string,
    { sources: unknown[] } | undefined
  >;
  let count = 0;
  for (const family of new Set(
    assetManifest.assets.map((asset) => asset.family),
  )) {
    count += registered[family]?.sources.length ?? 0;
  }
  return count;
}

beforeAll(() => Font.reset());
afterAll(() => Font.reset());

it("adopts a private canonical source after advanced code populated the cache", async () => {
  const canonicalResolver = await createVerifiedNodeAssetResolver();
  const format = resolveFormat("card-85x55");
  if (format.kind !== "fixed") throw new Error("Expected a fixed card format.");
  const advancedBytes = await renderDocumentInNode(
    {
      document:
        violetFounderBusinessCardDefinition.renderSample(unusedSampleAssets),
      format,
      printProfile: { kind: "screen" },
    },
    canonicalResolver,
  );
  expect(new TextDecoder().decode(advancedBytes.slice(0, 4))).toBe("%PDF");
  expect(qualifiedSourceCount()).toBe(assetManifest.assets.length);

  const first = await renderPdf(violetFounderBusinessCardRenderable, {
    data: {},
  });
  expect(first.pageCount).toBe(2);
  const afterFirstFacade = qualifiedSourceCount();
  expect(afterFirstFacade).toBe(assetManifest.assets.length * 2);

  const second = await renderPdf(violetFounderBusinessCardRenderable, {
    data: {},
  });
  expect(second.pageCount).toBe(2);
  expect(qualifiedSourceCount()).toBe(afterFirstFacade);

  Font.reset();
  const afterReset = await renderPdf(violetFounderBusinessCardRenderable, {
    data: {},
  });
  expect(afterReset.pageCount).toBe(2);
  expect(qualifiedSourceCount()).toBe(afterFirstFacade);
});
