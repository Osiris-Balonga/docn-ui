import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PdfRenderRequest } from "@/workers/pdf/protocol";
import {
  BusinessCardPlayground,
  type BusinessCardRenderSession,
} from "./business-card-playground";

describe("BusinessCardPlayground", () => {
  it("validates fields and sends only the latest valid draft to the renderer", async () => {
    const user = userEvent.setup();
    const requests: PdfRenderRequest[] = [];
    const session: BusinessCardRenderSession = {
      destroy: vi.fn(),
      enqueue(request) {
        requests.push(request);
      },
    };
    const createRenderSession = vi.fn(() => session);
    render(
      <BusinessCardPlayground createRenderSession={createRenderSession} />,
    );

    await waitFor(() => expect(requests).toHaveLength(1));
    const name = screen.getByRole("textbox", { name: "Name" });
    await user.clear(name);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("String must contain at least 1 character(s)"),
    ).toBeVisible();

    await user.type(name, "Anaïs Mavoungou");
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[1]?.request.data.name).toBe("Anaïs Mavoungou");

    await user.click(screen.getByRole("button", { name: "Reset sample" }));
    await waitFor(() => expect(requests).toHaveLength(3));
    expect(requests[2]?.request.data.name).toBe("Élodie Mbemba");
  });
});
