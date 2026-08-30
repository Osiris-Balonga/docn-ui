import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const eventTicketConferenceMetadata = {
  id: "event-ticket-conference",
  version: "1.0.0",
  schemaVersion: 1,
  family: "ticket",
  title: "Conference event ticket",
  description:
    "An attendee-first conference pass with dedicated portrait and landscape compositions.",
  tags: ["conference", "attendee", "qr"],
  supportedFormatIds: ["ticket-a6", "ticket-150x70"],
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: true },
} as const satisfies TemplateMetadata & Record<string, unknown>;
