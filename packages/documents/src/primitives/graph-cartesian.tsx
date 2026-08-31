import { Circle, G, Line, Path, Rect } from "@react-pdf/renderer";
import { GraphText } from "./graph-text";
import type { PdfTheme } from "../themes/themes";
import { formatGraphValue, type ResolvedGraph } from "./graph-data";
import {
  cartesianGeometry,
  pointPath,
  scaleGraphValue,
  type GraphBox,
  type GraphScale,
} from "./graph-geometry";

export function CartesianGraph({
  graph,
  plot,
  scale,
  theme,
}: {
  graph: ResolvedGraph;
  plot: GraphBox;
  scale: GraphScale;
  theme: PdfTheme;
}) {
  const horizontal = graph.type === "horizontal-bar";
  const bars = graph.type === "bar" || horizontal;
  const {
    baseline,
    points,
    bars: rectangles,
  } = cartesianGeometry(graph.data, plot, scale, horizontal);
  const fontSize = theme.typeScale.caption;
  const linePath = points
    .map((point, index) => `${index ? "L" : "M"} ${pointPath(point)}`)
    .join(" ");
  const areaPath = `${linePath} L ${points.at(-1)!.x} ${baseline} L ${points[0]!.x} ${baseline} Z`;
  return (
    <G>
      {scale.ticks.map((tick) => {
        const position = horizontal
          ? scaleGraphValue(tick, scale, plot.x, plot.x + plot.width)
          : scaleGraphValue(tick, scale, plot.y + plot.height, plot.y);
        return (
          <G key={tick}>
            <Line
              x1={horizontal ? position : plot.x}
              x2={horizontal ? position : plot.x + plot.width}
              y1={horizontal ? plot.y : position}
              y2={horizontal ? plot.y + plot.height : position}
              stroke={tick === 0 ? theme.colors.text : theme.colors.border}
              strokeWidth={tick === 0 ? 0.7 : 0.35}
            />
            <GraphText
              x={horizontal ? position : plot.x - 8}
              y={
                horizontal
                  ? plot.y + plot.height + fontSize * 2
                  : position + fontSize * 0.35
              }
              textAnchor={horizontal ? "middle" : "end"}
              fill={theme.colors.mutedText}
            >
              {formatGraphValue(tick)}
            </GraphText>
          </G>
        );
      })}
      {graph.type === "area" ? (
        <Path d={areaPath} fill={theme.colors.accent} fillOpacity={0.12} />
      ) : null}
      {bars ? (
        rectangles.map((rectangle, index) => (
          <Rect
            key={graph.data[index]!.label}
            {...rectangle}
            fill={theme.colors.accent}
          />
        ))
      ) : (
        <Path
          d={linePath}
          fill="none"
          stroke={theme.colors.accent}
          strokeWidth={1.3}
        />
      )}
      {graph.data.map((datum, index) => {
        const point = points[index]!;
        return (
          <G key={datum.label}>
            {!bars ? (
              <Circle
                cx={point.x}
                cy={point.y}
                r={2.1}
                fill={theme.colors.accent}
              />
            ) : null}
            <GraphText
              x={horizontal ? plot.x - 8 : point.x}
              y={
                horizontal
                  ? point.y + fontSize * 0.35
                  : plot.y + plot.height + fontSize * 3.5
              }
              textAnchor={horizontal ? "end" : "middle"}
            >
              {datum.label}
            </GraphText>
            <GraphText
              x={horizontal ? graph.width - 8 : point.x}
              y={
                horizontal
                  ? point.y + fontSize * 0.35
                  : point.y +
                    (datum.value < 0 ? fontSize * 1.7 : -fontSize * 0.8)
              }
              textAnchor={horizontal ? "end" : "middle"}
            >
              {formatGraphValue(datum.value)}
            </GraphText>
          </G>
        );
      })}
    </G>
  );
}
