import type { ReactNode } from "react";
import { DocsOnThisPage } from "./docs-on-this-page";
import { PersistentDocsSidebar } from "./persistent-docs-sidebar";

export function DocumentationShell({
  children,
  sections,
}: {
  children: ReactNode;
  sections?: readonly { title: string; href: string }[];
}) {
  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 sm:px-6 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-6 xl:grid-cols-[14rem_minmax(0,1fr)_12rem]">
      <PersistentDocsSidebar />
      <div className="min-w-0 py-10 md:py-12">{children}</div>
      <aside className="scrollbar-hidden sticky top-16 hidden h-[calc(100svh-4rem)] overflow-y-auto py-12 pl-6 xl:block">
        <DocsOnThisPage {...(sections ? { sections } : {})} />
      </aside>
    </div>
  );
}
