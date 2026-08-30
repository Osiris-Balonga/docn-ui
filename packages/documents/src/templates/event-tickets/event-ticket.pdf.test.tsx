import { createCanvas } from "@napi-rs/canvas";
import { Document, View } from "@react-pdf/renderer";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import jsQR from "jsqr";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import {
  PDF_RENDER_PROTOCOL_VERSION,
  type RenderRequest,
} from "../../core/contracts";
import { resolveFormat } from "../../core/formats";
import {
  assertWithinSafeFrame,
  createSafeFrame,
} from "../../primitives/measurement";
import { Heading, PageFrame, QRCode, Text } from "../../primitives";
import { renderDocumentInNode } from "../../render/node";
import { getPdfTheme } from "../../themes/themes";
import {
  classicEventTicketExample,
  createEventTicketClassicPlan,
} from "./event-ticket-classic";
import {
  conferenceEventTicketExample,
  createEventTicketConferencePlan,
} from "./event-ticket-conference";
import {
  createEventTicketLivePlan,
  liveEventTicketExample,
} from "./event-ticket-live";
import { formatEventStart, parseEventTicketData } from "./schema";
import type { EventTicketData } from "./schema";

const payload = "docn-ticket:DSB-2026-0042:admit-one";
const ticket = parseEventTicketData({
  eventName: "Design Systems Brazzaville",
  startsAt: "2026-09-12T18:30:00.000Z",
  timeZone: "Africa/Brazzaville",
  venue: "M'Pila Conference Centre",
  attendeeName: "Arielle Mavoungou",
  ticketId: "DSB-2026-0042",
  category: "Conference pass",
  seat: "B-12",
  qrPayload: payload,
});

async function decodeFirstPageQr(pdfBytes: Uint8Array): Promise<string | null> {
  const loadingTask = getDocument({
    data: pdfBytes.slice(),
    useSystemFonts: false,
  });
  try {
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 4 });
    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height),
    );
    const context = canvas.getContext("2d");
    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    return (
      jsQR(image.data, image.width, image.height, {
        inversionAttempts: "dontInvert",
      })?.data ?? null
    );
  } finally {
    await loadingTask.destroy();
  }
}

function createRequest(
  data: EventTicketData,
  templateId: string,
  formatId: RenderRequest["formatId"],
  themeId: RenderRequest["themeId"],
): RenderRequest<EventTicketData> {
  return {
    assetIds: [],
    data,
    formatId,
    locale: "en",
    printProfile: { kind: "screen" },
    protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
    revision: 1,
    templateId,
    templateVersion: "1.0.0",
    themeId,
  };
}

async function inspectTicketPdf(pdfBytes: Uint8Array) {
  const loadingTask = getDocument({
    data: pdfBytes.slice(),
    useSystemFonts: false,
  });
  try {
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const content = await page.getTextContent();
    const height = (page.view[3] ?? 0) - (page.view[1] ?? 0);
    const items = content.items.filter(
      (
        item,
      ): item is typeof item & {
        height: number;
        str: string;
        transform: number[];
        width: number;
      } =>
        "str" in item &&
        "height" in item &&
        "transform" in item &&
        "width" in item,
    );
    return {
      bounds: items.map((item) => ({
        height: item.height,
        text: item.str,
        width: item.width,
        x: item.transform[4] ?? 0,
        y: height - (item.transform[5] ?? 0) - item.height,
      })),
      pageCount: pdf.numPages,
      text: items.map((item) => item.str).join(" "),
      view: page.view,
    };
  } finally {
    await loadingTask.destroy();
  }
}

