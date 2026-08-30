import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegistrySourcePanel } from "./registry-source-panel";

const rootItem = {
  name: "docn-business-card-minimal",
  registryDependencies: [
    "http://127.0.0.1:4173/r/dev/docn-business-card-foundation.json",
    "http://127.0.0.1:4173/r/dev/docn-primitives.json",
  ],
  files: [
    {
      path: "packages/documents/src/templates/card.tsx",
      target: "~/docn/templates/card.tsx",
      type: "registry:component",
      content: 'export const Card = "complete source";\n',
    },
    {
      path: "packages/documents/src/templates/examples.ts",
      target: "~/docn/templates/examples.ts",
      type: "registry:component",
      content: 'export const example = { name: "Avery" };\n',
    },
    {
      path: "packages/documents/src/templates/index.ts",
      target: "~/docn/templates/index.ts",
      type: "registry:component",
      content: 'export * from "./card";\n',
    },
  ],
};

const dependencyItem = {
  name: "docn-business-card-foundation",
  registryDependencies: [],
  files: [
    {
      path: "packages/documents/src/templates/layout.tsx",
      target: "~/docn/templates/layout.tsx",
      type: "registry:lib",
      content: "export function CardLayout() { return null; }\n",
    },
    {
      path: "packages/documents/src/templates/schema.ts",
      target: "~/docn/templates/schema.ts",
      type: "registry:lib",
      content: "export interface CardData { name: string }\n",
    },
    {
      path: "packages/documents/src/templates/metadata.ts",
      target: "~/docn/templates/metadata.ts",
      type: "registry:lib",
      content: 'export const metadata = { title: "Card" };\n',
    },
  ],
};

const primitivesItem = {
  name: "docn-primitives",
  registryDependencies: [],
  files: [],
};

function registryFetch(input: string | URL | Request) {
  const url = String(input);
  const value = url.endsWith("docn-business-card-minimal.json")
    ? rootItem
    : url.endsWith("docn-business-card-foundation.json")
      ? dependencyItem
      : url.endsWith("docn-primitives.json")
        ? primitivesItem
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
      await screen.findByText("6 files · 3 registry items"),
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

    await screen.findByText("6 files · 3 registry items");
    await user.click(screen.getByRole("button", { name: "Copy source" }));
    expect(
      screen.getByText("Clipboard unavailable — select and copy manually."),
    ).toBeInTheDocument();
  });

  it("limits the drawer to the template and direct family foundation", async () => {
    const fetchMock = vi.fn(registryFetch);
    vi.stubGlobal("fetch", fetchMock);
    render(
      <RegistrySourcePanel
        itemName="docn-business-card-minimal"
        variant="drawer"
      />,
    );

    expect(await screen.findByText("card.tsx")).toBeInTheDocument();
    expect(screen.getByText("TS")).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Source file" })).toBeNull();
    expect(screen.queryByText("2 files · 2 registry items")).toBeNull();
    expect(
      screen.getByLabelText("~/docn/templates/card.tsx source"),
    ).toHaveTextContent('export const Card = "complete source";');
    expect(screen.getByText("layout.tsx")).toBeInTheDocument();
    expect(screen.getByText("schema.ts")).toBeInTheDocument();
    expect(screen.getByText("examples.ts")).toBeInTheDocument();
    expect(screen.queryByText("metadata.ts")).toBeNull();
    expect(screen.queryByText("index.ts")).toBeNull();
    await userEvent.click(screen.getByText("schema.ts"));
    expect(
      screen.getByLabelText("~/docn/templates/schema.ts source"),
    ).toHaveTextContent("interface CardData");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
