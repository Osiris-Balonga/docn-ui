import { expect, test } from "@playwright/test";

test("browses templates and opens their registry source", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4174",
  });
  await page.goto("/templates/");

  await expect(
    page.getByRole("heading", { name: "Beautiful PDF Templates" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Template families" }),
  ).toContainText("Business Cards");
  await expect(
    page.getByRole("heading", { name: "Minimal business card" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Editorial business card" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Studio business card" }),
  ).toBeVisible();
  await expect(page.getByText("Customize", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Download PDF", { exact: true })).toHaveCount(0);

  await page
    .getByRole("button", {
      name: "Copy Minimal business card install command",
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Copied Minimal business card install command",
    }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "View Minimal business card code" })
    .click();
  const sourceDialog = page.getByRole("dialog", {
    name: "Minimal business card code",
  });
  await expect(sourceDialog).toBeVisible();
  await expect(
    sourceDialog.getByRole("combobox", { name: "Source file" }),
  ).toHaveCount(0);
  await expect(
    sourceDialog.getByText("business-card-minimal", { exact: true }).first(),
  ).toBeVisible();
  await expect(sourceDialog.getByText("TS", { exact: true })).toBeVisible();
  await expect(
    sourceDialog.getByRole("button", { name: "Copy source" }),
  ).toBeVisible();
  await expect(sourceDialog.getByText(/registry items/)).toHaveCount(0);
  await expect(sourceDialog.getByText(/packages\/documents\/src/)).toHaveCount(
    0,
  );
  await expect(sourceDialog.locator("pre")).toHaveCSS(
    "scrollbar-width",
    "none",
  );
  await sourceDialog.getByRole("button", { name: "Close" }).click();
  await expect(sourceDialog).toBeHidden();

  await page.getByRole("tab", { name: "Event Tickets" }).click();
  await expect(
    page.getByRole("heading", { name: "Classic event ticket" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Conference event ticket" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Live event ticket" }),
  ).toBeVisible();
  await expect(
    page.getByAltText("Classic event ticket PDF preview"),
  ).toHaveJSProperty("complete", true);
  await page
    .getByRole("button", { name: "View Classic event ticket code" })
    .click();
  const ticketSourceDialog = page.getByRole("dialog", {
    name: "Classic event ticket code",
  });
  await expect(ticketSourceDialog).toBeVisible();
  await expect(
    ticketSourceDialog
      .getByText("event-ticket-classic", { exact: true })
      .first(),
  ).toBeVisible();
  await expect(
    ticketSourceDialog.getByRole("combobox", { name: "Source file" }),
  ).toHaveCount(0);
  await ticketSourceDialog.getByRole("button", { name: "Close" }).click();

  await page.getByRole("tab", { name: "Labels" }).click();
  for (const title of ["Product label", "Address label", "Inventory label"]) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByAltText(`${title} PDF preview`)).toHaveJSProperty(
      "complete",
      true,
    );
  }
  await page.getByRole("button", { name: "View Product label code" }).click();
  const labelSourceDialog = page.getByRole("dialog", {
    name: "Product label code",
  });
  await expect(labelSourceDialog).toBeVisible();
  await expect(
    labelSourceDialog.getByText("label-product", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    labelSourceDialog.getByRole("combobox", { name: "Source file" }),
  ).toHaveCount(0);
  await labelSourceDialog.getByRole("button", { name: "Close" }).click();
});

