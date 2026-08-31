import { View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { Image, type ImageProps } from "./image";
import { Row } from "./layout";
import { PageNumber, type PageNumberProps } from "./pagination";

export interface PageHeaderProps {
  children: ReactNode;
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

export interface PageFooterProps {
  children?: ReactNode;
  pageNumber?: false | PageNumberProps;
}

export function PageFooter({ children, pageNumber = {} }: PageFooterProps) {
  return (
    <Row gap="md" align="center" justify="between">
      <View style={{ flex: 1 }}>{children}</View>
      {pageNumber === false ? null : (
        <View style={{ flex: 1 }}>
          <PageNumber {...pageNumber} />
        </View>
      )}
    </Row>
  );
}
