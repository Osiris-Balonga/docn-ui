import type { GraphDatum } from "./graph-data";

export interface GraphBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface GraphPoint {
  x: number;
  y: number;
}
export interface GraphScale {
  min: number;
  max: number;
  ticks: readonly number[];
}

export function createGraphScale(data: readonly GraphDatum[]): GraphScale {
  const low = Math.min(0, ...data.map((datum) => datum.value));
  const high = Math.max(0, ...data.map((datum) => datum.value));
  if (low === high) return { min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] };
  const rough = (high - low) / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / power;
  const step =
    (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) *
    power;
  const first = Math.floor(low / step);
  const last = Math.ceil(high / step);
  const ticks = Array.from({ length: last - first + 1 }, (_, index) =>
    Number(((first + index) * step).toPrecision(12)),
  );
  return { min: ticks[0]!, max: ticks.at(-1)!, ticks };
}

export function scaleGraphValue(
  value: number,
  scale: GraphScale,
  start: number,
  end: number,
): number {
  return (
    start + ((value - scale.min) / (scale.max - scale.min)) * (end - start)
  );
}

export function cartesianGeometry(
  data: readonly GraphDatum[],
  box: GraphBox,
  scale: GraphScale,
  horizontal: boolean,
) {
  const band = (horizontal ? box.height : box.width) / Math.max(1, data.length);
  const baseline = horizontal
    ? scaleGraphValue(0, scale, box.x, box.x + box.width)
    : scaleGraphValue(0, scale, box.y + box.height, box.y);
  const points = data.map((datum, index) =>
    horizontal
      ? {
          x: scaleGraphValue(datum.value, scale, box.x, box.x + box.width),
          y: box.y + band * (index + 0.5),
        }
      : {
          x: box.x + band * (index + 0.5),
          y: scaleGraphValue(datum.value, scale, box.y + box.height, box.y),
        },
  );
  const bars = points.map((point) =>
    horizontal
      ? {
          x: Math.min(point.x, baseline),
          y: point.y - band * 0.28,
          width: Math.abs(point.x - baseline),
          height: band * 0.56,
        }
      : {
          x: point.x - band * 0.28,
          y: Math.min(point.y, baseline),
          width: band * 0.56,
          height: Math.abs(point.y - baseline),
        },
  );
  return { baseline, points, bars };
}

export function graphCoordinate(value: number): string {
  return String(Number(value.toFixed(5)));
}
export function pointPath(point: GraphPoint): string {
  return `${graphCoordinate(point.x)} ${graphCoordinate(point.y)}`;
}
export function polarPoint(
  center: GraphPoint,
  radius: number,
  angle: number,
): GraphPoint {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
}

export function sectorPath(
  center: GraphPoint,
  radius: number,
  innerRadius: number,
  start: number,
  end: number,
): string {
  const mid = (start + end) / 2;
  const outer = [start, mid, end].map((angle) =>
    pointPath(polarPoint(center, radius, angle)),
  );
  const outerArc = `M ${outer[0]} A ${radius} ${radius} 0 0 1 ${outer[1]} A ${radius} ${radius} 0 0 1 ${outer[2]}`;
  const full = Math.abs(end - start - Math.PI * 2) < 1e-10;
  if (!innerRadius)
    return full ? `${outerArc} Z` : `${outerArc} L ${pointPath(center)} Z`;
  const inner = [end, mid, start].map((angle) =>
    pointPath(polarPoint(center, innerRadius, angle)),
  );
  return `${outerArc}${full ? " Z M" : " L"} ${inner[0]} A ${innerRadius} ${innerRadius} 0 0 0 ${inner[1]} A ${innerRadius} ${innerRadius} 0 0 0 ${inner[2]} Z`;
}

export function circularGeometry(
  data: readonly GraphDatum[],
  box: GraphBox,
  fontSize: number,
  donut: boolean,
) {
  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  const radius = Math.min(
    (box.width - 64) / 2,
    (box.height - fontSize * 2) / 2,
  );
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  let angle = -Math.PI / 2;
  const sectors = data.flatMap((datum, index) => {
    if (datum.value === 0 || total === 0) return [];
    const start = angle;
    angle += (datum.value / total) * Math.PI * 2;
    const middle = datum.value === total ? 0 : (start + angle) / 2;
    const anchor = polarPoint(center, radius + 2, middle);
    return [
      {
        index,
        path: sectorPath(
          center,
          radius,
          donut ? radius * 0.56 : 0,
          start,
          angle,
        ),
        anchor,
        side: Math.cos(middle) >= 0 ? 1 : -1,
        label: { x: 0, y: 0 },
      },
    ];
  });
  for (const side of [-1, 1]) {
    const group = sectors
      .filter((sector) => sector.side === side)
      .sort((a, b) => a.anchor.y - b.anchor.y);
    group.forEach((sector, index) => {
      sector.label = {
        x: center.x + side * (radius + 18),
        y: box.y + (box.height * (index + 0.5)) / group.length,
      };
    });
  }
  return { total, radius, center, sectors };
}
