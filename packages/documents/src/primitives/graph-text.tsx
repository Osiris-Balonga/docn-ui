import { Text } from "@react-pdf/renderer";
import { usePdfTheme } from "./theme-context";

interface GraphTextProps {
  children: string;
  x: number;
  y: number;
  textAnchor?: "start" | "middle" | "end";
  fill?: string;
  size?: "caption" | "label";
  strong?: boolean;
}

// SVG text does not inherit the container's font styles in the PDF engine.
export function GraphText({
  children,
  x,
  y,
  textAnchor = "start",
  fill,
  size = "caption",
  strong = false,
}: GraphTextProps) {
  const theme = usePdfTheme();
  return (
    <Text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill={fill ?? theme.colors.text}
      style={{
        fontFamily: theme.fonts.body,
        fontSize: theme.typeScale[size],
        fontWeight: strong
          ? theme.fonts.strongWeight
          : theme.fonts.regularWeight,
      }}
    >
      {children}
    </Text>
  );
}
