import { createContext, useContext } from "react";
import type { FlowFrame } from "./flow-layout";

export const FlowFrameContext = createContext<FlowFrame | null>(null);

export function useFlowFrame(): FlowFrame {
  const frame = useContext(FlowFrameContext);
  if (!frame) throw new Error("Flow components require DocumentFrame.");
  return frame;
}
