import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegistrySourcePanel } from "./registry-source-panel";

const rootItem = {
  name: "docn-business-card-minimal",
  registryDependencies: ["http://127.0.0.1:4173/r/dev/docn-core.json"],
  files: [
    {
      path: "packages/documents/src/templates/card.tsx",
      target: "~/docn/templates/card.tsx",
      type: "registry:component",
      content: 'export const Card = "complete source";\n',
    },
  ],
};

const dependencyItem = {
  name: "docn-core",
  registryDependencies: [],
  files: [
    {
      path: "packages/documents/src/core/contracts.ts",
      target: "~/docn/core/contracts.ts",
      type: "registry:lib",
      content: "export interface Contract { value: string }\n",
    },
  ],
};

function registryFetch(input: string | URL | Request) {
  const url = String(input);
  const value = url.endsWith("docn-business-card-minimal.json")
    ? rootItem
    : url.endsWith("docn-core.json")
      ? dependencyItem
      : undefined;
  return Promise.resolve(
    value
      ? new Response(JSON.stringify(value), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      : new Response(null, { status: 404 }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("registry source panel", () => {
  it("loads the complete source closure and copies the selected source", async () => {
    vi.stubGlobal("fetch", vi.fn(registryFetch));
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<RegistrySourcePanel itemName="docn-business-card-minimal" />);

    expect(
      await screen.findByText("2 files · 2 registry items"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/node docn\/assets\/install\.mjs/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("~/docn/templates/card.tsx source"),
    ).toHaveTextContent('export const Card = "complete source";');
    await user.click(screen.getByRole("button", { name: "Copy source" }));
    expect(writeText).toHaveBeenCalledWith(rootItem.files[0]!.content);
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("keeps the source selectable when the clipboard API is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(registryFetch));
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => false),
    });
    render(<RegistrySourcePanel itemName="docn-business-card-minimal" />);

    await screen.findByText("2 files · 2 registry items");
    await user.click(screen.getByRole("button", { name: "Copy source" }));
    expect(
      screen.getByText("Clipboard unavailable — select and copy manually."),
    ).toBeInTheDocument();
  });
});