async function retainPdf(name: string, pdfBytes: Uint8Array) {
  if (process.env.DOCN_WRITE_PDF_ARTIFACTS !== "1") return;
  const directory = fileURLToPath(
    new URL("../../../../../.artifacts/l08/pdf/", import.meta.url),
  );
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}${name}.pdf`, pdfBytes);
}

describe("event-ticket printable QR", () => {
  it("decodes the validated payload from a rasterization of the final PDF", async () => {
    const format = resolveFormat("ticket-150x70");
    if (format.kind !== "fixed")
      throw new Error("Expected a fixed ticket format.");
    const theme = getPdfTheme("neutral");
    const start = formatEventStart(ticket.startsAt, ticket.timeZone, "en");
    const printProfile = { kind: "screen" } as const;
    const pdfBytes = await renderDocumentInNode({
      document: (
        <Document
          title="Event ticket QR qualification"
          creator="docn-ui"
          creationDate={new Date("2026-01-15T12:00:00.000Z")}
          modificationDate={new Date("2026-01-15T12:00:00.000Z")}
          language="en-GB"
        >
          <PageFrame format={format} printProfile={printProfile} theme={theme}>
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                height: "100%",
                justifyContent: "space-between",
              }}
            >
              <View style={{ gap: 8, width: "58%" }}>
                <Heading>{ticket.eventName}</Heading>
                <Text>{`${start.date} · ${start.time} · ${start.timeZone}`}</Text>
                <Text tone="muted">{ticket.venue}</Text>
              </View>
              <QRCode
                minimumModuleSize={1.25}
                payload={ticket.qrPayload}
                size={112}
              />
            </View>
          </PageFrame>
        </Document>
      ),
      format,
      printProfile,
    });

    expect(await decodeFirstPageQr(pdfBytes)).toBe(payload);
    await retainPdf("event-ticket-qr-qualification", pdfBytes);
  });

  it("renders three distinct nominal compositions and one long event title", async () => {
    const longClassicExample = {
      ...classicEventTicketExample,
      eventName:
        "International Forum for Public Interest Design and Open Documentation",
      ticketId: "IFPID-2026-0042",
      qrPayload: "docn-ticket:IFPID-2026-0042:admit-one",
    } satisfies EventTicketData;
    const fixtures = [
      {
        artifact: "event-ticket-classic",
        data: classicEventTicketExample,
        formatId: "ticket-210x74" as const,
        plan: createEventTicketClassicPlan(
          createRequest(
            classicEventTicketExample,
            "event-ticket-classic",
            "ticket-210x74",
            "neutral",
          ),
        ).plan,
        text: ["Design Systems Brazzaville", "DSB-2026-0042"],
      },
      {
        artifact: "event-ticket-conference",
        data: conferenceEventTicketExample,
        formatId: "ticket-a6" as const,
        plan: createEventTicketConferencePlan(
          createRequest(
            conferenceEventTicketExample,
            "event-ticket-conference",
            "ticket-a6",
            "editorial",
          ),
        ).plan,
        text: ["Open Source Documentation Summit", "Sofia Almeida"],
      },
      {
        artifact: "event-ticket-live",
        data: liveEventTicketExample,
        formatId: "ticket-150x70" as const,
        plan: createEventTicketLivePlan(
          createRequest(
            liveEventTicketExample,
            "event-ticket-live",
            "ticket-150x70",
            "bold",
          ),
        ).plan,
        text: ["Night Signals Live", "NSL-26-7751"],
      },
      {
        artifact: "event-ticket-classic-long",
        data: longClassicExample,
        formatId: "ticket-150x70" as const,
        plan: createEventTicketClassicPlan({
          ...createRequest(
            longClassicExample,
            "event-ticket-classic",
            "ticket-150x70",
            "neutral",
          ),
          locale: "fr",
        }).plan,
        text: [longClassicExample.eventName, "IFPID-2026-0042", "ACCÈS"],
      },
    ];

    for (const fixture of fixtures) {
      const pdfBytes = await renderDocumentInNode(fixture.plan);
      const inspection = await inspectTicketPdf(pdfBytes);
      const format = resolveFormat(fixture.formatId);
      if (format.kind !== "fixed")
        throw new Error("Expected a fixed ticket format.");
      const frame = createSafeFrame(format);
      expect(inspection.pageCount).toBe(1);
      expect(inspection.view[2]).toBeCloseTo(format.trim.widthPt, 1);
      expect(inspection.view[3]).toBeCloseTo(format.trim.heightPt, 1);
      for (const expectedText of fixture.text)
        expect(inspection.text).toContain(expectedText);
      for (const bounds of inspection.bounds)
        assertWithinSafeFrame(bounds, frame, [fixture.data.ticketId, "text"]);
      if (fixture.artifact === "event-ticket-classic-long") {
        const venueLabel = inspection.bounds.find(
          (item) => item.text === "LIEU",
        );
        const venue = inspection.bounds.find(
          (item) => item.text === fixture.data.venue,
        );
        const seatLabel = inspection.bounds.find(
          (item) => item.text === "PLACE",
        );
        if (!venueLabel || !venue || !seatLabel)
          throw new Error("Expected the compact ticket logistics fields.");
        expect(venueLabel.y + venueLabel.height).toBeLessThanOrEqual(venue.y);
        expect(venue.y + venue.height).toBeLessThanOrEqual(seatLabel.y);
      }
      await retainPdf(fixture.artifact, pdfBytes);
    }
  });
});
