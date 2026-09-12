import { z } from "zod";
import type { JsonObject } from "../../template-contract";
import type {
  LegacyTemplateStyleProjection,
  RenderableTemplate,
  TemplatePlanContext,
  TemplateRenderPlan,
} from "../../renderable-template";
import {
  VioletFounderBusinessCard,
  type VioletFounderBusinessCardProps,
} from "../business-cards/violet-founder-business-card";
import { defineTemplateDescriptor } from "../../template-contract";

export type VioletFounderBusinessCardData = JsonObject & Record<string, never>;

const dataSchema = z.object({}).strict() as z.ZodType<
  VioletFounderBusinessCardData,
  z.ZodTypeDef,
  unknown
>;

export const violetFounderBusinessCardRenderable = defineTemplateDescriptor<
  VioletFounderBusinessCardData,
  RenderableTemplate<VioletFounderBusinessCardData>
>({
  id: "business-card-violet-founder",
  version: "1.0.0",
  schemaVersion: 1,
  family: "business-card",
  schema: dataSchema,
  defaultData: {},
  exampleData: {},
  supportedFormatIds: ["card-85x55"],
  defaultFormatId: "card-85x55",
  supportedThemeIds: ["neutral"],
  defaultThemeId: "neutral",
  supportedLocales: ["en"],
  defaultLocale: "en",
  supportedPrintProfileKinds: ["screen", "print"],
  defaultPrintProfile: { kind: "screen" },
  themeCompatibility: {},
  extractLocalImageIds: () => [],
  createPlan(
    context: TemplatePlanContext<VioletFounderBusinessCardData>,
  ): TemplateRenderPlan {
    if (context.format.kind !== "fixed") {
      throw new Error("Violet founder business card requires a fixed format.");
    }
    const style = projectLegacyStyle(context.legacyStyle);
    return {
      kind: "fixed",
      plan: {
        document: <VioletFounderBusinessCard {...(style ? { style } : {})} />,
        format: context.format,
        printProfile: context.printProfile,
      },
    };
  },
});

function projectLegacyStyle(
  projection: LegacyTemplateStyleProjection | undefined,
): VioletFounderBusinessCardProps["style"] {
  if (!projection) return undefined;
  return {
    ...(projection.colors ? { colors: { ...projection.colors } } : {}),
    ...(projection.fontFamilies
      ? { fonts: { ...projection.fontFamilies } }
      : {}),
  };
}
