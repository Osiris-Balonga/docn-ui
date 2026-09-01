import { Line, Svg, View } from "@react-pdf/renderer";
import { GraphText } from "./graph-text";
import { CartesianGraph } from "./graph-cartesian";
import { isCircularGraph, resolveGraph, type GraphProps } from "./graph-data";
import { createGraphLayout } from "./graph-layout";
import { RadialGraph } from "./graph-radial";
import { usePdfTheme } from "./theme-context";

export type { GraphProps, GraphDatum, GraphType } from "./graph-data";

export function Graph(props: GraphProps) {
  const theme = usePdfTheme();
  const graph = resolveGraph(props);
  const { plot, scale, legendRows, legendTop, legendLine } = createGraphLayout(
    graph,
    theme.typeScale.caption,
    theme.typeScale.label,
  );
  const circular = isCircularGraph(graph.type);
  return (
    <View wrap={false} style={{ width: graph.width, height: graph.height }}>
      <Svg
        width={graph.width}
        height={graph.height}
        viewBox={`0 0 ${graph.width} ${graph.height}`}
        fill={theme.colors.text}
      >
        <GraphText x={8} y={8 + theme.typeScale.label} size="label" strong>
          {graph.title}
        </GraphText>
        {graph.data.length === 0 ? (
          <GraphText
            x={graph.width / 2}
            y={plot.y + plot.height / 2}
            textAnchor="middle"
            fill={theme.colors.mutedText}
          >
            No data
          </GraphText>
        ) : circular ? (
          <RadialGraph graph={graph} plot={plot} theme={theme} />
        ) : (
          <CartesianGraph
            graph={graph}
            plot={plot}
            scale={scale}
            theme={theme}
          />
        )}
        {!circular ? (
          <Line
            x1={8}
            x2={20}
            y1={legendTop + theme.typeScale.caption * 0.6}
            y2={legendTop + theme.typeScale.caption * 0.6}
            stroke={theme.colors.accent}
            strokeWidth={1.5}
          />
        ) : null}
        <GraphText
          x={circular ? 8 : 26}
          y={legendTop + theme.typeScale.caption}
          fill={theme.colors.mutedText}
        >
          {graph.seriesLabel}
        </GraphText>
        {legendRows.map((row, index) => (
          <GraphText
            key={row}
            x={8}
            y={legendTop + (index + 1) * legendLine + theme.typeScale.caption}
          >
            {row}
          </GraphText>
        ))}
      </Svg>
    </View>
  );
}
