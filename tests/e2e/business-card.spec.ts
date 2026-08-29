import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

test("edits, inspects the back, and exports the latest business card", async ({
  page,
}) => {
  await page.goto("/templates/business-card-minimal/");
  const status = page.getByTestId("render-status");
  await expect(status).toContainText("Revision 1", { timeout: 15_000 });
  const initialFingerprint = await status.getAttribute("data-fingerprint");

  const name = page.getByRole("textbox", { name: "Name" });
  await name.fill("");
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(status).toContainText("Fix the highlighted fields");
  await expect(
    page.getByRole("button", { name: "Download PDF" }),
  ).toBeDisabled();

  await name.fill("Anaïs Mavoungou");
  await expect(status).toContainText("Revision 2", { timeout: 15_000 });
  await expect(status).toHaveAttribute("data-fingerprint", /.+/);

  await page.getByRole("button", { name: "Reset sample" }).click();
  await expect(status).toContainText("Revision 3", { timeout: 15_000 });
  await expect(name).toHaveValue("Élodie Mbemba");
  await name.fill("Anaïs Mavoungou");
  await expect(status).toContainText("Revision 4", { timeout: 15_000 });

  await page.getByLabel("Format").click();
  await page.getByRole("option", { name: "90 × 50 mm" }).click();
  await expect(status).toContainText("Revision 5", { timeout: 15_000 });
  const finalFingerprint = await status.getAttribute("data-fingerprint");
  expect(finalFingerprint).toBeTruthy();
  expect(finalFingerprint).not.toBe(initialFingerprint);

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
  expect(download.suggestedFilename()).toBe(
    "docn-ui-business-card-minimal.pdf",
  );
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
    expect(front.view[2]).toBeCloseTo(255.118_110_236_2, 1);
    expect(front.view[3]).toBeCloseTo(141.732_283_464_6, 1);
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
