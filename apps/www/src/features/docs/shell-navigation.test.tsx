import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
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
    </>,
  );

  await user.tab();
  expect(screen.getByRole("link", { name: "Skip to content" })).toHaveFocus();
  expect(
    screen.getByRole("navigation", { name: "Primary" }),
  ).toBeInTheDocument();
  const primaryNavigation = screen.getByRole("navigation", {
    name: "Primary",
  });
  expect(
    within(primaryNavigation).getByRole("link", { name: "Home" }),
  ).toBeInTheDocument();
  expect(
    within(primaryNavigation).getByRole("link", { name: "Docs" }),
  ).toHaveAttribute("aria-current", "page");
  expect(
    within(primaryNavigation).getByRole("link", { name: "Components" }),
  ).toBeInTheDocument();
  expect(
    within(primaryNavigation).getByRole("link", { name: "Templates" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Open docn-ui on GitHub" }),
  ).toHaveAttribute("href", "https://github.com/Osiris-Balonga/docn-ui");
  expect(
    screen.getByRole("button", { name: "Toggle theme" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("docn-ui")).toBeNull();

  await user.click(
    screen.getByRole("button", { name: "Open site navigation" }),
  );
  const siteDialog = await screen.findByRole("dialog", { name: "Navigation" });
  expect(
    within(siteDialog).getByRole("navigation", { name: "Primary mobile" }),
  ).toBeInTheDocument();
  expect(
    within(siteDialog).getByRole("navigation", { name: "Documentation" }),
  ).toBeInTheDocument();
  expect(
    within(siteDialog)
      .getAllByRole("link", { name: "Overview" })
      .find((link) => link.getAttribute("aria-current") === "page"),
  ).toBeDefined();
  expect(
    screen.queryByRole("button", { name: "Open documentation menu" }),
  ).toBeNull();
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
  await user.type(reopenedInput, "browser and node");
  await user.click(screen.getByText("Browser and Node"));
  expect(routerPush).toHaveBeenCalledWith("/docs/browser-and-node/");
});

test("the homepage search trigger remains identifiable over the video", () => {
  render(<SiteHeader overMedia />);

  expect(
    screen.getByRole("button", { name: "Search documentation" }),
  ).toHaveClass("border-white/25", "bg-black/20", "shadow-sm");
});
