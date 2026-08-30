import { expect, test } from "@playwright/test";

test("discovers the complete invoice family and its installable source", async ({
  page,
}) => {
  await page.goto("/templates/invoice-business/");

  await expect(page.getByRole("tab", { name: "Invoices" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const articles = page.locator("article");
  await expect(articles).toHaveCount(3);
  await expect(articles.first().getByRole("heading")).toHaveText(
    "Business invoice",
  );
  for (const title of [
    "Business invoice",
    "Minimal invoice",
    "Subscription invoice",
  ]) {
    await expect(page.getByAltText(`${title} PDF preview`)).toHaveJSProperty(
      "complete",
      true,
    );
  }

  await page
    .getByRole("button", { name: "Enlarge Subscription invoice preview" })
    .click();
  const previewDialog = page.getByRole("dialog", {
    name: "Subscription invoice",
  });
  await expect(
    previewDialog.getByAltText("Enlarged Subscription invoice PDF preview"),
  ).toBeVisible();
  await previewDialog.getByRole("button", { name: "Close" }).click();

  await page
    .getByRole("button", { name: "View Business invoice code" })
    .click();
  const sourceDialog = page.getByRole("dialog", {
    name: "Business invoice code",
  });
  await expect(sourceDialog).toBeVisible();
  await expect(
    sourceDialog.getByText("invoice-business", { exact: true }).first(),
  ).toBeVisible();
  for (const file of ["examples.ts", "layout.tsx", "schema.ts", "plan.ts"]) {
    await expect(
      sourceDialog.getByRole("button", { name: file }),
    ).toBeVisible();
  }
  await sourceDialog.getByRole("button", { name: "layout.tsx" }).click();
  await expect(sourceDialog.getByLabel(/\/layout\.tsx source$/)).toContainText(
    "function InvoiceDocument",
  );
  await expect(
    sourceDialog.getByText("primitives", { exact: true }),
  ).toHaveCount(0);
  await expect(
    sourceDialog.getByRole("combobox", { name: "Source file" }),
  ).toHaveCount(0);
  await expect(sourceDialog.locator("pre")).toHaveCSS(
    "scrollbar-width",
    "none",
  );
});
