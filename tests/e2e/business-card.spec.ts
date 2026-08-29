import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

test("edits, inspects the back, and exports the latest business card", async ({
  page,
}) => {
  await page.goto("/templates/business-card-minimal/");
  const status = page.getByTestId("render-status");
  await expect(status).toContainText("Revision 1", { timeout: 15_000 });

  await page.getByRole("textbox", { name: "Name" }).fill("Anaïs Mavoungou");
  await expect(status).toContainText("Revision 2", { timeout: 15_000 });
  await expect(status).toHaveAttribute("data-fingerprint", /.+/);

  await page.getByRole("button", { name: "Back" }).click();
  await expect(
    page.getByLabel("PDF preview, page 2", { exact: true }),
  ).toBeVisible();

  const expectedByteLength = Number(
    (await status.getAttribute("data-byte-length")) ?? 0,
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download PDF" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("docn-ui-business-card.pdf");
  const downloadPath = await download.path();
  if (!downloadPath) throw new Error("Playwright did not retain the download.");
  const bytes = await readFile(downloadPath);
  expect(bytes.byteLength).toBe(expectedByteLength);

  const loadingTask = getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: false,
  });
  try {
    const document = await loadingTask.promise;
    expect(document.numPages).toBe(2);
    const front = await document.getPage(1);
    expect(front.view[2]).toBeCloseTo(240.944_881_889_8, 1);
    expect(front.view[3]).toBeCloseTo(155.905_511_811, 1);
    const content = await front.getTextContent();
    const text = content.items
      .filter((item): item is typeof item & { str: string } => "str" in item)
      .map((item) => item.str)
      .join(" ");
    expect(text).toContain("Anaïs Mavoungou");
  } finally {
    await loadingTask.destroy();
  }
});
