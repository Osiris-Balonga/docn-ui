import { View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { Image, type ImageProps } from "./image";
import { Row } from "./row";
export interface PageHeaderProps {
  /** Header text or composed PDF content. */
  children: ReactNode;
  /** Optional resolved local logo with explicit dimensions. */
  logo?: Pick<ImageProps, "alt" | "resolvedSource" | "width" | "height">;
}

// DocumentFrame owns repetition and reserves space; these can also be used inline.
export function PageHeader({ children, logo }: PageHeaderProps) {
  if (!logo) return <View>{children}</View>;
  return (
    <Row gap="md" align="center">
      <Image {...logo} alt={logo.alt} />
      <View style={{ flex: 1 }}>{children}</View>
    </Row>
  );
}
