import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { PersistentDocsSidebar } from "./persistent-docs-sidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/components/link/" }));

afterEach(() => {
  window.sessionStorage.clear();
});

test("restores the documentation navigation scroll position after navigation", () => {
  const first = render(<PersistentDocsSidebar />);
  const sidebar = screen.getByTestId("documentation-sidebar");
  sidebar.scrollTop = 428;
  fireEvent.scroll(sidebar);
  first.unmount();

  render(<PersistentDocsSidebar />);
  expect(screen.getByTestId("documentation-sidebar").scrollTop).toBe(428);
});
