import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildRegistry,
  resolveItemClosure,
  rewriteDocumentImports,
  validateSourceManifest,
} from "./registry.mjs";
import { registrySourceManifest } from "./source-manifest.mjs";

const root = fileURLToPath(new URL("../..", import.meta.url));

describe("document registry generation", () => {
  it("builds the real card graph with bounded import rewriting", async () => {
    const result = await buildRegistry({
      root,
      origin: "http://127.0.0.1:4173/r/dev/",
    });
    expect(result.items.map((item) => item.name)).toEqual([
      "docn-core",
      "docn-themes",
      "docn-render",
      "docn-primitives",
      "docn-business-card-foundation",
      "docn-business-card-minimal",
      "docn-business-card-editorial",
      "docn-business-card-studio",
    ]);
    const minimal = result.items.find(
      (item) => item.name === "docn-business-card-minimal",
    );
    const composition = minimal?.files.find((file) =>
      file.path.endsWith("business-card-minimal.tsx"),
    );
    expect(composition?.content).toContain('from "@/docn/primitives/index"');
    expect(composition?.content).toContain("website.replace(/^https?:\\/\\//");
    expect(minimal?.registryDependencies).toEqual(
      expect.arrayContaining([
        "http://127.0.0.1:4173/r/dev/docn-primitives.json",
      ]),
    );
    expect(
      await buildRegistry({
        root,
        origin: "http://127.0.0.1:4173/r/dev/",
      }),
    ).toEqual(result);
  });

  it("rewrites import specifiers only and rejects unresolved sources", () => {
    const targets = new Map([
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
        'import { x } from "@/docn/core/errors";',
        'type T = import("@/docn/core/formats").FormatDefinition;',
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
    expect(
      resolveItemClosure(
        "docn-business-card-minimal",
        new Map(
          registrySourceManifest.items.map((candidate) => [
            candidate.name,
            candidate,
          ]),
        ),
      ).at(-1),
    ).toBe("docn-business-card-minimal");
  });
});
