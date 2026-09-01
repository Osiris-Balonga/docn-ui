import { expect, test } from "@playwright/test";

test("shows the new reference-led templates in their families", async ({
  page,
}) => {
  await page.goto("/templates/");

  await expect(
    page.getByRole("heading", { name: "PDF Templates" }),
  ).toBeVisible();
  const navigation = page.getByRole("navigation", {
    name: "Template families",
  });
  for (const family of [
    "Business Cards",
    "Receipts",
    "Invoices",
    "CVs",
    "Reports",
    "Badges",
  ]) {
    await expect(navigation.getByRole("tab", { name: family })).toBeVisible();
  }
  await expect(
    navigation.getByRole("tab", { name: "Event Tickets" }),
  ).toHaveCount(0);
  await expect(navigation.getByRole("tab", { name: "Labels" })).toHaveCount(0);
  await expect(page.locator("article")).toHaveCount(4);
  await expect(
    page.getByRole("heading", { name: "Spacious service invoice" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Vertical studio invoice" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Corporate table invoice" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Photo header invoice" }),
  ).toBeVisible();

  await navigation.getByRole("tab", { name: "Receipts" }).click();
  await expect(page).toHaveURL(/family=receipt/);
  await expect(
    page.getByRole("heading", { name: "Order confirmation" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    navigation.getByRole("tab", { name: "Receipts" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("heading", { name: "Order confirmation" }),
  ).toBeVisible();

  await navigation.getByRole("tab", { name: "CVs" }).click();
  await expect(page.locator("article")).toHaveCount(3);
  await expect(
    page.getByRole("heading", { name: "Classic two-column resume" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Structured accountant resume" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Green designer resume" }),
  ).toBeVisible();
  await navigation.getByRole("tab", { name: "Reports" }).click();
  await expect(page.locator("article")).toHaveCount(3);
  await expect(
    page.getByRole("heading", { name: "Product analytics report" }),
  ).toBeVisible();

  await navigation.getByRole("tab", { name: "Badges" }).click();
  await expect(page.locator("article")).toHaveCount(2);

  await navigation.getByRole("tab", { name: "Business Cards" }).click();
  await expect(page.locator("article")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Enlarge Coral QR business card preview" })
    .click();
  const cardPreview = page.getByRole("dialog", {
    name: "Coral QR business card preview",
  });
  await expect(
    cardPreview.getByRole("button", { name: "View page 2" }),
  ).toBeVisible();

  await page.goto("/templates/?family=ticket");
  await expect(page).toHaveURL(/family=invoice/);
  await expect(page.getByRole("tab", { name: "Invoices" })).toHaveAttribute(
    "aria-selected",
    "true",
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
  await expect(source).toContainText(
    "createBrowserAssetResolver(window.location.origin)",
  );
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
    page.getByRole("button", { name: "Search documentation" }),
  ).toBeVisible();
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
  await enlarge.hover();
  await expect(enlarge.getByText("Open preview")).toBeVisible();
  await enlarge.click();
  const overlay = page.getByRole("dialog", { name: "Barcode preview" });
  await expect(overlay).toBeVisible();
  await expect(
    overlay.getByRole("region", { name: "Detailed PDF preview" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      overlay.evaluate((element) =>
        Math.round(element.getBoundingClientRect().right - window.innerWidth),
      ),
    )
    .toBe(0);
  await expect
    .poll(() =>
      page
        .locator('[data-slot="dialog-overlay"]')
        .evaluate((element) =>
          Math.round(element.getBoundingClientRect().right - window.innerWidth),
        ),
    )
    .toBe(0);
  const zoomIn = overlay.getByRole("button", { name: "Zoom in" });
  for (let step = 0; step < 15; step += 1) await zoomIn.click();
  await expect(overlay.getByText("250%", { exact: true })).toBeVisible();
  await expect(zoomIn).toBeDisabled();
  await expect
    .poll(() =>
      overlay
        .getByRole("region", { name: "Detailed PDF preview" })
        .evaluate((element) => element.scrollWidth > element.clientWidth),
    )
    .toBe(true);
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

  await page.goto("/components/divider/");
  await expect(page.getByRole("heading", { name: "Examples" })).toBeVisible();
  await expect(page.getByText("Solid, dashed and dotted rules")).toBeVisible();
  await expect(
    page.getByLabel("divider-example-2.tsx code").filter({
      hasText: 'label="OR"',
    }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("table", { name: "Divider properties" }),
  ).toContainText("PDF-native border style.");

  await page.goto("/components/data-table/");
  await expect(page.getByText("Typed production rows")).toBeVisible();
  await expect(page.getByText("Empty dataset", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("table", { name: "DataTable properties" }),
  ).toContainText("Typed column definitions and cell mapping functions.");
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await expect(page.getByLabel("data-table-example.tsx code")).toContainText(
    'tone="accent"',
  );

  await page.goto("/components/image/");
  await expect(page.getByText("Square photograph")).toBeVisible();
  await expect(page.getByText("Covered photograph")).toBeVisible();
  await expect(page.getByText("Rounded photograph")).toBeVisible();

  await page.goto("/components/graph/");
  await expect(page.getByText("Cartesian charts")).toBeVisible();
  await expect(page.getByText("Circular charts")).toBeVisible();

  await page.goto("/components/watermark/");
  await expect(
    page.getByRole("heading", { name: "Full-page diagonal mark" }),
  ).toBeVisible();
  await expect(page.getByText("Full-page horizontal mark")).toBeVisible();
  await expect(page.getByText("Full-page vertical mark")).toBeVisible();

  await page.getByRole("button", { name: "Search documentation" }).click();
  await page.getByPlaceholder("Search available pages...").fill("PageBreak");
  await page.getByRole("option", { name: /PageBreak/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("PageBreak");
  await page.getByRole("button", { name: "Next page" }).click();
  await page.getByText("Text alternative", { exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Second page");
  await page.getByRole("button", { name: "Enlarge PageBreak preview" }).click();
  const pageOverlay = page.getByRole("dialog", { name: "PageBreak preview" });
  const scroll = pageOverlay.getByRole("region", {
    name: "Detailed PDF preview",
  });
  await expect(scroll).toHaveCSS("scrollbar-width", "none");
  const secondPage = pageOverlay.getByRole("button", { name: "View page 2" });
  await secondPage.click();
  await expect(secondPage).toHaveAttribute("aria-current", "page");
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
