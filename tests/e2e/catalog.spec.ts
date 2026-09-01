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

test("presents the component index with the shadcn documentation hierarchy", async ({
  page,
}) => {
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
});
