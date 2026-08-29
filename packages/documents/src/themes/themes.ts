import { z } from "zod";
import { DocumentValidationError, normalizeDocumentPath } from "../core/errors";
import { THEME_IDS, type ThemeId } from "../core/contracts";

const colorSchema = z.string().regex(/^#[0-9a-f]{6}$/);
const pointSizeSchema = z.number().min(5).max(32);
const spacingSchema = z.number().min(0).max(48);

const pdfThemeSchema = z
  .object({
    id: z.enum(THEME_IDS),
    colors: z
      .object({
        canvas: colorSchema,
        surface: colorSchema,
        text: colorSchema,
        mutedText: colorSchema,
        accent: colorSchema,
        border: colorSchema,
        invertedText: colorSchema,
      })
      .strict(),
    fonts: z
      .object({
        body: z.enum(["Noto Sans", "Noto Serif"]),
        heading: z.enum(["Noto Sans", "Noto Serif"]),
        regularWeight: z.literal(400),
        strongWeight: z.literal(700),
      })
      .strict(),
    typeScale: z
      .object({
        caption: pointSizeSchema,
        body: pointSizeSchema,
        label: pointSizeSchema,
        heading: pointSizeSchema,
        display: pointSizeSchema,
      })
      .strict(),
    spacing: z
      .object({
        xs: spacingSchema,
        sm: spacingSchema,
        md: spacingSchema,
        lg: spacingSchema,
        xl: spacingSchema,
      })
      .strict(),
  })
  .strict();

export type PdfTheme = z.infer<typeof pdfThemeSchema>;

const themeInputs: Record<ThemeId, unknown> = {
  neutral: {
    id: "neutral",
    colors: {
      canvas: "#f7f5f1",
      surface: "#ffffff",
      text: "#1f2933",
      mutedText: "#667085",
      accent: "#3f5f73",
      border: "#d8dde3",
      invertedText: "#ffffff",
    },
    fonts: {
      body: "Noto Sans",
      heading: "Noto Sans",
      regularWeight: 400,
      strongWeight: 700,
    },
    typeScale: { caption: 7, body: 9, label: 10, heading: 16, display: 22 },
    spacing: { xs: 2, sm: 4, md: 8, lg: 12, xl: 18 },
  },
  editorial: {
    id: "editorial",
    colors: {
      canvas: "#f8f2e8",
      surface: "#fffdf8",
      text: "#28231f",
      mutedText: "#75695f",
      accent: "#9a4f35",
      border: "#d8c9b8",
      invertedText: "#fffdf8",
    },
    fonts: {
      body: "Noto Sans",
      heading: "Noto Serif",
      regularWeight: 400,
      strongWeight: 700,
    },
    typeScale: { caption: 7, body: 9, label: 10, heading: 17, display: 24 },
    spacing: { xs: 2, sm: 5, md: 9, lg: 14, xl: 20 },
  },
  bold: {
    id: "bold",
    colors: {
      canvas: "#f4f1ff",
      surface: "#ffffff",
      text: "#17132e",
      mutedText: "#625b78",
      accent: "#5a35d6",
      border: "#cfc6f5",
      invertedText: "#ffffff",
    },
    fonts: {
      body: "Noto Sans",
      heading: "Noto Sans",
      regularWeight: 400,
      strongWeight: 700,
    },
    typeScale: { caption: 7, body: 9, label: 11, heading: 18, display: 26 },
    spacing: { xs: 3, sm: 6, md: 10, lg: 16, xl: 24 },
  },
};

function validateTheme(input: unknown): PdfTheme {
  const parsed = pdfThemeSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => ({
      code: "INVALID_DATA" as const,
      message: issue.message,
      path: ["theme", ...normalizeDocumentPath(issue.path)],
    }));
    const [first, ...rest] = issues;
    if (!first) throw new Error("Theme validation failed without an issue.");
    throw new DocumentValidationError([first, ...rest]);
  }
  const sizes = Object.values(parsed.data.typeScale);
  const spacing = Object.values(parsed.data.spacing);
  if (
    sizes.some((size, index) => index > 0 && size < (sizes[index - 1] ?? 0))
  ) {
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message: "Theme type sizes must be ordered from caption to display.",
        path: ["theme", "typeScale"],
      },
    ]);
  }
  if (
    spacing.some(
      (value, index) => index > 0 && value < (spacing[index - 1] ?? 0),
    )
  ) {
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message: "Theme spacing must be ordered from xs to xl.",
        path: ["theme", "spacing"],
      },
    ]);
  }
  return parsed.data;
}

export const themes = Object.fromEntries(
  THEME_IDS.map((themeId) => [themeId, validateTheme(themeInputs[themeId])]),
) as Record<ThemeId, PdfTheme>;

export function getPdfTheme(themeId: string): PdfTheme {
  if (!THEME_IDS.includes(themeId as ThemeId)) {
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message: `Unknown PDF theme "${themeId}".`,
        path: ["themeId"],
      },
    ]);
  }
  return themes[themeId as ThemeId];
}
