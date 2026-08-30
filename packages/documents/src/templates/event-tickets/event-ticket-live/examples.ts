import type { EventTicketData } from "../schema";

export const liveEventTicketExample = {
  eventName: "Night Signals Live",
  startsAt: "2026-11-21T20:00:00.000Z",
  timeZone: "Africa/Lagos",
  venue: "The Civic Centre, Lagos",
  attendeeName: "Kemi Adeyemi",
  ticketId: "NSL-26-7751",
  category: "Floor",
  qrPayload: "docn-ticket:NSL-26-7751:floor",
} as const satisfies EventTicketData;
