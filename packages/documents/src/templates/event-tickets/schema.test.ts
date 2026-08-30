import { describe, expect, it } from "vitest";
import { DocumentValidationError } from "../../core/errors";
import {
  formatEventStart,
  parseEventTicketData,
  type EventTicketData,
} from "./schema";

const fixedTicket = {
  eventName: "Design Systems Brazzaville",
  startsAt: "2026-09-12T18:30:00.000Z",
  timeZone: "Africa/Brazzaville",
  venue: "M'Pila Conference Centre",
  attendeeName: "Arielle Mavoungou",
  ticketId: "DSB-2026-0042",
  category: "Conference pass",
  seat: "B-12",
  qrPayload: "docn-ticket:DSB-2026-0042",
} as const satisfies EventTicketData;

describe("event-ticket data contract", () => {
  it("keeps the instant separate and formats it in the selected IANA time zone", () => {
    const parsed = parseEventTicketData(fixedTicket);
    expect(parsed.startsAt).toBe("2026-09-12T18:30:00.000Z");
    expect(formatEventStart(parsed.startsAt, parsed.timeZone, "en")).toEqual({
      date: "12 Sept 2026",
      time: "19:30",
      timeZone: "Africa/Brazzaville",
    });
    expect(
      formatEventStart(parsed.startsAt, "America/New_York", "en").time,
    ).toBe("14:30");
  });

  it("rejects an invalid zone and QR payloads beyond the UTF-8 budget", () => {
    const cases = [
      {
        data: { ...fixedTicket, timeZone: "Brazzaville" },
        code: "INVALID_DATA",
        path: ["data", "timeZone"],
      },
      {
        data: { ...fixedTicket, qrPayload: "é".repeat(257) },
        code: "LIMIT_EXCEEDED",
        path: ["data", "qrPayload"],
      },
    ];

    for (const fixture of cases) {
      try {
        parseEventTicketData(fixture.data);
        throw new Error("Expected event-ticket validation to fail.");
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentValidationError);
        expect(error).toMatchObject({ code: fixture.code });
        expect((error as DocumentValidationError).issues[0]?.path).toEqual(
          fixture.path,
        );
      }
    }
  });
});
