import type { RenderResult } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";
import type {
  JsonObject,
  NormalizedTemplateInput,
  TemplateRenderInput,
} from "../template-contract";
import {
  createFontManifestIdentity,
  fingerprintNormalizedTemplateInput,
} from "../template-contract";
import { normalizeTemplateInputForRender } from "../template-normalization.internal";
import {
  createLegacyTemplateStyleProjection,
  type RenderableTemplate,
  type TemplateRenderPlan,
} from "../renderable-template";
import type { AssetResolver } from "./assets";
import type { LocalImageResolver, PreparedLocalImages } from "./local-images";
import { createNodeLocalImageRenderScope } from "./local-images.node";
import { renderContinuousDocumentInNode, renderDocumentInNode } from "./node";
import { createRenderResult } from "./result";
import {
  createVerifiedNodeAssetResolver,
  verifyVerifiedNodeFontRegistrationBoundary,
} from "./verified-assets.node";

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
  normalized: NormalizedTemplateInput<JsonObject>,
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
  const { normalized, themeWasExplicit } =
    await normalizeTemplateInputForRender(
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
              message:
                "A localImageResolver is required for template image IDs.",
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
      themeWasExplicit,
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
    await verifyVerifiedNodeFontRegistrationBoundary(assetResolver);
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
