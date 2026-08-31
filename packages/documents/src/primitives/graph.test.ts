import { describe, expect, it } from "vitest";
import { resolveGraph, type GraphProps } from "./graph-data";
import {
  cartesianGeometry,
  circularGeometry,
  createGraphScale,
  scaleGraphValue,
  sectorPath,
} from "./graph-geometry";
import { createGraphLayout } from "./graph-layout";

const input: GraphProps = {
  type: "bar",
  title: "Printed copies",
  seriesLabel: "Copies",
  data: [
    { label: "Jan", value: 20 },
    { label: "Feb", value: 40 },
  ],
};
describe("vector graph contracts and geometry", () => {
  it("bounds typed data and preserves explicit empty, zero and signed states", () => {
    expect(resolveGraph({ ...input, data: [] }).data).toEqual([]);
    expect(
      resolveGraph({ ...input, data: [{ label: "Jan", value: -1 }] }).data[0]!
        .value,
    ).toBe(-1);
    for (const patch of [
      { type: "scatter" },
      { data: null },
      { data: [null] },
      { title: "" },
      { seriesLabel: "two\nlines" },
      { seriesLabel: "\u00ad" },
      {
        data: [
          { label: "Jan", value: 1 },
          { label: "Jan", value: 2 },
        ],
      },
      { data: [{ label: "A".repeat(33), value: 1 }] },
      ...[NaN, Infinity, -Infinity, 1e10, 1e-7, "12"].map((value) => ({
        data: [{ label: "Jan", value }],
      })),
      { type: "pie", data: [{ label: "Jan", value: -1 }] },
      { type: "donut", data: [{ label: "Jan", value: -1 }] },
      {
        data: Array.from({ length: 13 }, (_, index) => ({
          label: String(index),
          value: 1,
        })),
      },
      {
        type: "pie",
        data: Array.from({ length: 9 }, (_, index) => ({
          label: String(index),
          value: 1,
        })),
      },
      ...[0, 159, 541, Infinity].map((width) => ({ width })),
      { height: 701 },
    ])
      expect(() =>
        resolveGraph({ ...input, ...patch } as GraphProps),
      ).toThrow();
  });

  it("uses finite zero-inclusive nice scales including flat and tiny values", () => {
    const scale = createGraphScale([
      { label: "A", value: -5 },
      { label: "B", value: 35 },
    ]);
    expect(scale).toEqual({
      min: -10,
      max: 40,
      ticks: [-10, 0, 10, 20, 30, 40],
    });
    expect(scaleGraphValue(0, scale, 0, 100)).toBe(20);
    expect(createGraphScale([{ label: "A", value: 0 }])).toEqual({
      min: 0,
      max: 1,
      ticks: [0, 0.25, 0.5, 0.75, 1],
    });
    for (const values of [
      [25, 25],
      [-8, -2],
      [-1e-6, 2e-6],
      [-1e9, 1e9],
    ]) {
      const current = createGraphScale(
        values.map((value, index) => ({ label: String(index), value })),
      );
      expect(current.min).toBeLessThanOrEqual(Math.min(0, ...values));
      expect(current.max).toBeGreaterThanOrEqual(Math.max(0, ...values));
      expect(current.ticks).toContain(0);
      expect(current.ticks.length).toBeLessThanOrEqual(7);
      expect(current.ticks.every(Number.isFinite)).toBe(true);
      expect(new Set(current.ticks).size).toBe(current.ticks.length);
    }
  });

  it("places positive and negative bars around zero without changing their proportions", () => {
    const data = [
      { label: "A", value: -10 },
      { label: "B", value: 30 },
    ];
    const box = { x: 20, y: 30, width: 200, height: 120 };
    const scale = createGraphScale(data);
    const vertical = cartesianGeometry(data, box, scale, false);
    expect(vertical.baseline).toBe(120);
    expect(vertical.bars[0]!.height).toBe(30);
    expect(vertical.bars[1]!.height).toBe(90);
    const horizontal = cartesianGeometry(data, box, scale, true);
    expect(horizontal.baseline).toBe(70);
    expect(horizontal.bars[0]!.width).toBe(50);
    expect(horizontal.bars[1]!.width).toBe(150);
    for (const rectangle of [...vertical.bars, ...horizontal.bars]) {
      expect(rectangle.x).toBeGreaterThanOrEqual(box.x);
      expect(rectangle.y).toBeGreaterThanOrEqual(box.y);
      expect(rectangle.x + rectangle.width).toBeLessThanOrEqual(
        box.x + box.width,
      );
      expect(rectangle.y + rectangle.height).toBeLessThanOrEqual(
        box.y + box.height,
      );
    }
  });

  it("closes whole circles/rings and keeps numbered leaders ordered with zero entries omitted only from geometry", () => {
    const box = { x: 8, y: 28, width: 234, height: 110 };
    const data = [
      { label: "A", value: 9 },
      { label: "B", value: 0 },
      { label: "C", value: 1 },
    ];
    const geometry = circularGeometry(data, box, 7, true);
    expect(geometry.total).toBe(10);
    expect(geometry.sectors.map((sector) => sector.index)).toEqual([0, 2]);
    expect(
      circularGeometry([{ label: "A", value: 0 }], box, 7, false).sectors,
    ).toEqual([]);
    const center = { x: 100, y: 100 };
    const pie = sectorPath(center, 50, 0, 0, Math.PI * 2);
    const donut = sectorPath(center, 50, 28, 0, Math.PI * 2);
    expect(pie.match(/ A /g)).toHaveLength(2);
    expect(pie).not.toContain("L 100 100");
    expect(donut.match(/ A /g)).toHaveLength(4);
    expect(donut).toContain("Z M");
    const single = circularGeometry(
      [{ label: "Only", value: 8 }],
      box,
      7,
      true,
    );
    expect(single.sectors[0]!.anchor.y).toBe(single.center.y);
    expect(single.sectors[0]!.label.y).toBe(single.center.y);
    for (const sector of geometry.sectors) {
      expect(sector.path).not.toMatch(/NaN|Infinity/);
      expect(sector.label.y).toBeGreaterThan(box.y);
      expect(sector.label.y).toBeLessThan(box.y + box.height);
    }
  });

  it("rejects label collisions, oversized fonts and invisible positive sectors instead of clipping them", () => {
    expect(() => createGraphLayout(resolveGraph(input), 7, 10)).not.toThrow();
    for (const graph of [
      { ...input, title: "Long title ".repeat(5) },
      {
        ...input,
        data: Array.from({ length: 12 }, (_, index) => ({
          label: `Month ${index}`,
          value: 100,
        })),
      },
      {
        ...input,
        type: "horizontal-bar" as const,
        data: [{ label: "Long horizontal category", value: 100 }],
      },
      {
        ...input,
        type: "pie" as const,
        data: [
          { label: "A", value: 1e9 },
          { label: "B", value: 1e-6 },
        ],
      },
    ])
      expect(() => createGraphLayout(resolveGraph(graph), 7, 10)).toThrow();
    expect(() => createGraphLayout(resolveGraph(input), 32, 32)).toThrow();
  });
});
