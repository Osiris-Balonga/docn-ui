import type { ReactNode } from "react";
import {
  DesktopDocsNavigation,
  MobileDocsNavigation,
} from "@/features/docs/docs-navigation";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:px-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-12">
      <MobileDocsNavigation />
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] border-r py-8 pr-6 md:block">
        <DesktopDocsNavigation />
      </aside>
      <div className="min-w-0 px-5 py-10 sm:px-8 md:px-10 md:py-12 lg:px-14">
        {children}
      </div>
    </div>
  );
}
