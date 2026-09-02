import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { ProjectLink } from "./project-link";

test("the composed project action stays a keyboard-accessible link", async () => {
  const user = userEvent.setup();
  render(<ProjectLink />);

  const link = screen.getByRole("link", { name: "Follow the project" });
  expect(link).toHaveAttribute(
    "href",
    "https://github.com/Osiris-Balonga/docn-ui",
  );
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  await user.tab();
  expect(link).toHaveFocus();
  expect(
    await screen.findByText(
      "Source code and implementation progress on GitHub",
    ),
  ).toBeVisible();
});
