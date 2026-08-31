import { describe, expect, it } from "vitest";
import { assertLocalImage } from "./image-validation";
import { assertDestinationId, validateLink } from "./link-validation";
import { assertListItems, type ListItem } from "./list-data";
import { FieldPair, KeyValue } from "./typography";
import { Divider, Separator } from "./layout";

describe("content primitive contracts", () => {
  it("keeps aliases on one implementation", () => {
    expect(KeyValue).toBe(FieldPair);
    expect(Divider).toBe(Separator);
  });

  it("allows explicit readable destinations and rejects unsafe or ambiguous links", () => {
    for (const href of [
      "https://example.com/a?q=one#part",
      "http://example.com",
      "mailto:hello@example.com",
      "tel:+242065550124",
      "#end-note",
    ]) {
      expect(validateLink(href, "Read more")).toBe(href);
    }
    for (const href of [
      "javascript:alert(1)",
      "data:text/html,hello",
      "file:///private",
      "//example.com",
      "https://user:pass@example.com",
      "https://example.com/\n",
      "https:\\example.com",
      "mailto:hello@example.com?body=bad",
      "mailto:a%0d%0a@example.com",
      "tel:1;ext=2",
      "#bad id",
      "https://example.com/" + "a".repeat(2000),
    ]) {
      expect(() => validateLink(href, "Read more")).toThrow();
    }
    expect(() => validateLink("https://example.com", " ")).toThrow();
    expect(() =>
      validateLink("https://example.com", "a".repeat(2001)),
    ).toThrow();
    expect(() => assertDestinationId("a".repeat(129))).toThrow();
    expect(() => assertDestinationId("end-note")).not.toThrow();
  });

  it("bounds nested lists including cycles, content and check states", () => {
    const valid = [
      {
        text: "One",
        description: "Details",
        checked: true,
        children: [{ text: "Two", children: [{ text: "Three" }] }],
      },
    ];
    expect(() => assertListItems(valid)).not.toThrow();
    expect(() => assertListItems([])).not.toThrow();
    expect(() =>
      assertListItems(Array.from({ length: 100 }, () => ({ text: "Item" }))),
    ).not.toThrow();
    expect(() =>
      assertListItems(Array.from({ length: 101 }, () => ({ text: "Item" }))),
    ).toThrow();
    const cycle: ListItem[] = [{ text: "Cycle" }];
    cycle[0]!.children = cycle;
    for (const invalid of [
      cycle,
      [{ text: "" }],
      [{ text: "a".repeat(2001) }],
      [{ text: "Label", description: "a".repeat(2001) }],
      [{ text: "Label", checked: "yes" }],
      [{ text: "Label", children: null }],
      null,
    ]) {
      expect(() => assertListItems(invalid as readonly ListItem[])).toThrow();
    }
  });

  it("preserves local sources and rejects remote paths, invalid sizes and oversized data", () => {
    for (const source of [
      "blob:http://127.0.0.1:3000/local-image",
      "blob:null/local-image",
      "blob:nodedata:local-image",
      "data:image/png;base64,aGVsbG8=",
    ]) {
      expect(() => assertLocalImage(source, 70, 35)).not.toThrow();
    }
    for (const source of [
      "https://example.com/image.png",
      "file:///image.png",
      "./image.png",
      "data:image/svg+xml;base64,AAAA",
      "data:image/png;base64,",
      "data:image/png;base64,???=",
      "data:image/png;base64," + "A".repeat(7_000_000),
    ]) {
      expect(() => assertLocalImage(source, 70, 35)).toThrow();
    }
    for (const size of [0, -1, NaN, Infinity]) {
      expect(() => assertLocalImage("blob:null/local", size, 35)).toThrow();
      expect(() => assertLocalImage("blob:null/local", 70, size)).toThrow();
    }
  });
});
