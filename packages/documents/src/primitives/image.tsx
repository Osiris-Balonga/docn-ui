import { Image as ReactPdfImage } from "@react-pdf/renderer";

export interface ImageProps {
  alt: string;
  height: number;
  resolvedSource: string;
  width: number;
}

export function Image({ alt, height, resolvedSource, width }: ImageProps) {
  return (
    <ReactPdfImage
      src={{ uri: resolvedSource }}
      style={{ height, objectFit: "contain", width }}
      aria-label={alt}
    />
  );
}
