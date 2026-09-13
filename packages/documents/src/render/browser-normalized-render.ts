import type { RenderResult } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";
import type { JsonObject, NormalizedTemplateInput } from "../template-contract";
import { fingerprintNormalizedTemplateInput } from "../template-contract";
import {
  createLegacyTemplateStyleProjection,
  type RenderableTemplate,
  type TemplateRenderPlan,
} from "../renderable-template";
import type { AssetResolver } from "./assets";
import { renderDocumentInBrowser } from "./browser";
import type { PreparedLocalImages } from "./local-images";
import { createBrowserLocalImageRenderScope } from "./local-images.browser";
import { createRenderResult } from "./result";
import { throwStructuredRenderFailure } from "./structured-errors";
import { withVerifiedBrowserFontPriority } from "./verified-assets.browser";

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

export async function renderNormalizedPdfInBrowser<TData extends JsonObject>(
  template: RenderableTemplate<TData>,
  normalized: NormalizedTemplateInput<TData>,
  preparedImages: PreparedLocalImages,
  assetResolver: AssetResolver,
  themeWasExplicit: boolean,
): Promise<RenderResult> {
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
    const pdfBytes = await withVerifiedBrowserFontPriority(assetResolver, () =>
      renderPlanInBrowser(
        renderPlan,
        normalized as NormalizedTemplateInput<JsonObject>,
        assetResolver,
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
