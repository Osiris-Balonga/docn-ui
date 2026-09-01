import { Image as ReactPdfImage, View } from "@react-pdf/renderer";
import { assertLocalImage } from "./image-validation";
import { Text } from "./text";

export interface ImageProps {
  /** Horizontal placement within the surrounding PDF region. */
  align?: "start" | "center" | "end";
  /** Optional selectable caption below the image. */
  caption?: string;
  /** Preserve the full image or crop it to fill the box. */
  fit?: "contain" | "cover";
  /** Alternative text exposed to the PDF renderer. */
  alt: string;
  /** Optional corner radius in PDF points, up to half the shortest side. */
  borderRadius?: number;
  /** Explicit image-box height in PDF points. */
  height: number;
  /** Resolved permitted local data or blob source. */
  resolvedSource: string;
  /** Explicit image-box width in PDF points. */
  width: number;
}

export function Image({
  alt,
  height,
  resolvedSource,
  width,
  align,
  borderRadius,
  caption,
  fit = "contain",
}: ImageProps) {
  assertLocalImage(resolvedSource, width, height, borderRadius);
  const image = (
    <ReactPdfImage
      src={{ uri: resolvedSource }}
      style={{
        height,
        objectFit: fit,
        width,
        ...(borderRadius === undefined ? {} : { borderRadius }),
      }}
      aria-label={alt}
    />
  );
  if (align === undefined && caption === undefined) return image;
  return (
    <View
      style={{
        alignItems:
          align === "end"
            ? "flex-end"
            : align === "center"
              ? "center"
              : "flex-start",
      }}
    >
      <View style={{ width }}>
        {image}
        {caption ? (
          <Text
            size="caption"
            tone="muted"
            align={
              align === "end" ? "right" : align === "center" ? "center" : "left"
            }
          >
            {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
