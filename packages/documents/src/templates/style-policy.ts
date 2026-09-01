import type { ThemeId } from "../core/contracts";
import {
  createPdfTheme,
  type PdfTheme,
  type PdfThemeOverrides,
} from "../themes/themes";

export interface TemplateStyleDefinition<
  TSlots extends Record<string, string> = Record<string, string>,
> {
  slots: Readonly<TSlots>;
  theme: PdfTheme;
}

export interface TemplateStyleOverrides<
  TSlots extends Record<string, string> = Record<string, string>,
> {
  colors?: Partial<PdfTheme["colors"]>;
  fonts?: Partial<PdfTheme["fonts"]>;
  slots?: Partial<TSlots>;
}

export function defineTemplateStyle<TSlots extends Record<string, string>>(
  themeId: ThemeId,
  themeOverrides: PdfThemeOverrides,
  slots: TSlots,
): TemplateStyleDefinition<TSlots> {
  return {
    theme: createPdfTheme(themeId, themeOverrides),
    slots: { ...slots },
  };
}

export function resolveTemplateStyle<TSlots extends Record<string, string>>(
  definition: TemplateStyleDefinition<TSlots>,
  overrides?: TemplateStyleOverrides<TSlots>,
): TemplateStyleDefinition<TSlots> {
  if (!overrides) return definition;
  return {
    theme: createPdfTheme(definition.theme.id, {
      colors: { ...definition.theme.colors, ...overrides.colors },
      fonts: { ...definition.theme.fonts, ...overrides.fonts },
      spacing: definition.theme.spacing,
      typeScale: definition.theme.typeScale,
    }),
    slots: { ...definition.slots, ...overrides.slots },
  };
}
