import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { afterEach, describe, expect, it } from "vitest";
import {
  PDF_RENDER_PROTOCOL_VERSION,
  type RenderRequest,
} from "../../core/contracts";
import { DocumentValidationError } from "../../core/errors";
import { resolveFormat } from "../../core/formats";
import {
  assertWithinSafeFrame,
  createSafeFrame,
} from "../../primitives/measurement";
import { renderDocumentInNode } from "../../render/node";
import {
  createBusinessCardEditorialPlan,
  editorialBusinessCardExample,
} from "./business-card-editorial";
import {
  createBusinessCardMinimalPlan,
  minimalBusinessCardExampleFr,
} from "./business-card-minimal";
import {
  createBusinessCardStudioPlan,
  studioBusinessCardExample,
} from "./business-card-studio";
import type { BusinessCardData } from "./schema";

const openDocuments: Array<ReturnType<typeof getDocument>> = [];

function createRequest(
  data: BusinessCardData | Record<string, unknown>,
  options: {
    formatId?: RenderRequest["formatId"];
    templateId?: string;
    themeId?: RenderRequest["themeId"];
  } = {},
): RenderRequest {
  return {
    assetIds: [],
    data,
    formatId: options.formatId ?? "card-85x55",
    locale: "fr",
    printProfile: { kind: "screen" },
    protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
    revision: 1,
    templateId: options.templateId ?? "business-card-minimal",
    templateVersion: "1.0.0",
    themeId: options.themeId ?? "neutral",
  };
}

async function inspectPdf(bytes: Uint8Array) {
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
  });
  openDocuments.push(loadingTask);
  const document = await loadingTask.promise;
  const pages = await Promise.all(
    Array.from({ length: document.numPages }, async (_, index) => {
      const page = await document.getPage(index + 1);
      const content = await page.getTextContent();
      const height = (page.view[3] ?? 0) - (page.view[1] ?? 0);
      const items = content.items.filter(
        (
          item,
        ): item is typeof item & {
          height: number;
          str: string;
          transform: number[];
          width: number;
        } =>
          "str" in item &&
          "height" in item &&
          "transform" in item &&
          "width" in item,
      );
      return {
        bounds: items.map((item) => ({
          height: item.height,
          width: item.width,
          x: item.transform[4] ?? 0,
          y: height - (item.transform[5] ?? 0) - item.height,
        })),
        text: items.map((item) => item.str).join(" "),
        view: page.view,
      };
    }),
  );
  return { pageCount: document.numPages, pages };
}

async function retainArtifact(name: string, bytes: Uint8Array) {
  if (process.env.DOCN_WRITE_PDF_ARTIFACTS !== "1") return;
  const directory = fileURLToPath(
    new URL("../../../../../.artifacts/l05/pdf/", import.meta.url),
  );
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}${name}.pdf`, bytes);
}

afterEach(async () => {
  await Promise.all(
    openDocuments.splice(0).map((loadingTask) => loadingTask.destroy()),
  );
});

describe("business-card PDF family", () => {
  it("renders the minimal composition as two measured sides", async () => {
    const { plan } = createBusinessCardMinimalPlan(
      createRequest(minimalBusinessCardExampleFr),
    );
    const bytes = await renderDocumentInNode(plan);
    const inspection = await inspectPdf(bytes);
    const format = resolveFormat("card-85x55");
    if (format.kind !== "fixed") throw new Error("Expected a fixed format.");
    const frame = createSafeFrame(format);

    expect(inspection.pageCount).toBe(2);
    for (const page of inspection.pages) {
      expect(page.view[2]).toBeCloseTo(240.944_881_889_8, 1);
      expect(page.view[3]).toBeCloseTo(155.905_511_811, 1);
      for (const bounds of page.bounds) {
        assertWithinSafeFrame(bounds, frame, ["pages", "text"]);
      }
    }
    expect(inspection.pages[0]?.text).toContain("Élodie Mbemba");
    expect(inspection.pages[0]?.text).toContain("Directrice créative");
    expect(inspection.pages[0]?.text).toContain("elodie@atelier-nzela.example");
    expect(inspection.pages[0]?.text).toContain("+242 06 555 01 24");
    expect(inspection.pages[0]?.text).toContain(
      "14 avenue des Arts, Brazzaville",
    );
    expect(inspection.pages[1]?.text).toContain("Atelier Nzela");
    expect(inspection.pages[1]?.text).toContain("atelier-nzela.example");
    await retainArtifact("business-card-minimal", bytes);
  });

  it("reports identity and address content that cannot fit", () => {
    const cases = [
      {
        data: { ...minimalBusinessCardExampleFr, name: "W".repeat(49) },
        path: ["data", "name"],
      },
      {
        data: { ...minimalBusinessCardExampleFr, address: "W".repeat(121) },
        path: ["data", "address"],
      },
    ];

    for (const fixture of cases) {
      try {
        createBusinessCardMinimalPlan(createRequest(fixture.data));
        throw new Error("Expected fixed-layout validation to fail.");
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentValidationError);
        expect(error).toMatchObject({ code: "LAYOUT_OVERFLOW" });
        expect((error as DocumentValidationError).issues[0]?.path).toEqual(
          fixture.path,
        );
      }
    }
  });

  it("renders distinct editorial and studio compositions at compact formats", async () => {
    const fixtures = [
      {
        artifact: "business-card-editorial",
        formatId: "card-90x50" as const,
        plan: createBusinessCardEditorialPlan(
          createRequest(editorialBusinessCardExample, {
            formatId: "card-90x50",
            templateId: "business-card-editorial",
            themeId: "editorial",
          }),
        ).plan,
        text: ["Noémie Kanza", "Revue Latitude", "Vol. 01"],
      },
      {
        artifact: "business-card-studio",
        formatId: "card-us" as const,
        plan: createBusinessCardStudioPlan(
          createRequest(studioBusinessCardExample, {
            formatId: "card-us",
            templateId: "business-card-studio",
            themeId: "bold",
          }),
        ).plan,
        text: ["Malik Turner", "Common Form Studio", "STUDIO / 01"],
      },
    ];

    for (const fixture of fixtures) {
      const bytes = await renderDocumentInNode(fixture.plan);
      const inspection = await inspectPdf(bytes);
      const format = resolveFormat(fixture.formatId);
      if (format.kind !== "fixed") throw new Error("Expected a fixed format.");
      const frame = createSafeFrame(format);
      expect(inspection.pageCount).toBe(2);
      const allText = inspection.pages.map((page) => page.text).join(" ");
      for (const expectedText of fixture.text)
        expect(allText).toContain(expectedText);
      for (const page of inspection.pages) {
        for (const bounds of page.bounds)
          assertWithinSafeFrame(bounds, frame, ["pages", "text"]);
      }
      await retainArtifact(fixture.artifact, bytes);
    }
  });
});
