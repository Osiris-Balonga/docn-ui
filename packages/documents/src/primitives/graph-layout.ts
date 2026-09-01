import {
  circularLegend,
  formatGraphValue,
  graphError,
  isCircularGraph,
  type ResolvedGraph,
} from "./graph-data";
import { createGraphScale, type GraphBox } from "./graph-geometry";

// Conservative envelope for the qualified Latin fonts; no truncation or font shrinking.
export function graphTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 1.5;
}
function fits(text: string, fontSize: number, width: number) {
  if (graphTextWidth(text, fontSize) > width)
    graphError(
      "The graph is too dense for its labels. Increase the box or shorten explicit labels.",
      "labels",
      "LAYOUT_OVERFLOW",
    );
}

export function createGraphLayout(
  graph: ResolvedGraph,
  fontSize: number,
  titleSize: number,
) {
  const { width, height, data, type } = graph;
  fits(graph.title, titleSize, width - 16);
  fits(graph.seriesLabel, fontSize, width - 32);
  const titleBottom = 8 + titleSize * 1.6;
  const legendLine = fontSize * 1.8;
  const circular = isCircularGraph(type);
  const total = data.reduce((sum, datum) => sum + datum.value, 0);
  const legendRows = circular
    ? data.map((datum, index) => circularLegend(datum, index, total))
    : [];
  for (const row of legendRows) fits(row, fontSize, width - 16);
  const legendTop = height - 8 - (legendRows.length + 1) * legendLine;
  const scale = createGraphScale(data);
  let plot: GraphBox;
  if (circular) {
    plot = {
      x: 8,
      y: titleBottom + 4,
      width: width - 16,
      height: legendTop - titleBottom - 12,
    };
    if (
      plot.width < 120 ||
      plot.height < Math.max(64, data.length * fontSize * 1.8)
    )
      graphError(
        "The circular graph needs more space above its legend.",
        "size",
        "LAYOUT_OVERFLOW",
      );
    const radius = Math.min(
      (plot.width - 64) / 2,
      (plot.height - fontSize * 2) / 2,
    );
    if (
      data.some(
        (datum) =>
          datum.value > 0 && (datum.value / total) * 2 * Math.PI * radius < 2,
      )
    )
      graphError(
        "A positive sector is too small to print. Aggregate explicitly or use a bar chart.",
        "data",
        "LAYOUT_OVERFLOW",
      );
  } else {
    const maxTickWidth = Math.max(
      ...scale.ticks.map((value) =>
        graphTextWidth(formatGraphValue(value), fontSize),
      ),
    );
    const maxLabelWidth = Math.max(
      0,
      ...data.map((datum) => graphTextWidth(datum.label, fontSize)),
    );
    const maxValueWidth = Math.max(
      0,
      ...data.map((datum) =>
        graphTextWidth(formatGraphValue(datum.value), fontSize),
      ),
    );
    const horizontal = type === "horizontal-bar";
    const left =
      16 +
      (horizontal ? Math.max(maxLabelWidth, maxTickWidth / 2) : maxTickWidth);
    const right =
      8 + (horizontal ? Math.max(maxValueWidth + 8, maxTickWidth / 2) : 0);
    plot = {
      x: left,
      y: titleBottom + fontSize * 2,
      width: width - left - right,
      height: legendTop - titleBottom - fontSize * 6,
    };
    if (plot.width < 64 || plot.height < fontSize * 6)
      graphError(
        "The graph needs a larger plot rectangle.",
        "size",
        "LAYOUT_OVERFLOW",
      );
    if (horizontal) {
      if (
        plot.height / Math.max(1, data.length) < fontSize * 2 ||
        plot.width / (scale.ticks.length - 1) < maxTickWidth + 4
      )
        graphError(
          "The horizontal graph has insufficient row/tick spacing.",
          "labels",
          "LAYOUT_OVERFLOW",
        );
    } else if (
      plot.width / Math.max(1, data.length) <
      Math.max(maxLabelWidth, maxValueWidth) + 6
    )
      graphError(
        "The graph categories or values would overlap.",
        "labels",
        "LAYOUT_OVERFLOW",
      );
  }
  if (!data.length) fits("No data", fontSize, plot.width);
  else if (circular && total === 0)
    fits("No positive values", fontSize, plot.width);
  return { plot, scale, legendRows, legendTop, legendLine };
}
