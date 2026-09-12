import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  createNodeAssetResolver,
  createVerifiedNodeAssetResolver,
} from "./assets.node";
import type { AssetResolver } from "./assets";
import type { RenderResult } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";
import type { JsonObject, TemplateRenderInput } from "../template-contract";
import {
  createFontManifestIdentity,
  fingerprintNormalizedTemplateInput,
  normalizeTemplateInputForRender,
} from "../template-contract";
import {
  createLegacyTemplateStyleProjection,
  type RenderableTemplate,
  type TemplateRenderPlan,
} from "../renderable-template";
import {
  renderContinuousDocument,
  renderFixedDocument,
  type ContinuousDocumentRenderPlan,
  type DocumentRenderRuntime,
  type FixedDocumentRenderPlan,
} from "./runtime";
import type { LocalImageResolver, PreparedLocalImages } from "./local-images";
import { createNodeLocalImageRenderScope } from "./local-images.node";
import { createRenderResult } from "./result";

export type { LocalImageResolver, LocalImageSource } from "./local-images";

export interface NodeRenderRuntimeOptions {
  fontAssetDirectory?: string;
  localImageResolver?: LocalImageResolver;
}

function runtimeOptionFailure(message: string, field?: string): never {
  throw new DocumentValidationError([
    {
      code: "INVALID_DATA",
      message,
      path: ["runtimeOptions", ...(field ? [field] : [])],
    },
  ]);
}

function parseNodeRenderRuntimeOptions(
  value: NodeRenderRuntimeOptions | undefined,
): NodeRenderRuntimeOptions {
  if (value === undefined) return {};
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    (Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null)
  ) {
    return runtimeOptionFailure("Node runtime options must be a plain object.");
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== "string") {
      runtimeOptionFailure("Unknown symbol-keyed Node runtime option.");
    }
    if (key !== "fontAssetDirectory" && key !== "localImageResolver") {
      runtimeOptionFailure(`Unknown Node runtime option "${key}".`, key);
    }
    if (descriptors[key]?.get || descriptors[key]?.set) {
      runtimeOptionFailure("Node runtime options cannot use accessors.", key);
    }
  }
  if (
    value.fontAssetDirectory !== undefined &&
    (typeof value.fontAssetDirectory !== "string" ||
      value.fontAssetDirectory.trim().length === 0 ||
      value.fontAssetDirectory.includes("\u0000"))
  ) {
    runtimeOptionFailure(
      "fontAssetDirectory must be a non-empty filesystem path.",
      "fontAssetDirectory",
    );
  }
  if (
    value.localImageResolver !== undefined &&
    typeof value.localImageResolver !== "function"
  ) {
    runtimeOptionFailure(
      "localImageResolver must be a function.",
      "localImageResolver",
    );
  }
  return {
    ...(value.fontAssetDirectory === undefined
      ? {}
      : { fontAssetDirectory: value.fontAssetDirectory }),
    ...(value.localImageResolver === undefined
      ? {}
      : { localImageResolver: value.localImageResolver }),
  };
}

function planFailure(message: string): never {
  throw new DocumentValidationError([
    {
      code: "RENDER_FAILED",
      message,
      path: ["template", "createPlan"],
    },
  ]);
}

function canonicalValue(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalValue).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalValue(item)}`)
    .join(",")}}`;
}

function sameValue(left: unknown, right: unknown) {
  return canonicalValue(left) === canonicalValue(right);
}

async function renderPlanInNode(
  renderPlan: TemplateRenderPlan,
  normalized: Awaited<ReturnType<typeof normalizeTemplateInputForRender>>,
  assetResolver: AssetResolver,
) {
  if (renderPlan.kind === "continuous") {
    if (
      normalized.format.kind !== "continuous" ||
      normalized.printProfile.kind !== "screen" ||
      !sameValue(renderPlan.plan.format, normalized.format)
    ) {
      return planFailure(
        "The continuous template plan does not match the normalized format and profile.",
      );
    }
    return renderContinuousDocumentInNode(renderPlan.plan, assetResolver);
  }
  if (
    normalized.format.kind !== "fixed" ||
    !sameValue(renderPlan.plan.format, normalized.format) ||
    !sameValue(renderPlan.plan.printProfile, normalized.printProfile)
  ) {
    return planFailure(
      "The template plan does not match the normalized format and print profile.",
    );
  }
  return renderDocumentInNode(renderPlan.plan, assetResolver);
}

