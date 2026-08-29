import type { ReactNode } from "react";
import { SiteHeader } from "@/features/docs/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </div>
  );
}
