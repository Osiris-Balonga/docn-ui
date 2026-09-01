import { G, Path } from "@react-pdf/renderer";
import { GraphText } from "./graph-text";
import type { PdfTheme } from "../themes/themes";
import type { ResolvedGraph } from "./graph-data";
import { circularGeometry, pointPath, type GraphBox } from "./graph-geometry";

export function RadialGraph({
  graph,
  plot,
  theme,
}: {
  graph: ResolvedGraph;
  plot: GraphBox;
  theme: PdfTheme;
}) {
  const { sectors, radius, center, total } = circularGeometry(
    graph.data,
    plot,
    theme.typeScale.caption,
    graph.type === "donut",
  );
  if (!total)
    return (
      <GraphText
        x={center.x}
        y={center.y}
        textAnchor="middle"
        fill={theme.colors.mutedText}
      >
        No positive values
      </GraphText>
    );
  return (
    <G>
      {sectors.map((sector) => (
        <G key={sector.index}>
          <Path
            d={sector.path}
            fill={
              graph.colors[sector.index % graph.colors.length] ??
              theme.colors.text
            }
            fillOpacity={
              graph.colors.length
                ? 1
                : 1 - (sector.index / Math.max(1, graph.data.length - 1)) * 0.7
            }
            stroke={theme.colors.surface}
            strokeWidth={0.8}
          />
          {graph.showDataLabels ? (
            <>
              <Path
                d={`M ${pointPath(sector.anchor)} L ${center.x + sector.side * (radius + 5)} ${sector.anchor.y} L ${sector.label.x - sector.side * 3} ${sector.label.y}`}
                fill="none"
                stroke={theme.colors.mutedText}
                strokeWidth={0.5}
              />
              <GraphText
                x={sector.label.x}
                y={sector.label.y + theme.typeScale.caption * 0.35}
                textAnchor={sector.side === 1 ? "start" : "end"}
              >
                {String(sector.index + 1)}
              </GraphText>
            </>
          ) : null}
        </G>
      ))}
    </G>
  );
}
