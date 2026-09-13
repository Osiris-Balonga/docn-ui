import { Font } from "@react-pdf/renderer";
import { afterAll, beforeAll, expect, it } from "vitest";
import { renderPdf } from "@docn-ui/documents/node";
import { resolveFormat } from "../core/formats";
import { violetFounderBusinessCardDefinition } from "../templates/business-cards/violet-founder-business-card";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import type { TemplateSampleAssets } from "../templates/types";
import { createNodeAssetResolver } from "./assets.node";
import { renderDocumentInNode } from "./node";

beforeAll(() => Font.reset());
afterAll(() => Font.reset());
const unusedSampleAssets = {} as TemplateSampleAssets;

it("keeps facade rendering compatible with later equivalent advanced registration", async () => {
  const first = await renderPdf(violetFounderBusinessCardRenderable, {
    data: {},
  });
  expect(first.pageCount).toBe(2);

  const format = resolveFormat("card-85x55");
  if (format.kind !== "fixed") throw new Error("Expected a fixed card format.");
  const advancedBytes = await renderDocumentInNode(
    {
      document:
        violetFounderBusinessCardDefinition.renderSample(unusedSampleAssets),
      format,
      printProfile: { kind: "screen" },
    },
    createNodeAssetResolver(),
  );
  expect(new TextDecoder().decode(advancedBytes.slice(0, 4))).toBe("%PDF");

  const second = await renderPdf(violetFounderBusinessCardRenderable, {
    data: {},
  });
  expect(second.pageCount).toBe(2);

  Font.reset();
  const afterReset = await renderPdf(violetFounderBusinessCardRenderable, {
    data: {},
  });
  expect(afterReset.pageCount).toBe(2);
});
