import { PDFDocument, PDFName } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { DOCUMENT_LIMITS } from "../core/contracts";
import { getPageGeometry } from "../core/page-geometry";
import { applyPrintBoxes } from "./print-profile";

describe("final PDF boundaries", () => {
  it("rejects a serialized PDF beyond 20 MiB without truncating it", async () => {
    const document = await PDFDocument.create();
    const page = document.addPage([200, 200]);
    const content = new Uint8Array(DOCUMENT_LIMITS.finalPdfBytes).fill(32);
    page.node.set(
      PDFName.of("Contents"),
      document.context.register(document.context.stream(content)),
    );
    const bytes = await document.save({ useObjectStreams: false });

    await expect(
      applyPrintBoxes(bytes, getPageGeometry(200, 200, { kind: "screen" })),
    ).rejects.toMatchObject({
      code: "LIMIT_EXCEEDED",
      issues: [expect.objectContaining({ path: ["document", "bytes"] })],
    });
    expect(bytes.byteLength).toBeGreaterThan(DOCUMENT_LIMITS.finalPdfBytes);
  });

  it("rejects output beyond the public page limit before rewriting it", async () => {
    const document = await PDFDocument.create();
    for (let page = 0; page <= DOCUMENT_LIMITS.pages; page += 1)
      document.addPage([200, 200]);

    await expect(
      applyPrintBoxes(
        await document.save(),
        getPageGeometry(200, 200, { kind: "screen" }),
      ),
    ).rejects.toMatchObject({
      code: "LIMIT_EXCEEDED",
      issues: [expect.objectContaining({ path: ["document", "pages"] })],
    });
  });
});
