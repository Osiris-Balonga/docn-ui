import { Text as ReactPdfText } from "@react-pdf/renderer";
import { useFlowFrame } from "./flow-context";
import { usePdfTheme } from "./theme-context";
import { getWatermarkLayout, type WatermarkProps } from "./watermark-layout";

export type { WatermarkProps } from "./watermark-layout";

// Place directly in DocumentFrame after body content, never inside a Stack.
export function Watermark({
  text,
  placement = "center",
  opacity = 0.08,
  fontSize = 32,
  repeat = true,
}: WatermarkProps) {
  const theme = usePdfTheme();
  const { body } = useFlowFrame();
  const bounds = getWatermarkLayout(
    { text, placement, opacity, fontSize, repeat },
    body,
  );
  return (
    <ReactPdfText
      fixed
      style={{
        position: "absolute",
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        textAlign: "center",
        fontFamily: theme.fonts.heading,
        fontWeight: theme.fonts.strongWeight,
        fontSize,
        color: theme.colors.text,
        opacity,
      }}
      render={({ subPageNumber }) =>
        repeat || subPageNumber === 1 ? text : null
      }
    />
  );
}
