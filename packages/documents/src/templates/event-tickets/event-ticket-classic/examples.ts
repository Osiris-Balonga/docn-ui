import type { EventTicketData } from "../schema";

export const classicEventTicketExample = {
  eventName: "Design Systems Brazzaville",
  startsAt: "2026-09-12T18:30:00.000Z",
  timeZone: "Africa/Brazzaville",
  venue: "M'Pila Conference Centre",
  attendeeName: "Arielle Mavoungou",
  ticketId: "DSB-2026-0042",
  category: "Conference pass",
  seat: "B-12",
  qrPayload: "docn-ticket:DSB-2026-0042:admit-one",
} as const satisfies EventTicketData;
