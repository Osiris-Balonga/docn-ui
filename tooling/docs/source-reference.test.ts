import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import { createApiReader, readExampleSource } from "./source-reference.mjs";
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
  expect(example.code).toContain("const dataBaseColumns");
  expect(example.code).toContain('from "../docn/primitives/data-table"');
  expect(example.code).not.toContain("Barcode");
  expect(example.code).not.toContain("Graph");
  expect(example.code).not.toContain("function TableExample");
  expect(example.imports).toContain("../../primitives/composable-table");
});

test("component recipes stay focused and public props retain source descriptions", async () => {
  const recipe = await readExampleSource(
    root,
    "packages/documents/src/examples/components/content.tsx",
    "DividerLabelExample",
  );
  expect(recipe.code).toContain('<Divider label="OR" />');
  expect(recipe.code).not.toContain("DividerLineStylesExample");
  const item = componentRegistryItems.find(
    (candidate: { name: string }) => candidate.name === "docn-divider",
  );
  const [divider] = createApiReader(root)(item);
  expect(divider.props.find((prop) => prop.name === "variant")).toMatchObject({
    default: '"solid"',
    description: "PDF-native border style.",
  });

  const readApi = createApiReader(root);
  for (const entry of componentCatalog) {
    expect(entry.recipes?.length, `${entry.title} recipes`).toBeGreaterThan(0);
    const registryItem = componentRegistryItems.find(
      (candidate: { name: string }) => candidate.name === `docn-${entry.slug}`,
    );
    const api = readApi(registryItem);
    for (const declaration of api)
      for (const prop of declaration.props)
        expect(prop.description, `${entry.title}.${prop.name}`).not.toBe("");
  }
}, 10_000);
