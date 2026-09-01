import { View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { assertFlowBlockFits } from "./flow-layout";
import { useFlowFrame } from "./flow-context";
export interface KeepTogetherProps {
  children: ReactNode;
  measuredHeight: number;
}

export function KeepTogether({ children, measuredHeight }: KeepTogetherProps) {
  assertFlowBlockFits(measuredHeight, useFlowFrame());
  return (
    <View wrap={false} style={{ minHeight: measuredHeight }}>
      {children}
    </View>
  );
}
