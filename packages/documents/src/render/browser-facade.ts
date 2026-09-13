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
import { renderDocumentInBrowser } from "./browser";
import type { LocalImageResolver, PreparedLocalImages } from "./local-images";
import { createBrowserLocalImageRenderScope } from "./local-images.browser";
import { createRenderResult } from "./result";
import {
  createVerifiedBrowserAssetResolver,
  withVerifiedBrowserFontPriority,
} from "./verified-assets.browser";
import { throwStructuredRenderFailure } from "./structured-errors";

export type { LocalImageResolver, LocalImageSource } from "./local-images";

export interface BrowserRenderRuntimeOptions {
  fontAssetBaseUrl?: string | URL;
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

function runtimeOrigin(): URL {
  if (typeof globalThis.location?.origin !== "string") {
    return runtimeOptionFailure(
      "Browser rendering requires globalThis.location.origin.",
      "fontAssetBaseUrl",
    );
  }
  try {
    const origin = new URL(globalThis.location.origin);
    if (origin.protocol !== "http:" && origin.protocol !== "https:") {
      return runtimeOptionFailure(
        "Browser font assets require an HTTP(S) origin.",
        "fontAssetBaseUrl",
      );
    }
    return origin;
  } catch {
    return runtimeOptionFailure(
      "Browser rendering requires a valid globalThis.location.origin.",
      "fontAssetBaseUrl",
    );
  }
}

function parseBrowserRenderRuntimeOptions(
  value: BrowserRenderRuntimeOptions | undefined,
): {
  readonly fontAssetBaseUrl: string;
  readonly localImageResolver?: LocalImageResolver;
} {
  const origin = runtimeOrigin();
  if (value === undefined) return { fontAssetBaseUrl: origin.href };
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    (Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null)
  ) {
    return runtimeOptionFailure(
      "Browser runtime options must be a plain object.",
    );
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== "string") {
      runtimeOptionFailure("Unknown symbol-keyed Browser runtime option.");
    }
    if (key !== "fontAssetBaseUrl" && key !== "localImageResolver") {
      runtimeOptionFailure(`Unknown Browser runtime option "${key}".`, key);
    }
    if (descriptors[key]?.get || descriptors[key]?.set) {
      runtimeOptionFailure(
        "Browser runtime options cannot use accessors.",
        key,
      );
    }
  }
  const baseValue = descriptors.fontAssetBaseUrl?.value as unknown;
  const resolverValue = descriptors.localImageResolver?.value as unknown;
  if (
    baseValue !== undefined &&
    typeof baseValue !== "string" &&
    !(baseValue instanceof URL)
  ) {
    runtimeOptionFailure(
      "fontAssetBaseUrl must be a string or URL.",
      "fontAssetBaseUrl",
    );
  }
  let baseUrl = origin;
  if (baseValue !== undefined) {
    try {
      baseUrl = new URL(baseValue.toString(), origin);
    } catch {
      runtimeOptionFailure(
        "fontAssetBaseUrl must be a valid same-origin URL.",
        "fontAssetBaseUrl",
      );
    }
  }
  if (
    (baseUrl.protocol !== "http:" && baseUrl.protocol !== "https:") ||
    baseUrl.origin !== origin.origin ||
    baseUrl.username.length > 0 ||
    baseUrl.password.length > 0
  ) {
    runtimeOptionFailure(
      "fontAssetBaseUrl must resolve to globalThis.location.origin.",
      "fontAssetBaseUrl",
    );
  }
  if (resolverValue !== undefined && typeof resolverValue !== "function") {
    runtimeOptionFailure(
      "localImageResolver must be a function.",
      "localImageResolver",
    );
  }
  return {
    fontAssetBaseUrl: baseUrl.href,
    ...(resolverValue === undefined
      ? {}
      : { localImageResolver: resolverValue as LocalImageResolver }),
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

async function renderPlanInBrowser(
  renderPlan: TemplateRenderPlan,
  normalized: NormalizedTemplateInput<JsonObject>,
  assetResolver: AssetResolver,
): Promise<Uint8Array> {
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
    const { renderContinuousDocumentInBrowser } =
      await import("./continuous.browser");
    return renderContinuousDocumentInBrowser(renderPlan.plan, assetResolver);
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
  return renderDocumentInBrowser(renderPlan.plan, assetResolver);
}

export async function renderPdf<TData extends JsonObject>(
  template: RenderableTemplate<TData>,
  input: TemplateRenderInput<TData>,
  runtimeOptions?: BrowserRenderRuntimeOptions,
): Promise<RenderResult> {
  const options = parseBrowserRenderRuntimeOptions(runtimeOptions);
  let assetResolver: AssetResolver | undefined;
  let preparedImages: PreparedLocalImages = [];
  const { normalized, themeWasExplicit } =
    await normalizeTemplateInputForRender(
      template,
      input,
      async ({ imageIds, resolvedTheme }) => {
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
        assetResolver = await createVerifiedBrowserAssetResolver(
          options.fontAssetBaseUrl,
        );
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
  if (!assetResolver) throw new Error("Browser font assets were not prepared.");
  const verifiedAssetResolver = assetResolver;
  const imageScope = createBrowserLocalImageRenderScope(preparedImages);
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
    const pdfBytes = await withVerifiedBrowserFontPriority(
      verifiedAssetResolver,
      () =>
        renderPlanInBrowser(
          renderPlan,
          normalized as NormalizedTemplateInput<JsonObject>,
          verifiedAssetResolver,
        ),
    );
    return createRenderResult(
      new Uint8Array(pdfBytes),
      await fingerprintNormalizedTemplateInput(normalized),
      normalized.revision,
    );
  } catch (error) {
    throwStructuredRenderFailure(error);
  } finally {
    imageScope.dispose();
  }
}
