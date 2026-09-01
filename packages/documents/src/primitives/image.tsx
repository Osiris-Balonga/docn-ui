import { Image as ReactPdfImage, View } from "@react-pdf/renderer";
import { assertLocalImage } from "./image-validation";
import { Text } from "./typography";

export interface ImageProps {
  align?: "start" | "center" | "end";
  caption?: string;
  fit?: "contain" | "cover";
  alt: string;
  height: number;
  resolvedSource: string;
  width: number;
}

export function Image({
  alt,
  height,
  resolvedSource,
  width,
  align,
  caption,
  fit = "contain",
}: ImageProps) {
  assertLocalImage(resolvedSource, width, height);
  const image = (
    <ReactPdfImage
      src={{ uri: resolvedSource }}
      style={{ height, objectFit: fit, width }}
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
