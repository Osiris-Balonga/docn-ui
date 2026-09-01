import "server-only";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cache } from "react";
import type { ComponentCatalogEntry } from "@docn-ui/documents/catalog/components";
import type { FormatDefinition } from "@docn-ui/documents/core";
import type { PdfTheme } from "@docn-ui/documents/themes";

export interface PdfExample {
  pdf: string;
  pages: { src: string; width: number; height: number; text: string }[];
}
export interface ComponentReference
  extends Omit<ComponentCatalogEntry, "recipes">, PdfExample {
  usage: string;
  exampleItems: string[];
  api: {
    name: string;
    props: {
      name: string;
      type: string;
      required: boolean;
      default: string | null;
      description: string;
    }[];
  }[];
  recipes: { title: string; description: string; code: string }[];
}
interface DocumentationCatalog {
  components: ComponentReference[];
  formats: (FormatDefinition & {
    templates: { title: string; slug: string }[];
  })[];
  themes: (PdfExample & { id: string; tokens: PdfTheme })[];
}

export const readDocumentationCatalog = cache(
  async (): Promise<DocumentationCatalog> =>
    JSON.parse(
      await readFile(
        resolve(process.cwd(), "../../.artifacts/docs/catalog.json"),
        "utf8",
      ),
    ),
);
