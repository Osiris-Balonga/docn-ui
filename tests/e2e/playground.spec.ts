import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

test("edits, inspects the back, and exports the latest business card", async ({
  page,
}) => {
  const requests: Array<{
    method: string;
    postData: string | null;
    url: string;
  }> = [];
  page.on("request", (request) => {
    requests.push({
      method: request.method(),
      postData: request.postData(),
      url: request.url(),
    });
  });
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
  const formatFingerprint = await status.getAttribute("data-fingerprint");
  expect(formatFingerprint).toBeTruthy();
  expect(formatFingerprint).not.toBe(initialFingerprint);

  const logoInput = page.getByLabel("Local logo");
  await logoInput.setInputFiles({
    name: "not-an-image.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.7"),
  });
  await expect(
    page.getByText("Choose a valid PNG or JPEG image."),
  ).toBeVisible();
  await expect(status).toContainText("Revision 5");

  await logoInput.setInputFiles({
    name: "logo.png",
    mimeType: "image/png",
    buffer: await readFile(
      "apps/www/public/generated/catalog/business-card-studio.png",
    ),
  });
  await expect(page.getByText(/\d+ × \d+ px · metadata removed/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove logo" })).toBeVisible();
  await expect(status).toContainText("Revision 6", { timeout: 15_000 });

  await name.fill("Discarded local edit");
  await expect(status).toContainText("Rendering revision 7", {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("button", { name: "Download PDF" }),
  ).toBeDisabled();
  await name.fill("Latest Local Name");
  await expect(status).toContainText("preview is outdated");
  await expect(status).toContainText("Revision 8", { timeout: 15_000 });
  const finalFingerprint = await status.getAttribute("data-fingerprint");
  expect(finalFingerprint).toBeTruthy();
  expect(finalFingerprint).not.toBe(formatFingerprint);

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
    expect(text).toContain("Latest Local Name");
  } finally {
    await loadingTask.destroy();
  }

  const remoteRequests = requests.filter((request) =>
    /^https?:/.test(request.url),
  );
  expect(remoteRequests.length).toBeGreaterThan(0);
  for (const request of remoteRequests) {
    expect(new URL(request.url).origin).toBe("http://127.0.0.1:4174");
    expect(["GET", "HEAD"]).toContain(request.method);
    expect(request.postData).toBeNull();
  }
  const requestText = requests
    .map((request) => `${request.url}\n${request.postData ?? ""}`)
    .join("\n");
  for (const privateValue of [
    "Anaïs Mavoungou",
    "Discarded local edit",
    "Latest Local Name",
    encodeURIComponent("Anaïs Mavoungou"),
    encodeURIComponent("Discarded local edit"),
    encodeURIComponent("Latest Local Name"),
  ]) {
    expect(requestText).not.toContain(privateValue);
  }
  expect(requests.some((request) => request.url.startsWith("data:"))).toBe(
    false,
  );
});
