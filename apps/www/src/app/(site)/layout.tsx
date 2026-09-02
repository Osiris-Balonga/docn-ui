import type { ReactNode } from "react";
import { SiteFrame } from "./site-frame";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
