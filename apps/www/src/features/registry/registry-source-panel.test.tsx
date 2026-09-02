import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegistrySourcePanel } from "./registry-source-panel";

const rootItem = {
  name: "docn-component-example",
  meta: {
    sourcePreview: [
      {
        item: "docn-component-example",
        target: "~/docn/examples/card.tsx",
      },
      {
        item: "docn-document-frame",
        target: "~/docn/examples/layout.tsx",
      },
      {
        item: "docn-document-frame",
        target: "~/docn/examples/schema.ts",
      },
      {
        item: "docn-component-example",
        target: "~/docn/examples/examples.ts",
      },
    ],
  },
  registryDependencies: [
    "http://127.0.0.1:4173/r/dev/docn-document-frame.json",
    "http://127.0.0.1:4173/r/dev/docn-primitives.json",
  ],
  files: [
    {
      path: "packages/documents/src/examples/card.tsx",
      target: "~/docn/examples/card.tsx",
      type: "registry:component",
      content: 'export const Card = "composed source";\n',
    },
    {
      path: "packages/documents/src/examples/examples.ts",
      target: "~/docn/examples/examples.ts",
      type: "registry:component",
      content: 'export const example = { name: "Avery" };\n',
    },
    {
      path: "packages/documents/src/examples/index.ts",
      target: "~/docn/examples/index.ts",
      type: "registry:component",
      content: 'export * from "./card";\n',
    },
  ],
};

const dependencyItem = {
  name: "docn-document-frame",
  registryDependencies: [],
  files: [
    {
      path: "packages/documents/src/examples/layout.tsx",
      target: "~/docn/examples/layout.tsx",
      type: "registry:lib",
      content: "export function DocumentLayout() { return null; }\n",
    },
    {
      path: "packages/documents/src/examples/schema.ts",
      target: "~/docn/examples/schema.ts",
      type: "registry:lib",
      content: "export interface DocumentData { name: string }\n",
    },
    {
      path: "packages/documents/src/examples/metadata.ts",
      target: "~/docn/examples/metadata.ts",
      type: "registry:lib",
      content: 'export const metadata = { title: "Document" };\n',
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
  const value = url.endsWith("docn-component-example.json")
    ? rootItem
    : url.endsWith("docn-document-frame.json")
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
  it("loads the bounded preview and copies the selected source", async () => {
    vi.stubGlobal("fetch", vi.fn(registryFetch));
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<RegistrySourcePanel itemName="docn-component-example" />);

    expect(
      await screen.findByText("4 files · 2 registry items"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/node docn\/assets\/install\.mjs/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("~/docn/examples/card.tsx source"),
    ).toHaveTextContent('export const Card = "composed source";');
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
    render(<RegistrySourcePanel itemName="docn-component-example" />);

    await screen.findByText("4 files · 2 registry items");
    await user.click(screen.getByRole("button", { name: "Copy source" }));
    expect(
      screen.getByText("Clipboard unavailable — select and copy manually."),
    ).toBeInTheDocument();
  });

  it("limits the drawer to the example and declared direct dependency", async () => {
    const fetchMock = vi.fn(registryFetch);
    vi.stubGlobal("fetch", fetchMock);
    render(
      <RegistrySourcePanel
        itemName="docn-component-example"
        variant="drawer"
      />,
    );

    expect(await screen.findByText("card.tsx")).toBeInTheDocument();
    expect(screen.getByText("TS")).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Source file" })).toBeNull();
    expect(screen.queryByText("2 files · 2 registry items")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Copy install command" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /shadcn@4\.19\.1 add .*\/r\/dev\/docn-component-example\.json/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("~/docn/examples/card.tsx source"),
    ).toHaveTextContent('export const Card = "composed source";');
    expect(screen.getByText("layout.tsx")).toBeInTheDocument();
    expect(screen.getByText("schema.ts")).toBeInTheDocument();
    expect(screen.getByText("examples.ts")).toBeInTheDocument();
    expect(screen.queryByText("metadata.ts")).toBeNull();
    expect(screen.queryByText("index.ts")).toBeNull();
    await userEvent.click(screen.getByText("schema.ts"));
    expect(
      screen.getByLabelText("~/docn/examples/schema.ts source"),
    ).toHaveTextContent("interface DocumentData");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows only declared component support files without loading transitive primitives", async () => {
    const file = (name: string) => ({
      path: `packages/documents/src/primitives/${name}.tsx`,
      target: `~/docn/primitives/${name}.tsx`,
      type: "registry:component",
      content: `export const ${name} = 1;`,
    });
    const primary = file("DataTable");
    const supporting = file("Table");
    const fetchMock = vi.fn(
      async (input: string | URL | Request) =>
        new Response(
          JSON.stringify(
            String(input).endsWith("docn-data-table.json")
              ? {
                  name: "docn-data-table",
                  files: [primary],
                  registryDependencies: [
                    "/r/dev/docn-table.json",
                    "/r/dev/docn-text.json",
                  ],
                  meta: {
                    sourcePreview: [
                      { item: "docn-data-table", target: primary.target },
                      { item: "docn-table", target: supporting.target },
                    ],
                  },
                }
              : {
                  name: "docn-table",
                  files: [supporting, file("PrivateHelper")],
                  registryDependencies: ["/r/dev/docn-core.json"],
                },
          ),
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    const { rerender } = render(
      <RegistrySourcePanel itemName="docn-data-table" variant="drawer" />,
    );
    expect(await screen.findByText("DataTable.tsx")).toBeInTheDocument();
    await user.click(screen.getByText("Table.tsx"));
    expect(
      screen.getByLabelText(`${supporting.target} source`),
    ).toHaveTextContent(supporting.content);
    expect(screen.queryByText("PrivateHelper.tsx")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const single = file("Heading");
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          name: "docn-heading",
          files: [single],
          registryDependencies: ["/r/dev/docn-text.json"],
          meta: {
            sourcePreview: [{ item: "docn-heading", target: single.target }],
          },
        }),
      ),
    );
    rerender(<RegistrySourcePanel itemName="docn-heading" variant="drawer" />);
    expect(screen.queryByText("Table.tsx")).toBeNull();
    expect(
      await screen.findByLabelText(`${single.target} source`),
    ).toHaveTextContent(single.content);
    expect(screen.queryByLabelText("Component files")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
