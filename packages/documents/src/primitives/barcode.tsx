import { Rect, Svg, Text, View } from "@react-pdf/renderer";
import {
  barcodeTextHeight,
  resolveBarcode,
  type BarcodeProps,
} from "./barcode-data";
import { usePdfTheme } from "./theme-context";

export { ean13CheckDigit } from "./barcode-data";
export type { BarcodeProps, BarcodeFormat } from "./barcode-data";

export function Barcode(props: BarcodeProps) {
  const theme = usePdfTheme();
  const barcode = resolveBarcode(props);
  const symbolHeight = barcode.barHeight + barcode.guardHeight + 8;
  const textHeight = barcode.showValue
    ? barcodeTextHeight(barcode.value, barcode.width, theme.typeScale.caption)
    : 0;
  return (
    <View
      wrap={false}
      style={{
        width: barcode.width,
        height: symbolHeight + textHeight,
        flexShrink: 0,
        backgroundColor: "#ffffff",
      }}
    >
      <Svg
        width={barcode.width}
        height={symbolHeight}
        viewBox={`0 0 ${barcode.width} ${symbolHeight}`}
      >
        <Rect
          x={0}
          y={0}
          width={barcode.width}
          height={symbolHeight}
          fill="#ffffff"
        />
        {barcode.bars.map((bar) => (
          <Rect
            key={bar.x}
            x={bar.x}
            y={4}
            width={bar.width}
            height={bar.height}
            fill="#000000"
          />
        ))}
      </Svg>
      {barcode.showValue ? (
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 400,
            fontSize: theme.typeScale.caption,
            color: "#000000",
            textAlign: "center",
            marginTop: 4,
          }}
        >
          {barcode.value}
        </Text>
      ) : null}
    </View>
  );
}
