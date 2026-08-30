import type { ReactNode } from "react";
import { DocumentationShell } from "@/features/docs/documentation-shell";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocumentationShell>{children}</DocumentationShell>;
}
