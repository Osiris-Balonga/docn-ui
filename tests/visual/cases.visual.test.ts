import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { templateCatalog } from "../../packages/documents/src/catalog";

interface VisualReference {
  templateId: string;
  family: string;
  page: number;
  file: string;
  width: number;
  height: number;
  sha256: string;
  rationale: string;
}

const referenceRoot = resolve(import.meta.dirname, "references");

describe("approved V1 visual references", () => {
  it("matches exact generated rasters for every catalog family", async () => {
    const manifest = JSON.parse(
      await readFile(resolve(import.meta.dirname, "references.json"), "utf8"),
    ) as { references: VisualReference[] };
    expect(new Set(manifest.references.map(({ family }) => family))).toEqual(
      new Set([
        "invoice",
        "receipt",
        "resume",
        "report",
        "badge",
        "business-card",
      ]),
    );

    for (const reference of manifest.references) {
      expect(reference.rationale.trim().length).toBeGreaterThan(20);
      const template = templateCatalog.find(
        ({ id }) => id === reference.templateId,
      );
      const page = template?.pages.find(
        ({ page: pageNumber }) => pageNumber === reference.page,
      );
      expect(page).toMatchObject({
        width: reference.width,
        height: reference.height,
        sha256: reference.sha256,
      });
      const bytes = await readFile(resolve(referenceRoot, reference.file));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        reference.sha256,
      );
      expect(bytes.readUInt32BE(16)).toBe(reference.width);
      expect(bytes.readUInt32BE(20)).toBe(reference.height);
    }
  });
});
