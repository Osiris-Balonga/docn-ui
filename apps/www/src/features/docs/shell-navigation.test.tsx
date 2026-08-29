import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import { MobileDocsNavigation } from "./docs-navigation";
import { SiteHeader } from "./site-header";

const { routerPush } = vi.hoisted(() => ({ routerPush: vi.fn() }));

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
  delete (Element.prototype as Partial<Element>).scrollIntoView;
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/docs/",
  useRouter: () => ({ push: routerPush }),
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

test("documentation search isolates editor shortcuts, reports no matches, and opens a known page", async () => {
  const user = userEvent.setup();

  render(
    <>
      <label htmlFor="document-title">Document title</label>
      <input id="document-title" />
      <SiteHeader />
    </>,
  );

  const editorInput = screen.getByRole("textbox", { name: "Document title" });
  await user.click(editorInput);
  await user.keyboard("{Control>}k{/Control}");
  expect(
    screen.queryByRole("dialog", { name: "Search documentation" }),
  ).toBeNull();

  const trigger = screen.getByRole("button", { name: "Search documentation" });
  await user.click(trigger);
  const searchInput = await screen.findByPlaceholderText(
    "Search available pages...",
  );
  await user.type(searchInput, "missing-page");
  expect(screen.getByText("No documentation found.")).toBeVisible();

  await user.keyboard("{Escape}");
  expect(trigger).toHaveFocus();

  await user.keyboard("{Control>}k{/Control}");
  const reopenedInput = await screen.findByPlaceholderText(
    "Search available pages...",
  );
  await user.type(reopenedInput, "getting started");
  await user.click(screen.getByText("Getting started"));
  expect(routerPush).toHaveBeenCalledWith("/docs/getting-started/");
});
