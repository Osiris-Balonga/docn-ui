"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/features/docs/site-footer";
import { SiteHeader } from "@/features/docs/site-header";
import { HomeVideoBackground } from "@/features/home/home-video-background";
import { cn } from "@/lib/utils";

export function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      className={cn(
        "flex min-h-svh flex-col",
        isHome && "dark relative isolate overflow-hidden",
      )}
    >
      {isHome ? <HomeVideoBackground /> : null}
      <SiteHeader overMedia={isHome} />
      <main
        id="main-content"
        tabIndex={-1}
        className={cn("flex-1 outline-none", isHome && "flex")}
      >
        {children}
      </main>
      <SiteFooter overMedia={isHome} />
    </div>
  );
}
