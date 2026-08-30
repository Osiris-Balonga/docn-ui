import { THEME_IDS, type TemplateMetadata } from "../../../core/contracts";
import { EVENT_TICKET_LANDSCAPE_FORMAT_IDS } from "../event-ticket-classic/metadata";

export const eventTicketLiveMetadata = {
  id: "event-ticket-live",
  version: "1.0.0",
  schemaVersion: 1,
  family: "ticket",
  title: "Live event ticket",
  description:
    "An expressive landscape ticket with a prominent date and dedicated access field.",
  tags: ["live", "expressive", "landscape", "qr"],
  supportedFormatIds: EVENT_TICKET_LANDSCAPE_FORMAT_IDS,
  supportedThemeIds: THEME_IDS,
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: true },
} as const satisfies TemplateMetadata & Record<string, unknown>;
