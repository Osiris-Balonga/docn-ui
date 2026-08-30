import type { ReactNode } from "react";
import {
  DesktopDocsNavigation,
  MobileDocsNavigation,
} from "@/features/docs/docs-navigation";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[90rem] md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:px-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-8">
      <MobileDocsNavigation />
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] overflow-y-auto py-6 pr-8 md:block">
        <DesktopDocsNavigation />
      </aside>
      <div className="min-w-0 px-4 py-10 sm:px-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[48rem]">{children}</div>
      </div>
    </div>
  );
}
