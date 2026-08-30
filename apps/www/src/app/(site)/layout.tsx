import type { ReactNode } from "react";
import { SiteHeader } from "@/features/docs/site-header";
import { SiteFooter } from "@/features/docs/site-footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
