import { DocumentValidationError } from "../core/errors";

export type GraphType =
  "bar" | "horizontal-bar" | "line" | "area" | "pie" | "donut";
export interface GraphDatum {
  label: string;
  value: number;
}
export interface GraphProps {
  type: GraphType;
  title: string;
  seriesLabel: string;
  data: readonly GraphDatum[];
  width?: number;
  height?: number;
}
export type ResolvedGraph = Required<GraphProps>;

export function graphError(
  message: string,
  path: string,
  code: "INVALID_DATA" | "LAYOUT_OVERFLOW" = "INVALID_DATA",
): never {
  throw new DocumentValidationError([{ code, message, path: ["graph", path] }]);
}

function label(value: string, path: string, maximum: number) {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > maximum ||
    value.includes("\u00ad") ||
    !/^[\u0020-\u007e\u00a0-\u024f]+$/.test(value)
  )
    graphError(`Expected 1–${maximum} printable Latin characters.`, path);
}

export function isCircularGraph(type: GraphType) {
  return type === "pie" || type === "donut";
}

export function resolveGraph({
  width = 250,
  height = 215,
  ...input
}: GraphProps): ResolvedGraph {
  if (
    !["bar", "horizontal-bar", "line", "area", "pie", "donut"].includes(
      input.type,
    )
  )
    graphError("Unsupported graph type.", "type");
  label(input.title, "title", 64);
  label(input.seriesLabel, "seriesLabel", 32);
  if (
    !Number.isFinite(width) ||
    width < 160 ||
    width > 540 ||
    !Number.isFinite(height) ||
    height < 160 ||
    height > 700
  )
    graphError("Graph dimensions must be 160–540 by 160–700 points.", "size");
  const circular = isCircularGraph(input.type);
  const maximum = circular ? 8 : 12;
  if (!Array.isArray(input.data) || input.data.length > maximum)
    graphError(`Expected at most ${maximum} graph entries.`, "data");
  const labels = new Set<string>();
  for (const datum of input.data) {
    if (!datum || typeof datum !== "object")
      graphError("Expected a labeled numeric entry.", "data");
    label(datum.label, "data.label", 32);
    if (labels.has(datum.label))
      graphError("Graph labels must be unique.", "data.label");
    labels.add(datum.label);
    const magnitude =
      typeof datum.value === "number" ? Math.abs(datum.value) : NaN;
    if (
      typeof datum.value !== "number" ||
      !Number.isFinite(datum.value) ||
      magnitude > 1e9 ||
      (magnitude !== 0 && magnitude < 1e-6)
    )
      graphError(
        "Values must be finite, bounded to 1 billion, and zero or at least 0.000001 in magnitude.",
        "data.value",
      );
    if (circular && datum.value < 0)
      graphError("Pie and donut values cannot be negative.", "data.value");
  }
  return { ...input, width, height };
}

export function formatGraphValue(value: number): string {
  return String(Number(value.toPrecision(6)));
}

export function circularLegend(
  datum: GraphDatum,
  index: number,
  total: number,
): string {
  const share = total ? ((datum.value / total) * 100).toFixed(1) : "0.0";
  return `${index + 1}. ${datum.label}: ${formatGraphValue(datum.value)} (${share}%)`;
}
