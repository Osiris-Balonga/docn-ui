import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ThemeId } from "../core/contracts";
import type { FormatId } from "../core/formats";

export interface TemplateSampleAssets {
  badgeCreativePortraitSource: string;
  badgeDeveloperPortraitSource: string;
  badgePatternSource: string;
  invoiceLandscapeSource: string;
  portraitSource: string;
  productCardDeckSource: string;
  productNotebookSource: string;
  studioLogoSource: string;
  supportPortraitSource: string;
}

export interface TemplateDefinition {
  capabilities: {
    logo: boolean;
    printProfiles: boolean;
    qr: boolean;
  };
  description: string;
  family:
    "badge" | "business-card" | "invoice" | "receipt" | "report" | "resume";
  familyLabel: string;
  id: string;
  renderSample(assets: TemplateSampleAssets): ReactElement<DocumentProps>;
  sides: number;
  slug: string;
  supportedFormatIds: readonly FormatId[];
  supportedThemeIds: readonly ThemeId[];
  tags: readonly string[];
  title: string;
  version: string;
}
