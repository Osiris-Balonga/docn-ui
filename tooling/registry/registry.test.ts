import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildRegistry,
  resolveItemClosure,
  rewriteDocumentImports,
  validateSourceManifest,
} from "./registry.mjs";
import { registrySourceManifest } from "./source-manifest.mjs";
import { templateCatalog } from "../../packages/documents/src/catalog/manifest";

const root = fileURLToPath(new URL("../..", import.meta.url));

describe("document registry generation", () => {
  it("builds the component and source-owned template registry", async () => {
    const result = await buildRegistry({
      root,
      origin: "http://127.0.0.1:4173/r/dev/",
    });
    expect(templateCatalog).toHaveLength(18);
    expect(
      templateCatalog.reduce<Record<string, number>>((counts, template) => {
        counts[template.family] = (counts[template.family] ?? 0) + 1;
        return counts;
      }, {}),
    ).toEqual({
      badge: 3,
      "business-card": 2,
      invoice: 4,
      receipt: 3,
      report: 3,
      resume: 3,
    });
    expect(
      templateCatalog.filter((template) => template.family === "business-card"),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ sides: 2 })]));
    expect(
      templateCatalog.filter((template) => template.family === "badge"),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "badge-profile-lanyard", sides: 2 }),
      ]),
    );
    expect(result.items.map((item) => item.name)).toEqual(
      expect.arrayContaining([
        "docn-core",
        "docn-themes",
        "docn-render",
        "docn-theme-context",
        "docn-barcode",
        "docn-primitives",
        "docn-text-example",
        "docn-component-example",
        "docn-template-style",
        "docn-resume-classic",
        "docn-resume-accountant",
        "docn-resume-designer",
        "docn-invoice-spacious",
        "docn-invoice-vertical",
        "docn-invoice-corporate",
        "docn-invoice-photo-header",
        "docn-receipt-order-confirmation",
        "docn-receipt-product-barcode",
        "docn-report-product-analytics",
        "docn-badge-profile-lanyard",
        "docn-badge-qr-portrait-light",
        "docn-badge-qr-portrait-blue",
        "docn-business-card-coral-qr",
      ]),
    );
    expect(result.items.some((item) => item.name.includes("invoice"))).toBe(
      true,
    );
    expect(
      result.items.some((item) => item.name.includes("business-card")),
    ).toBe(true);
    const contracts = result.items.find(
      (item) => item.name === "docn-contracts",
    )!;
    expect(
      contracts.files.find((file) => file.target === "~/docn/LICENSE"),
    ).toMatchObject({
      content: expect.stringContaining(
        "Copyright (c) 2026 Emmanuel Osiris Balonga",
      ),
    });
    expect(
      await buildRegistry({
        root,
        origin: "http://127.0.0.1:4173/r/dev/",
      }),
    ).toEqual(result);
  });
  it("isolates the barcode encoder from unrelated components and theme context", () => {
    const items = new Map(
      registrySourceManifest.items.map((item) => [item.name, item]),
    );
    for (const item of registrySourceManifest.items) {
      expect(resolveItemClosure(item.name, items)).toContain("docn-contracts");
    }
    const barcode = resolveItemClosure("docn-barcode", items);
    expect(barcode).toEqual([
      "docn-contracts",
      "docn-themes",
      "docn-theme-context",
      "docn-barcode",
    ]);
    const sources = barcode.flatMap((name: string) => items.get(name)!.files);
    expect(
      sources.some((file: string) => /templates|render\//.test(file)),
    ).toBe(false);
    const textClosure = resolveItemClosure("docn-text", items).map(
      (name: string) => items.get(name)!,
    );
    const textFiles = textClosure.flatMap(
      (item: { files: string[] }) => item.files,
    );
    expect(textFiles).toHaveLength(9);
    expect(textFiles).toContain("packages/documents/src/LICENSE");
    expect(
      textFiles.some((file: string) =>
        /render\/|templates\/|heading|field-pair|qr-code|barcode|graph|index.tsx/.test(
          file,
        ),
      ),
    ).toBe(false);
    expect(
      new Set(
        textClosure.flatMap(
          (item: { dependencies: string[] }) => item.dependencies,
        ),
      ),
    ).toEqual(
      new Set(["zod@3.25.76", "react@19.2.8", "@react-pdf/renderer@4.9.0"]),
    );
    for (const item of registrySourceManifest.items.filter(
      (item) => "component" in item,
    )) {
      const closure = resolveItemClosure(item.name, items).map((name: string) =>
        items.get(name)!,
      );
      expect(
        closure
          .flatMap((dependency: { files: string[] }) => dependency.files)
          .some((file: string) =>
            /templates\/|render\/(?:runtime|browser|node|print-profile)\./.test(
              file,
            ),
          ),
      ).toBe(false);
    }
    for (const name of ["docn-primitives", "docn-theme-context"]) {
      const closure = resolveItemClosure(name, items).map((key: string) =>
        items.get(key)!,
      );
      expect(
        closure.flatMap(
          (item: { dependencies: string[] }) => item.dependencies,
        ),
      ).not.toContain("jsbarcode@3.12.3");
      expect(
        closure
          .flatMap((item: { files: string[] }) => item.files)
          .some((file: string) => file.includes("barcode")),
      ).toBe(false);
    }
  });

  it("rewrites import specifiers only and rejects unresolved sources", () => {
    const targets = new Map([
      ["packages/documents/src/core/contracts.ts", "~/docn/core/contracts.ts"],
      ["packages/documents/src/core/errors.ts", "~/docn/core/errors.ts"],
      ["packages/documents/src/core/formats.ts", "~/docn/core/formats.ts"],
    ]);
    const content = [
      'import { x } from "./errors";',
      'type T = import("./formats").FormatDefinition;',
      'const example = "./errors";',
    ].join("\n");
    expect(
      rewriteDocumentImports(
        "packages/documents/src/core/contracts.ts",
        content,
        targets,
      ),
    ).toBe(
      [
        'import { x } from "./errors";',
        'type T = import("./formats").FormatDefinition;',
        'const example = "./errors";',
      ].join("\n"),
    );
    expect(() =>
      rewriteDocumentImports(
        "packages/documents/src/core/contracts.ts",
        'import "./missing";',
        targets,
      ),
    ).toThrow('Unresolved registry import "./missing"');
  });

  it("rejects duplicate, unsafe, missing, and cyclic graph declarations", async () => {
    const item = {
      name: "docn-a",
      type: "registry:lib",
      title: "A",
      description: "A",
      dependencies: [],
      registryDependencies: [],
      files: ["packages/documents/src/core/errors.ts"],
    };
    expect(() =>
      validateSourceManifest({ items: [item, { ...item }] }),
    ).toThrow("Duplicate registry item name");
    expect(() =>
      validateSourceManifest({
        items: [item, { ...item, name: "docn-b" }],
      }),
    ).toThrow("belongs to both docn-a and docn-b");
    expect(() =>
      validateSourceManifest({
        items: [{ ...item, files: ["../outside.ts"] }],
      }),
    ).toThrow("Unsafe registry source path");
    expect(() =>
      validateSourceManifest({
        items: [{ ...item, registryDependencies: ["docn-missing"] }],
      }),
    ).toThrow("Missing registry dependency");
    const cyclic = [
      { ...item, registryDependencies: ["docn-b"] },
      {
        ...item,
        name: "docn-b",
        files: ["packages/documents/src/core/formats.ts"],
        registryDependencies: ["docn-a"],
      },
    ];
    expect(() => validateSourceManifest({ items: cyclic })).toThrow(
      "Registry dependency cycle",
    );
    await expect(
      buildRegistry({
        root,
        manifest: {
          items: [
            {
              ...item,
              files: ["packages/documents/src/core/not-present.ts"],
            },
          ],
        },
      }),
    ).rejects.toThrow("Missing registry source file");
    await expect(
      buildRegistry({
        root,
        manifest: {
          ...registrySourceManifest,
          items: registrySourceManifest.items.map((candidate) =>
            candidate.name === "docn-text"
              ? {
                  ...candidate,
                  preview: ["packages/documents/src/primitives/barcode.tsx"],
                }
              : candidate,
          ),
        },
      }),
    ).rejects.toThrow("outside docn-text's dependency closure");
  });
});
