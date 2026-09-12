import { describe, expect, it } from "vitest";
import { z } from "zod";
import { assetManifest } from "./assets/manifest";
import { templateCatalog } from "./catalog/manifest";
import {
  PDF_RENDER_PROTOCOL_VERSION,
  fingerprintRenderRequest,
  type RenderRequest,
} from "./core";
import { templateDefinitions } from "./templates";
import {
  TEMPLATE_IDS,
  assertTemplateIdSet,
  type TemplateId,
} from "./template-ids";
import {
  createFontManifestIdentity,
  defineTemplateDescriptor,
  fingerprintNormalizedTemplateInput,
  normalizeTemplateInput,
  parseLocalImageId,
  type JsonObject,
  type LocalImageDescriptor,
  type TemplateDescriptor,
} from "./template-contract";
import { createPdfTheme, getPdfTheme } from "./themes/themes";

type TestData = JsonObject & {
  imageIds: readonly string[];
  name: string;
};

function schema(onTransform?: () => void) {
  return z
    .object({
      imageIds: z.array(z.string()),
      name: z.string(),
    })
    .strict()
    .transform((value) => {
      onTransform?.();
      return value as TestData;
    });
}

function descriptor(
  overrides: Partial<TemplateDescriptor<TestData>> = {},
): TemplateDescriptor<TestData> {
  return defineTemplateDescriptor({
    id: "resume-classic",
    version: "1.0.0",
    schemaVersion: 1,
    family: "resume",
    schema: schema(),
    defaultData: { imageIds: [], name: "Default" },
    exampleData: { imageIds: [], name: "Example" },
    supportedFormatIds: ["a4", "letter", "label-custom"],
    defaultFormatId: "a4",
    supportedThemeIds: ["neutral", "editorial"],
    defaultThemeId: "neutral",
    supportedLocales: ["en", "fr"],
    defaultLocale: "en",
    supportedPrintProfileKinds: ["screen", "print"],
    defaultPrintProfile: { kind: "screen" },
    themeCompatibility: {},
    extractLocalImageIds: (data) =>
      data.imageIds.map((id, index) =>
        parseLocalImageId(id, ["data", "imageIds", index]),
      ),
    ...overrides,
  });
}

