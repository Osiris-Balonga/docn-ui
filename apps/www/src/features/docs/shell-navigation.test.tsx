import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { MobileDocsNavigation } from "./docs-navigation";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/docs/",
}));

test("the shell exposes a focused skip link and an operable mobile documentation menu", async () => {
  const user = userEvent.setup();

  render(
    <>
      <SiteHeader />
      <main id="main-content">Content</main>
      <MobileDocsNavigation />
    </>,
  );

  await user.tab();
  expect(screen.getByRole("link", { name: "Skip to content" })).toHaveFocus();
  expect(
    screen.getByRole("navigation", { name: "Primary" }),
  ).toBeInTheDocument();

  await user.click(
    screen.getByRole("button", { name: "Open documentation menu" }),
  );
  const dialog = await screen.findByRole("dialog", { name: "Documentation" });
  expect(
    within(dialog).getByRole("navigation", { name: "Documentation" }),
  ).toBeInTheDocument();
  expect(
    within(dialog).getByRole("link", { name: "Overview" }),
  ).toHaveAttribute("aria-current", "page");
});