export async function renderPdf<TData extends JsonObject>(
  template: RenderableTemplate<TData>,
  input: TemplateRenderInput<TData>,
  runtimeOptions?: NodeRenderRuntimeOptions,
): Promise<RenderResult> {
  const options = parseNodeRenderRuntimeOptions(runtimeOptions);
  let assetResolver: AssetResolver | undefined;
  let preparedImages: PreparedLocalImages = [];
  const normalized = await normalizeTemplateInputForRender(
    template,
    input,
    async ({ imageIds, resolvedTheme }) => {
      assetResolver = await createVerifiedNodeAssetResolver(
        options.fontAssetDirectory,
      );
      if (imageIds.length > 0 && !options.localImageResolver) {
        throw new DocumentValidationError([
          {
            code: "ASSET_REJECTED",
            message: "A localImageResolver is required for template image IDs.",
            path: ["runtimeOptions", "localImageResolver"],
          },
        ]);
      }
      if (imageIds.length > 0 && options.localImageResolver) {
        const { preflightLocalImages } = await import("./local-images");
        preparedImages = await preflightLocalImages(
          imageIds,
          options.localImageResolver,
        );
      }
      return {
        fontManifestIdentity: await createFontManifestIdentity(
          resolvedTheme.theme,
        ),
        localImageDescriptors: preparedImages.map(
          ({ descriptor }) => descriptor,
        ),
      };
    },
  );
  if (!assetResolver) {
    throw new Error("Node font assets were not prepared.");
  }
  const imageScope = createNodeLocalImageRenderScope(preparedImages);
  try {
    const legacyStyle = createLegacyTemplateStyleProjection(
      template,
      normalized.theme,
      input.theme !== undefined,
    );
    const renderPlan = template.createPlan({
      data: normalized.data,
      format: normalized.format,
      ...(legacyStyle ? { legacyStyle } : {}),
      localImages: imageScope.lookup,
      locale: normalized.locale,
      printProfile: normalized.printProfile,
      resolvedTheme: normalized.theme,
    });
    const pdfBytes = await renderPlanInNode(
      renderPlan,
      normalized,
      assetResolver,
    );
    return createRenderResult(
      pdfBytes,
      await fingerprintNormalizedTemplateInput(normalized),
      normalized.revision,
    );
  } finally {
    imageScope.dispose();
  }
}

async function measureContinuousContent(
  bytes: Uint8Array,
  finalMarker: string,
) {
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
  });
  try {
    const document = await loadingTask.promise;
    if (document.numPages !== 1)
      return { pageCount: document.numPages, usedHeightPt: Infinity };
    const page = await document.getPage(1);
    const content = await page.getTextContent();
    const items = content.items.filter(
      (
        item,
      ): item is typeof item & {
        height: number;
        str: string;
        transform: number[];
      } => "str" in item && "height" in item && "transform" in item,
    );
    if (
      !items
        .map((item) => item.str)
        .join(" ")
        .includes(finalMarker)
    ) {
      throw new Error("The receipt final marker was not rendered.");
    }
    const pageHeight = (page.view[3] ?? 0) - (page.view[1] ?? 0);
    const lowerEdge = Math.min(
      ...items.map((item) => (item.transform[5] ?? 0) - item.height * 0.25),
    );
    return {
      pageCount: document.numPages,
      usedHeightPt: pageHeight - lowerEdge + 12,
    };
  } finally {
    await loadingTask.destroy();
  }
}

export function createNodeDocumentRuntime(
  assetResolver: AssetResolver = createNodeAssetResolver(),
): DocumentRenderRuntime {
  return {
    assetResolver,
    async renderDocument(document) {
      return new Uint8Array(await renderToBuffer(document));
    },
  };
}

export function renderDocumentInNode(
  plan: FixedDocumentRenderPlan,
  assetResolver?: AssetResolver,
): Promise<Uint8Array> {
  return renderFixedDocument(plan, createNodeDocumentRuntime(assetResolver));
}

export function renderContinuousDocumentInNode(
  plan: ContinuousDocumentRenderPlan,
  assetResolver?: AssetResolver,
): Promise<Uint8Array> {
  return renderContinuousDocument(
    plan,
    createNodeDocumentRuntime(assetResolver),
    measureContinuousContent,
  );
}
