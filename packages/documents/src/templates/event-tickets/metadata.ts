import { eventTicketClassicMetadata } from "./event-ticket-classic/metadata";
import { eventTicketConferenceMetadata } from "./event-ticket-conference/metadata";
import { eventTicketLiveMetadata } from "./event-ticket-live/metadata";

export const eventTicketTemplateMetadata = {
  "event-ticket-classic": eventTicketClassicMetadata,
  "event-ticket-conference": eventTicketConferenceMetadata,
  "event-ticket-live": eventTicketLiveMetadata,
} as const;

export type EventTicketTemplateId = keyof typeof eventTicketTemplateMetadata;

export function getEventTicketTemplateMetadata(templateId: string) {
  return templateId in eventTicketTemplateMetadata
    ? eventTicketTemplateMetadata[templateId as EventTicketTemplateId]
    : undefined;
}
