import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { readExampleSource } from "./source-reference.mjs";
import { componentCatalog } from "../../packages/documents/src/catalog/components";
import { componentRegistryItems } from "../registry/component-items.mjs";
import { knownPages } from "../../apps/www/src/features/docs/page-index";
import { docsNavigation } from "../../apps/www/src/features/docs/navigation";

const root = fileURLToPath(new URL("../..", import.meta.url));

test("every public component has one registry item, searchable route and sidebar link", () => {
  expect(componentCatalog).toHaveLength(28);
  expect(componentCatalog.map(({ slug }) => `docn-${slug}`).sort()).toEqual(
    componentRegistryItems.map((item: { name: string }) => item.name).sort(),
  );
  const navigation = docsNavigation.flatMap((group) => group.items);
  for (const { slug } of componentCatalog) {
    const href = `/components/${slug}/`;
    expect(knownPages.filter((page) => page.href === href)).toHaveLength(1);
    expect(navigation.filter((page) => page.href === href)).toHaveLength(1);
  }
});

test("usage retains its local data/types and imports without leaking other examples", async () => {
  const example = await readExampleSource(
    root,
    "packages/documents/src/examples/components/data.tsx",
    "DataTableExample",
  );
  expect(example.code).toContain("interface PrintRow");
  expect(example.code).toContain("const printRows");
  expect(example.code).toContain("const printColumns");
  expect(example.code).toContain('from "../docn/primitives/data-table"');
  expect(example.code).not.toContain("Barcode");
  expect(example.code).not.toContain("Graph");
  expect(example.code).not.toContain("function TableExample");
  expect(example.imports).toContain("../../primitives/composable-table");
});
