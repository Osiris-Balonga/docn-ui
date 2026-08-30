import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";

export const EVENT_TICKET_LANDSCAPE_FORMAT_IDS = [
  "ticket-210x74",
  "ticket-150x70",
] as const;

export const eventTicketClassicMetadata = {
  id: "event-ticket-classic",
  version: "1.0.0",
  schemaVersion: 1,
  family: "ticket",
  title: "Classic event ticket",
  description:
    "A boarding-pass-inspired ticket with an isolated QR stub and admission rail.",
  tags: ["classic", "landscape", "qr"],
  supportedFormatIds: EVENT_TICKET_LANDSCAPE_FORMAT_IDS,
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: true },
} as const satisfies TemplateMetadata & Record<string, unknown>;
