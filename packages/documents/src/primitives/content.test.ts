import { describe, expect, it } from "vitest";
import { assertLocalImage } from "./image-validation";
import { assertDestinationId, validateLink } from "./link-validation";
import { assertListItems, type ListItem } from "./list-data";
import { FieldPair, KeyValue } from "./typography";
import { Divider, Separator } from "./layout";
import { assertSeparatorProps } from "./separator";
import {
  assertFormGroups,
  assertSignature,
  type FormGroup,
  type SignatureProps,
} from "./printable-data";
import { getWatermarkLayout, type WatermarkProps } from "./watermark-layout";

describe("content primitive contracts", () => {
  it("validates grouped print fields without losing blank values or repeated IDs", () => {
    const group: FormGroup = {
      id: "contact",
      title: "Contact",
      fields: [{ id: "name", label: "Name", value: "", required: true }],
    };
    for (const columns of [1, 2, 3] as const)
      expect(() => assertFormGroups([{ ...group, columns }])).not.toThrow();
    for (const groups of [
      [],
      null,
      [null],
      [group, group],
      [{ ...group, columns: 4 }],
      [{ ...group, columns: null }],
      [{ ...group, fields: [] }],
      [{ ...group, fields: [null] }],
      [group, { ...group, id: "other" }],
      [{ ...group, fields: [{ id: "x", label: " " }] }],
      [{ ...group, fields: [{ id: "x", label: "Name", required: "yes" }] }],
      [
        {
          ...group,
          fields: [{ id: "x", label: "Name", value: "a".repeat(2001) }],
        },
      ],
      Array.from({ length: 13 }, (_, index) => ({
        ...group,
        id: String(index),
      })),
      [
        {
          ...group,
          fields: Array.from({ length: 61 }, (_, index) => ({
            id: String(index),
            label: "Name",
          })),
        },
      ],
    ])
      expect(() => assertFormGroups(groups as readonly FormGroup[])).toThrow();
  });

  it("bounds signer groups, inline layout and writing space", () => {
    const signers = [
      {
        label: "Prepared by",
        name: "Élodie Mbemba",
        role: "Editor",
        date: "15 January 2026",
      },
    ];
    expect(() => assertSignature({ signers })).not.toThrow();
    expect(() =>
      assertSignature({
        signers: [...signers, { label: "Approved by" }],
        space: 96,
      }),
    ).not.toThrow();
    expect(() =>
      assertSignature({ signers, layout: "inline", space: 24 }),
    ).not.toThrow();
    for (const input of [
      { signers: [] },
      { signers: null },
      { signers: [null] },
      { signers: Array(3).fill(signers[0]) },
      { signers: [...signers, ...signers], layout: "inline" },
      { signers, layout: "unknown" },
      { signers: [{ label: " " }] },
      { signers: [{ label: "Signed by", name: 1 }] },
      ...[0, 23, 97, NaN, Infinity].map((space) => ({ signers, space })),
    ])
      expect(() => assertSignature(input as SignatureProps)).toThrow();
  });

  it("contains watermark envelopes and rejects unreadable or unsupported controls", () => {
    const body = { x: 36, y: 100, width: 523, height: 600 };
    for (const [placement, y] of [
      ["top", 100],
      ["center", 368],
      ["bottom", 636],
    ] as const)
      expect(getWatermarkLayout({ text: "DRAFT", placement }, body)).toEqual({
        ...body,
        y,
        height: 64,
      });
    expect(() =>
      getWatermarkLayout(
        { text: "ÉPREUVE", fontSize: 24, repeat: false },
        body,
      ),
    ).not.toThrow();
    const diagonal = getWatermarkLayout(
      { text: "CONFIDENTIAL", fontSize: 72, rotation: -38 },
      body,
    );
    expect(diagonal.width).toBe(body.width);
    expect(diagonal.x).toBe(body.x);
    expect(diagonal.height).toBe(144);
    expect(() =>
      getWatermarkLayout(
        { text: "CONFIDENTIAL", fontSize: 72, rotation: -90 },
        body,
      ),
    ).not.toThrow();
    for (const input of [
      { text: "" },
      { text: "A".repeat(25) },
      { text: "two\nlines" },
      { text: "草稿" },
      { text: "DRAFT", placement: "outside" },
      { text: "DRAFT", repeat: "yes" },
      ...[0, 0.21, NaN].map((opacity) => ({ text: "DRAFT", opacity })),
      ...[11, 97, Infinity].map((fontSize) => ({ text: "DRAFT", fontSize })),
      ...[-91, 91, Infinity].map((rotation) => ({ text: "DRAFT", rotation })),
    ])
      expect(() => getWatermarkLayout(input as WatermarkProps, body)).toThrow();
    expect(() =>
      getWatermarkLayout({ text: "DRAFT" }, { ...body, width: 80 }),
    ).toThrow(/envelope/);
    expect(() =>
      getWatermarkLayout({ text: "DRAFT" }, { ...body, height: 50 }),
    ).toThrow(/envelope/);
  });

  it("keeps aliases on one implementation", () => {
    expect(KeyValue).toBe(FieldPair);
    expect(Divider).toBe(Separator);
  });

  it("bounds labeled and partial divider variants", () => {
    for (const input of [
      {},
      { label: "OR" },
      { width: 240 },
      { width: "60%" as const },
    ])
      expect(() => assertSeparatorProps(input)).not.toThrow();
    for (const input of [
      { label: "" },
      { label: "two\nlines" },
      { label: "a".repeat(49) },
      { width: 23 },
      { width: Infinity },
      { width: "101%" as `${number}%` },
    ])
      expect(() => assertSeparatorProps(input)).toThrow();
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
      "data:image/png;base64,iVBORw0KGgo=",
      "data:image/jpeg;base64,/9j/4AAQSkY=",
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
      "data:image/png;base64,aGVsbG8=",
      "data:image/jpeg;base64,iVBORw0KGgo=",
      "data:image/png;base64," + "A".repeat(7_000_000),
    ]) {
      expect(() => assertLocalImage(source, 70, 35)).toThrow();
    }
    for (const size of [0, -1, NaN, Infinity]) {
      expect(() => assertLocalImage("blob:null/local", size, 35)).toThrow();
      expect(() => assertLocalImage("blob:null/local", 70, size)).toThrow();
    }
    for (const radius of [-1, 18, NaN, Infinity])
      expect(() =>
        assertLocalImage("blob:null/local", 70, 35, radius),
      ).toThrow();
    expect(() =>
      assertLocalImage("blob:null/local", 70, 35, 17.5),
    ).not.toThrow();
  });
});
