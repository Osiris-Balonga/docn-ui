import { View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { Row } from "./row";
import { PageNumber, type PageNumberProps } from "./page-number";
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