function imageDescriptor(
  id: string,
  overrides: Partial<LocalImageDescriptor> = {},
): LocalImageDescriptor {
  return {
    id: parseLocalImageId(id),
    mimeType: "image/png",
    byteLength: 12,
    widthPx: 2,
    heightPx: 3,
    sha256: `sha256:${"a".repeat(64)}`,
    ...overrides,
  };
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
    .join(",")}}`;
}

async function platformSha256(value: unknown): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonicalJson(value)),
  );
  return `sha256:${Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`;
}

describe("unified template descriptors", () => {
  it("keeps one exact canonical ID inventory for definitions and catalog output", () => {
    expect(TEMPLATE_IDS).toHaveLength(18);
    expect(() =>
      assertTemplateIdSet(templateDefinitions.map((item) => item.id)),
    ).not.toThrow();
    expect(() =>
      assertTemplateIdSet(templateCatalog.map((item) => item.id)),
    ).not.toThrow();
    expect(() =>
      assertTemplateIdSet([...TEMPLATE_IDS, TEMPLATE_IDS[0]]),
    ).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["templateIds"] })],
      }),
    );
  });

  it("brands only normalized lowercase kebab-case local image IDs", () => {
    expect(parseLocalImageId("hero-photo")).toBe("hero-photo");
    expect(() =>
      parseLocalImageId("Hero photo", ["data", "photo"]),
    ).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["data", "photo"] })],
      }),
    );
  });

  it("preserves legacy themes and returns a strict deeply frozen custom theme", () => {
    const legacyTheme = createPdfTheme("neutral", {
      typeScale: { body: 10 },
    });
    expect(legacyTheme.typeScale.body).toBe(10);
    expect("baseThemeId" in legacyTheme).toBe(false);

    const custom = createPdfTheme({
      baseThemeId: "neutral",
      colors: { accent: "#123456" },
    });
    expect(custom.id).toBe("neutral");
    expect(custom.baseThemeId).toBe("neutral");
    expect(custom.colors.accent).toBe("#123456");
    expect(Object.isFrozen(custom)).toBe(true);
    expect(Object.isFrozen(custom.colors)).toBe(true);
    expect(() =>
      createPdfTheme({
        baseThemeId: "neutral",
        typeScale: { body: 11 },
      } as never),
    ).toThrowError(expect.objectContaining({ code: "INVALID_DATA" }));
  });

  it("derives sorted, value-authenticated manifest identities from selected fonts", async () => {
    const neutral = await createFontManifestIdentity(getPdfTheme("neutral"));
    const editorial = await createFontManifestIdentity(
      getPdfTheme("editorial"),
    );
    expect(neutral.assetIds).toEqual([...neutral.assetIds].sort());
    expect(neutral.assetIds).toHaveLength(2);
    expect(editorial.assetIds).toHaveLength(4);
    const neutralProjection = assetManifest.assets
      .filter((asset) => asset.family === "Noto Sans")
      .sort((left, right) =>
        left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
      )
      .map((asset) => ({
        byteLength: asset.bytes,
        family: asset.family,
        format: asset.format,
        id: asset.id,
        sha256: asset.sha256,
        weight: asset.weight,
      }));
    expect(neutral.sha256).toBe(
      await platformSha256({
        assets: neutralProjection,
        schemaVersion: assetManifest.schemaVersion,
      }),
    );

    const template = descriptor();
    expect(
      normalizeTemplateInput(
        template,
        { data: { imageIds: [], name: "Ada" } },
        {
          fontManifestIdentity: structuredClone(neutral),
          localImageDescriptors: [],
        },
      ).fontManifestIdentity,
    ).toEqual(neutral);
    expect(() =>
      normalizeTemplateInput(
        template,
        { data: { imageIds: [], name: "Ada" } },
        {
          fontManifestIdentity: {
            ...neutral,
            sha256: `sha256:${"f".repeat(64)}`,
          },
          localImageDescriptors: [],
        },
      ),
    ).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["fontManifestIdentity"] })],
      }),
    );
    for (const invalidIdentity of [
      { ...neutral, extra: "not-render-affecting" },
      null,
      { ...neutral, assetIds: "font-noto-sans-400" },
    ]) {
      expect(() =>
        normalizeTemplateInput(
          template,
          { data: { imageIds: [], name: "Ada" } },
          {
            fontManifestIdentity: invalidIdentity as never,
            localImageDescriptors: [],
          },
        ),
      ).toThrowError(
        expect.objectContaining({
          code: "ASSET_REJECTED",
          issues: [
            expect.objectContaining({
              path: expect.arrayContaining(["fontManifestIdentity"]),
            }),
          ],
        }),
      );
    }
  });

  it("copies and freezes mutable descriptor defaults at registration", () => {
    const defaultPrintProfile = {
      kind: "print" as const,
      bleedMm: 0 as const,
      cropMarks: false,
    };
    const template = descriptor({ defaultPrintProfile });
    defaultPrintProfile.cropMarks = true;
    expect(template.defaultPrintProfile).toEqual({
      kind: "print",
      bleedMm: 0,
      cropMarks: false,
    });
    expect(Object.isFrozen(template.defaultPrintProfile)).toBe(true);
  });

  it("inspects raw data, parses once, then inspects output without applying transforms twice", async () => {
    let calls = 0;
    const template = descriptor({ schema: schema(() => calls++) });
    calls = 0;
    const identity = await createFontManifestIdentity(getPdfTheme("neutral"));
    const normalized = normalizeTemplateInput(
      template,
      { data: { imageIds: [], name: "e\u0301" } },
      { fontManifestIdentity: identity, localImageDescriptors: [] },
    );
    expect(calls).toBe(1);
    expect(normalized.data.name).toBe("é");
    expect(normalized.revision).toBe(1);
    expect(Object.isFrozen(normalized)).toBe(true);
    expect(Object.isFrozen(normalized.theme.theme.colors)).toBe(true);
  });

  it("freezes validated data before image-ID extraction and keeps the same value", async () => {
    let extractorSawFrozenData = false;
    const template = descriptor({
      extractLocalImageIds: (data) => {
        extractorSawFrozenData = Object.isFrozen(data);
        Reflect.set(data, "name", "Mutated");
        return [];
      },
    });
    const identity = await createFontManifestIdentity(getPdfTheme("neutral"));
    const normalized = normalizeTemplateInput(
      template,
      { data: { imageIds: [], name: "Ada" } },
      { fontManifestIdentity: identity, localImageDescriptors: [] },
    );
    expect(extractorSawFrozenData).toBe(true);
    expect(normalized.data.name).toBe("Ada");
    expect(Object.isFrozen(normalized.data)).toBe(true);
  });

  it("never substitutes fixture data and preserves structured validation paths", async () => {
    const template = descriptor();
    const identity = await createFontManifestIdentity(getPdfTheme("neutral"));
    expect(() =>
      normalizeTemplateInput(template, {} as never, {
        fontManifestIdentity: identity,
        localImageDescriptors: [],
      }),
    ).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["data"] })],
      }),
    );
    expect(() =>
      normalizeTemplateInput(
        template,
        { data: { imageIds: [], name: 4 } as never },
        { fontManifestIdentity: identity, localImageDescriptors: [] },
      ),
    ).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["data", "name"] })],
      }),
    );
    expect(() =>
      normalizeTemplateInput(
        template,
        {
          data: { imageIds: [], name: "Ada" },
          options: { theme: "neutral" },
        } as never,
        { fontManifestIdentity: identity, localImageDescriptors: [] },
      ),
    ).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["options"] })],
      }),
    );
  });

  it("resolves discriminated formats and rejects unsupported continuous print", async () => {
    const identity = await createFontManifestIdentity(getPdfTheme("neutral"));
    const custom = normalizeTemplateInput(
      descriptor(),
      {
        data: { imageIds: [], name: "Ada" },
        format: {
          id: "label-custom",
          widthMm: 70,
          heightMm: 37,
          orientation: "portrait",
        },
      },
      { fontManifestIdentity: identity, localImageDescriptors: [] },
    );
    expect(custom.format).toMatchObject({
      id: "label-custom",
      orientation: "portrait",
    });

    const continuous = descriptor({
      supportedFormatIds: ["receipt-58"],
      defaultFormatId: "receipt-58",
      supportedPrintProfileKinds: ["screen", "print"],
    });
    expect(() =>
      normalizeTemplateInput(
        continuous,
        {
          data: { imageIds: [], name: "Ada" },
          printProfile: { kind: "print", bleedMm: 0, cropMarks: false },
        },
        { fontManifestIdentity: identity, localImageDescriptors: [] },
      ),
    ).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["printProfile"] })],
      }),
    );
  });

  it("accepts only exact local image descriptor sets and canonicalizes their order", async () => {
    const template = descriptor();
    const identity = await createFontManifestIdentity(getPdfTheme("neutral"));
    const first = imageDescriptor("first");
    const second = imageDescriptor("second", {
      sha256: `sha256:${"b".repeat(64)}`,
    });
    const normalized = normalizeTemplateInput(
      template,
      { data: { imageIds: ["second", "first", "first"], name: "Ada" } },
      {
        fontManifestIdentity: identity,
        localImageDescriptors: [second, first],
      },
    );
    expect(normalized.localImageDescriptors.map(({ id }) => id)).toEqual([
      "first",
      "second",
    ]);
    expect(() =>
      normalizeTemplateInput(
        template,
        { data: { imageIds: ["first"], name: "Ada" } },
        {
          fontManifestIdentity: identity,
          localImageDescriptors: [first, second],
        },
      ),
    ).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["localImageDescriptors"] })],
      }),
    );
  });

  it("rejects modified bare themes and requires role-specific font qualification", async () => {
    const identity = await createFontManifestIdentity(getPdfTheme("neutral"));
    expect(() =>
      normalizeTemplateInput(
        descriptor(),
        {
          data: { imageIds: [], name: "Ada" },
          theme: getPdfTheme("neutral", "#0f766e"),
        },
        { fontManifestIdentity: identity, localImageDescriptors: [] },
      ),
    ).toThrowError(expect.objectContaining({ code: "INVALID_DATA" }));

    const colorCustom = createPdfTheme({
      baseThemeId: "neutral",
      colors: { accent: "#123456" },
    });
    expect(() =>
      normalizeTemplateInput(
        descriptor(),
        {
          data: { imageIds: [], name: "Ada" },
          theme: { ...colorCustom, id: "editorial" } as never,
        },
        { fontManifestIdentity: identity, localImageDescriptors: [] },
      ),
    ).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["theme", "id"] })],
      }),
    );

    const custom = createPdfTheme({
      baseThemeId: "neutral",
      fonts: { heading: "Noto Serif" },
    });
    const editorialIdentity = await createFontManifestIdentity(custom);
    expect(() =>
      normalizeTemplateInput(
        descriptor(),
        { data: { imageIds: [], name: "Ada" }, theme: custom },
        {
          fontManifestIdentity: editorialIdentity,
          localImageDescriptors: [],
        },
      ),
    ).toThrowError(expect.objectContaining({ code: "ASSET_REJECTED" }));

    expect(
      normalizeTemplateInput(
        descriptor({
          themeCompatibility: { headingFontFamilies: ["Noto Serif"] },
        }),
        { data: { imageIds: [], name: "Ada" }, theme: custom },
        {
          fontManifestIdentity: editorialIdentity,
          localImageDescriptors: [],
        },
      ).theme.theme.fonts.heading,
    ).toBe("Noto Serif");
  });

  it("fingerprints every normalized render-affecting field and canonical equivalents", async () => {
    const baseDescriptor = descriptor();
    const neutralIdentity = await createFontManifestIdentity(
      getPdfTheme("neutral"),
    );
    const base = normalizeTemplateInput(
      baseDescriptor,
      { data: { imageIds: [], name: "Ada" } },
      { fontManifestIdentity: neutralIdentity, localImageDescriptors: [] },
    );
    const baseline = await fingerprintNormalizedTemplateInput(base);
    const equivalent = normalizeTemplateInput(
      baseDescriptor,
      {
        format: "a4",
        locale: "en",
        revision: 1,
        printProfile: { kind: "screen" },
        theme: "neutral",
        data: { name: "Ada", imageIds: [] },
      },
      { localImageDescriptors: [], fontManifestIdentity: neutralIdentity },
    );
    expect(await fingerprintNormalizedTemplateInput(equivalent)).toBe(baseline);
    const unicodeOrderA = {
      ...base,
      data: { imageIds: [], name: "Ada", é: 1, "!": 2 },
    };
    const unicodeOrderB = {
      ...base,
      data: { "!": 2, é: 1, name: "Ada", imageIds: [] },
    };
    expect(await fingerprintNormalizedTemplateInput(unicodeOrderA)).toBe(
      await fingerprintNormalizedTemplateInput(unicodeOrderB),
    );

    const variants = [
      normalizeTemplateInput(
        baseDescriptor,
        { data: { imageIds: [], name: "Grace" } },
        { fontManifestIdentity: neutralIdentity, localImageDescriptors: [] },
      ),
      normalizeTemplateInput(
        baseDescriptor,
        { data: { imageIds: [], name: "Ada" }, format: "letter" },
        { fontManifestIdentity: neutralIdentity, localImageDescriptors: [] },
      ),
      normalizeTemplateInput(
        baseDescriptor,
        { data: { imageIds: [], name: "Ada" }, locale: "fr" },
        { fontManifestIdentity: neutralIdentity, localImageDescriptors: [] },
      ),
      normalizeTemplateInput(
        baseDescriptor,
        {
          data: { imageIds: [], name: "Ada" },
          printProfile: { kind: "print", bleedMm: 3, cropMarks: true },
        },
        { fontManifestIdentity: neutralIdentity, localImageDescriptors: [] },
      ),
      normalizeTemplateInput(
        baseDescriptor,
        { data: { imageIds: [], name: "Ada" }, revision: 2 },
        { fontManifestIdentity: neutralIdentity, localImageDescriptors: [] },
      ),
      normalizeTemplateInput(
        descriptor({ version: "1.0.1" }),
        { data: { imageIds: [], name: "Ada" } },
        { fontManifestIdentity: neutralIdentity, localImageDescriptors: [] },
      ),
      normalizeTemplateInput(
        descriptor({ schemaVersion: 2 }),
        { data: { imageIds: [], name: "Ada" } },
        { fontManifestIdentity: neutralIdentity, localImageDescriptors: [] },
      ),
      normalizeTemplateInput(
        descriptor({ id: "resume-accountant" as TemplateId }),
        { data: { imageIds: [], name: "Ada" } },
        { fontManifestIdentity: neutralIdentity, localImageDescriptors: [] },
      ),
    ];
    for (const variant of variants) {
      expect(await fingerprintNormalizedTemplateInput(variant)).not.toBe(
        baseline,
      );
    }

    const custom = createPdfTheme({
      baseThemeId: "neutral",
      colors: { accent: "#123456" },
    });
    expect(
      await fingerprintNormalizedTemplateInput(
        normalizeTemplateInput(
          baseDescriptor,
          { data: { imageIds: [], name: "Ada" }, theme: custom },
          { fontManifestIdentity: neutralIdentity, localImageDescriptors: [] },
        ),
      ),
    ).not.toBe(baseline);

    expect(
      await fingerprintNormalizedTemplateInput({
        ...base,
        fontManifestIdentity: {
          ...base.fontManifestIdentity,
          sha256: `sha256:${"c".repeat(64)}`,
        },
      }),
    ).not.toBe(baseline);

    const withImage = normalizeTemplateInput(
      baseDescriptor,
      { data: { imageIds: ["hero"], name: "Ada" } },
      {
        fontManifestIdentity: neutralIdentity,
        localImageDescriptors: [imageDescriptor("hero")],
      },
    );
    const imageBaseline = await fingerprintNormalizedTemplateInput(withImage);
    expect(imageBaseline).not.toBe(baseline);
    expect(
      await fingerprintNormalizedTemplateInput({
        ...withImage,
        localImageDescriptors: [
          {
            ...withImage.localImageDescriptors[0]!,
            sha256: `sha256:${"d".repeat(64)}`,
          },
        ],
      }),
    ).not.toBe(imageBaseline);
  });

  it("leaves protocol V1 and its fingerprint behavior unchanged", async () => {
    const request: RenderRequest = {
      assetIds: [],
      data: { a: 1, b: 2 },
      formatId: "a4",
      locale: "en",
      printProfile: { kind: "screen" },
      protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
      revision: 1,
      templateId: "resume-classic",
      templateVersion: "1.0.0",
      themeId: "neutral",
    };
    expect(PDF_RENDER_PROTOCOL_VERSION).toBe(1);
    expect(await fingerprintRenderRequest(request)).toBe(
      await fingerprintRenderRequest({ ...request, data: { b: 2, a: 1 } }),
    );
    expect(
      await fingerprintRenderRequest({ ...request, revision: 2 }),
    ).not.toBe(await fingerprintRenderRequest(request));
  });
});
