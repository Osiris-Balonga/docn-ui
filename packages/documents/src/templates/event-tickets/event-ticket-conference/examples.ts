import type { EventTicketData } from "../schema";

export const conferenceEventTicketExample = {
  eventName: "Open Source Documentation Summit",
  startsAt: "2026-10-08T08:00:00.000Z",
  timeZone: "Europe/Paris",
  venue: "Maison de la Mutualité, Paris",
  attendeeName: "Sofia Almeida",
  ticketId: "OSDS-26-0187",
  category: "Speaker",
  seat: "Auditorium A",
  qrPayload: "docn-ticket:OSDS-26-0187:speaker",
} as const satisfies EventTicketData;
