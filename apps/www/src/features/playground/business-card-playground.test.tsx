import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  parsePdfRenderRequest,
  type PdfRenderRequest,
} from "@/workers/pdf/protocol";
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
    expect(parsePdfRenderRequest(requests[0])).toBeDefined();
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

  it("applies validated JSON and serializes template print and accent controls", async () => {
    const user = userEvent.setup();
    const requests: PdfRenderRequest[] = [];
    const session: BusinessCardRenderSession = {
      destroy: vi.fn(),
      enqueue(request) {
        requests.push(request);
      },
    };
    render(
      <BusinessCardPlayground
        templateId="business-card-studio"
        createRenderSession={() => session}
      />,
    );

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]?.request.templateId).toBe("business-card-studio");

    await user.click(screen.getByRole("button", { name: "Advanced JSON" }));
    const json = screen.getByRole("textbox", { name: "Document data JSON" });
    fireEvent.change(json, { target: { value: "{" } });
    await user.click(
      screen.getByRole("button", { name: "Apply validated JSON" }),
    );
    expect(screen.getByText("Enter valid JSON before applying.")).toBeVisible();

    fireEvent.change(json, {
      target: {
        value: JSON.stringify({
          name: "JSON Studio",
          email: "studio@example.com",
        }),
      },
    });
    await user.click(
      screen.getByRole("button", { name: "Apply validated JSON" }),
    );
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue(
      "JSON Studio",
    );

    await user.click(screen.getByLabelText("Accent"));
    await user.click(screen.getByRole("option", { name: "Teal" }));
    await user.click(screen.getByLabelText("Print profile"));
    await user.click(
      screen.getByRole("option", { name: "Print · bleed and crop marks" }),
    );
    await waitFor(() => expect(requests.length).toBeGreaterThanOrEqual(3));
    const latest = requests.at(-1)?.request;
    expect(latest?.overrides).toEqual({ accentColor: "#0f766e" });
    expect(latest?.printProfile).toEqual({
      kind: "print",
      bleedMm: 3,
      cropMarks: true,
    });
  });
});
