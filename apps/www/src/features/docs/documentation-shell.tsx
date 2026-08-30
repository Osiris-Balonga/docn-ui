import type { ReactNode } from "react";
import { DesktopDocsNavigation } from "./docs-navigation";
import { DocsOnThisPage } from "./docs-on-this-page";

export function DocumentationShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[90rem] lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-6 lg:px-6 xl:grid-cols-[16rem_minmax(0,40rem)_13rem] xl:justify-center">
      <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] overflow-y-auto py-8 pr-6 lg:block">
        <DesktopDocsNavigation />
      </aside>
      <div className="min-w-0 px-4 py-10 sm:px-6 lg:px-0 lg:py-12">
        {children}
      </div>
      <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] overflow-y-auto py-12 pl-6 xl:block">
        <DocsOnThisPage />
      </aside>
    </div>
  );
}
