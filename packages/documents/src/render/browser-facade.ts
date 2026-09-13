import { DocumentValidationError } from "../core/errors";
import type { JsonObject, TemplateRenderInput } from "../template-contract";
import { createFontManifestIdentity } from "../template-contract";
import { normalizeTemplateInputForRender } from "../template-normalization.internal";
import type { RenderableTemplate } from "../renderable-template";
import { renderNormalizedPdfInBrowser } from "./browser-normalized-render";
import type { LocalImageResolver, PreparedLocalImages } from "./local-images";
import { createVerifiedBrowserAssetResolver } from "./verified-assets.browser";
import type { RenderResult } from "../core/contracts";
import type { AssetResolver } from "./assets";

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

export function parseBrowserRenderRuntimeOptions(
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
  return renderNormalizedPdfInBrowser(
    template,
    normalized,
    preparedImages,
    verifiedAssetResolver,
    themeWasExplicit,
  );
}
