import { Rect, Svg } from "@react-pdf/renderer";
import { createPrintableQrGeometry } from "./qr-code";

export interface QRCodeProps {
  /** Opaque background painted through the protected quiet zone. */
  backgroundColor?: string;
  /** High-contrast module color. */
  color?: string;
  /** Smallest permitted module width in PDF points. */
  minimumModuleSize?: number;
  /** Validated text encoded in the symbol. */
  payload: string;
  /** Total square size in PDF points, including the quiet zone. */
  size: number;
}

export function QRCode({
  backgroundColor = "#ffffff",
  color = "#111111",
  minimumModuleSize = 1,
  payload,
  size,
}: QRCodeProps) {
  const { code, matrixSize, quietZone, totalModules } =
    createPrintableQrGeometry(payload, size, minimumModuleSize);
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${totalModules} ${totalModules}`}
    >
      <Rect width={totalModules} height={totalModules} fill={backgroundColor} />
      {Array.from({ length: matrixSize }, (_, row) =>
        Array.from({ length: matrixSize }, (_, column) =>
          code.modules.get(row, column) ? (
            <Rect
              key={`${row}-${column}`}
              x={column + quietZone}
              y={row + quietZone}
              width={1}
              height={1}
              fill={color}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}
