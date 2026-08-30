import { createCanvas } from "@napi-rs/canvas";
import { Document, View } from "@react-pdf/renderer";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import jsQR from "jsqr";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { describe, expect, it } from "vitest";
import { resolveFormat } from "../../core/formats";
import { Heading, PageFrame, QRCode, Text } from "../../primitives";
import { renderDocumentInNode } from "../../render/node";
import { getPdfTheme } from "../../themes/themes";
import { formatEventStart, parseEventTicketData } from "./schema";

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

async function retainQualificationPdf(pdfBytes: Uint8Array) {
  if (process.env.DOCN_WRITE_PDF_ARTIFACTS !== "1") return;
  const directory = fileURLToPath(
    new URL("../../../../../.artifacts/l08/pdf/", import.meta.url),
  );
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}event-ticket-qr-qualification.pdf`, pdfBytes);
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
    await retainQualificationPdf(pdfBytes);
  });
});
