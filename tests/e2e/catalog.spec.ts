import { expect, test } from "@playwright/test";

test("filters the catalog and restores it after visiting a template", async ({
  page,
}) => {
  await page.goto("/templates/");
  await expect(page.getByText("3 templates", { exact: true })).toBeVisible();

  const search = page.getByRole("textbox", { name: "Search templates" });
  await search.fill("studio");
  await expect(page).toHaveURL(/q=studio/);
  await expect(page.getByText("1 template", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Studio business card" }),
  ).toBeVisible();

  await search.fill("does not exist");
  await expect(
    page.getByRole("heading", { name: "No templates found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(page).toHaveURL(/\/templates\/$/);

  await page.getByLabel("Format").click();
  await page.getByRole("option", { name: "US · 88.9 × 50.8 mm" }).click();
  await expect(page).toHaveURL(/format=card-us/);
  await page.getByRole("link", { name: /Minimal business card/ }).click();
  await expect(page).toHaveURL(/\/templates\/business-card-minimal\/$/);
  await expect(
    page.getByRole("heading", { name: "Minimal business card" }),
  ).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/format=card-us/);
  await expect(page.getByText("3 templates", { exact: true })).toBeVisible();
});
