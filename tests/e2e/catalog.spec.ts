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
  ).toBeVisible();
  await expect(
    sourceDialog.getByRole("button", { name: "Copy source" }),
  ).toBeVisible();
  await sourceDialog.getByRole("button", { name: "Close" }).click();
  await expect(sourceDialog).toBeHidden();
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
});

test("shares the template gallery, footer, and responsive documentation menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/");

  await expect(
    page.getByRole("button", { name: "View Minimal business card code" }),
  ).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText(
    "Source-owned PDF components for React.",
  );

  await page.goto("/docs/");
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
});
