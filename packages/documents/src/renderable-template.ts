import type { DocumentLocale } from "./core/contracts";
import type { PrintProfile, ResolvedFormat } from "./core/formats";
import type {
  ContinuousDocumentRenderPlan,
  FixedDocumentRenderPlan,
} from "./render/runtime";
import type { LocalImageId } from "./template-contract";
import {
  type DeepReadonly,
  type JsonObject,
  type QualifiedPdfFontFamily,
  type ResolvedTemplateTheme,
  type TemplateDescriptor,
} from "./template-contract";
import { getCanonicalPdfTheme, type PdfTheme } from "./themes/themes";

export interface ResolvedLocalImage {
  readonly id: LocalImageId;
  readonly resolvedSource: string;
}

export type ResolvedLocalImageLookup = ReadonlyMap<
  LocalImageId,
  ResolvedLocalImage
>;

export interface LegacyTemplateStyleProjection {
  readonly colors?: Partial<DeepReadonly<PdfTheme["colors"]>>;
  readonly fontFamilies?: {
    readonly body?: QualifiedPdfFontFamily;
    readonly heading?: QualifiedPdfFontFamily;
  };
}

export interface TemplatePlanContext<TData extends JsonObject> {
  readonly data: TData;
  readonly format: ResolvedFormat;
  readonly legacyStyle?: LegacyTemplateStyleProjection;
  readonly localImages: ResolvedLocalImageLookup;
  readonly locale: DocumentLocale;
  readonly printProfile: PrintProfile;
  readonly resolvedTheme: ResolvedTemplateTheme;
}

export type TemplateRenderPlan =
  | { readonly kind: "fixed"; readonly plan: FixedDocumentRenderPlan }
  | { readonly kind: "flow"; readonly plan: FixedDocumentRenderPlan }
  | {
      readonly kind: "continuous";
      readonly plan: ContinuousDocumentRenderPlan;
    };

export interface RenderableTemplate<
  TData extends JsonObject,
> extends TemplateDescriptor<TData> {
  createPlan(context: TemplatePlanContext<TData>): TemplateRenderPlan;
}

export function createLegacyTemplateStyleProjection<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
  resolvedTheme: ResolvedTemplateTheme,
  themeWasExplicit: boolean,
): LegacyTemplateStyleProjection | undefined {
  if (!themeWasExplicit) return undefined;
  const defaultTheme = getCanonicalPdfTheme(descriptor.defaultThemeId);
  const colors = Object.fromEntries(
    (Object.keys(defaultTheme.colors) as (keyof PdfTheme["colors"])[])
      .filter(
        (role) =>
          resolvedTheme.theme.colors[role] !== defaultTheme.colors[role],
      )
      .map((role) => [role, resolvedTheme.theme.colors[role]]),
  ) as Partial<PdfTheme["colors"]>;
  const fontFamilies: {
    body?: QualifiedPdfFontFamily;
    heading?: QualifiedPdfFontFamily;
  } = {};
  for (const role of ["body", "heading"] as const) {
    const family = resolvedTheme.theme.fonts[role];
    const allowed = descriptor.themeCompatibility[`${role}FontFamilies`];
    if (family !== defaultTheme.fonts[role] && allowed?.includes(family)) {
      fontFamilies[role] = family;
    }
  }
  if (
    Object.keys(colors).length === 0 &&
    Object.keys(fontFamilies).length === 0
  ) {
    return undefined;
  }
  const projection = {
    ...(Object.keys(colors).length > 0
      ? { colors: Object.freeze(colors) }
      : {}),
    ...(Object.keys(fontFamilies).length > 0
      ? { fontFamilies: Object.freeze(fontFamilies) }
      : {}),
  };
  return Object.freeze(projection);
}
