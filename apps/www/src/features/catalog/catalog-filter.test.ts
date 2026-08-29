import { describe, expect, it } from "vitest";
import { templateCatalog } from "@docn-ui/documents/catalog";
import { filterCatalog, serializeCatalogFilters } from "./catalog-filter";

describe("catalog filters", () => {
  it("combines search, family, and format without leaking private parameters", () => {
    expect(filterCatalog(templateCatalog, { q: "QR" })).toHaveLength(1);
    expect(
      filterCatalog(templateCatalog, {
        family: "business-card",
        format: "card-us",
        q: "editorial",
      }).map((entry) => entry.id),
    ).toEqual(["business-card-editorial"]);
    expect(
      filterCatalog(templateCatalog, {
        family: "business-card",
        format: "a4",
      }),
    ).toEqual([]);
    expect(
      serializeCatalogFilters({
        family: "business-card",
        format: "card-us",
        q: "  studio  ",
      }),
    ).toBe("q=studio&family=business-card&format=card-us");
  });
});
