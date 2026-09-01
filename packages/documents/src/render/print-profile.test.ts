import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { DOCUMENT_LIMITS } from "../core/contracts";
import { getPageGeometry } from "../core/page-geometry";
import { applyPrintBoxes } from "./print-profile";

describe("final PDF boundaries", () => {
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