test("keeps direct template URLs in the gallery without a playground", async ({
  page,
}) => {
  await page.goto("/templates/business-card-studio/");

  await expect(
    page.getByRole("heading", { name: "Beautiful PDF Templates" }),
  ).toBeVisible();
  await expect(page.locator("article").first().getByRole("heading")).toHaveText(
    "Studio business card",
  );
  await expect(page.getByText("Customize", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Download PDF", { exact: true })).toHaveCount(0);

  await page.goto("/templates/event-ticket-live/");
  await expect(
    page.getByRole("tab", { name: "Event Tickets" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("article").first().getByRole("heading")).toHaveText(
    "Live event ticket",
  );

  await page.goto("/templates/label-inventory/");
  await expect(page.getByRole("tab", { name: "Labels" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator("article").first().getByRole("heading")).toHaveText(
    "Inventory label",
  );
});

test("keeps the Home focused and changes documentation navigation only when space requires it", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1015, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open site navigation" }),
  ).toHaveCount(0);
  await expect(page.getByText("The PDF foundation is qualified.")).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "View Minimal business card code" }),
  ).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toContainText(
    "Source-owned PDF components for React.",
  );

  await page.goto("/docs/");
  await expect(
    page.getByRole("navigation", { name: "Documentation" }),
  ).toBeVisible();

  await page
    .getByRole("region", { name: "Available guides" })
    .getByRole("link", { name: "Browser and Node", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Browser and Node", exact: true }),
  ).toBeVisible();
  const source = page.getByLabel("src/main.ts code", { exact: true });
  await expect(source).toHaveCSS("scrollbar-width", "none");
  await expect(source).toContainText('formatId: "card-85x55"');
  await expect(
    page.getByRole("button", { name: "Copy src/main.ts" }),
  ).toBeVisible();
  await source.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => source.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.locator("body").evaluate((element) => element.clientWidth),
  );

  await page.setViewportSize({ width: 700, height: 900 });
  await expect(
    page.getByRole("button", { name: "Open site navigation" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Open documentation menu" }),
  ).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await page.getByRole("button", { name: "Open site navigation" }).click();
  const menu = page.getByRole("dialog", { name: "Navigation" });
  await expect(
    menu.getByRole("navigation", { name: "Documentation" }),
  ).toBeVisible();
  await menu.getByRole("link", { name: "Local assets", exact: true }).click();
  await expect(menu).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Local assets", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toContainText("--target browser");

  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.locator("body").evaluate((element) => element.clientWidth),
  );
  await expect(
    page.getByRole("button", { name: "Open site navigation" }),
  ).toHaveCount(1);
  await page.screenshot({
    path: testInfo.outputPath("documentation-mobile.png"),
  });
});

test("browses component examples source formats and themes", async ({
  page,
}, testInfo) => {
  await page.goto("/components/");

  await expect(
    page.getByRole("heading", { name: "Components", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "New Components" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "All Components" }),
  ).toBeVisible();
  await expect(page.getByText("Layout primitives")).toHaveCount(0);
  await expect(page.getByText("Browse templates")).toHaveCount(0);
  const inventory = page.getByRole("region", { name: "All Components" });
  await expect(inventory.getByRole("link")).toHaveCount(28);
  await inventory.getByRole("link", { name: "Barcode", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Barcode");
  const specimen = page.getByRole("img", {
    name: "Barcode PDF example, page 1",
    exact: true,
  });
  await expect
    .poll(() =>
      specimen.evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const enlarge = page.getByRole("button", { name: "Enlarge Barcode preview" });
  await enlarge.click();
  const overlay = page.getByRole("dialog", { name: "Barcode preview" });
  await expect(overlay).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(enlarge).toBeFocused();
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  const usage = page.getByLabel("barcode-example.tsx code", { exact: true });
  await expect(usage).toHaveCSS("scrollbar-width", "none");
  await expect(usage).toContainText('format="ean13"');
  await usage.focus();
  await expect(usage).toBeFocused();
  await page.getByRole("button", { name: "View source", exact: true }).click();
  const source = page.getByRole("dialog", { name: "Barcode source" });
  await expect(source).toContainText("BarcodeProps");
  await expect(source.getByRole("combobox")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(
    page.getByLabel("Install component code", { exact: true }),
  ).toContainText("http://127.0.0.1:4174/r/dev/docn-barcode.json");
  const install = page.getByLabel("Install component code", { exact: true });
  await install.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => install.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await expect(
    page.getByRole("table", { name: "Barcode properties" }),
  ).toContainText("barHeight");
  await page.screenshot({ path: testInfo.outputPath("component-desktop.png") });

  await page.getByRole("button", { name: "Search documentation" }).click();
  await page.getByPlaceholder("Search available pages...").fill("PageBreak");
  await page.getByRole("option", { name: /PageBreak/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("PageBreak");
  await page.getByRole("button", { name: "Next page" }).click();
  await page.getByText("Text alternative", { exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Second page");
  await page.getByRole("button", { name: "Enlarge PageBreak preview" }).click();
  const pageOverlay = page.getByRole("dialog", { name: "PageBreak preview" });
  const scroll = pageOverlay.getByRole("region", { name: "Enlarged PDF page" });
  await expect(scroll).toHaveCSS("scrollbar-width", "none");
  await scroll.focus();
  await page.keyboard.press("ArrowDown");
  await expect
    .poll(() => scroll.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("page-enlarged.png") });
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 900, height: 700 });
  await expect(
    page.getByRole("navigation", { name: "Documentation", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "On this page" }),
  ).toBeHidden();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Open site navigation" }),
  ).toHaveCount(1);
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.locator("body").evaluate((element) => element.clientWidth),
  );
  await page.getByRole("button", { name: "Open site navigation" }).click();
  const menu = page.getByRole("dialog", { name: "Navigation", exact: true });
  await menu.getByRole("link", { name: "Formats", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Formats");
  await expect(
    page.getByRole("region", { name: "a4", exact: true }),
  ).toContainText("210 × 297 mm");
  await page.getByRole("button", { name: "Open site navigation" }).click();
  await menu.getByRole("link", { name: "Themes", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Themes");
  await expect(
    page.getByRole("button", { name: /^Enlarge .* theme preview$/ }),
  ).toHaveCount(3);
  await page.screenshot({ path: testInfo.outputPath("themes-mobile.png") });
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    await page.locator("body").evaluate((element) => element.clientWidth),
  );
  await page.getByRole("button", { name: "Open site navigation" }).click();
  await menu.getByRole("link", { name: "Watermark", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Watermark");
  await page.screenshot({ path: testInfo.outputPath("component-mobile.png") });
});
