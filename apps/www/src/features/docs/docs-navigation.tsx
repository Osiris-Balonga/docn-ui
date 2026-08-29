"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { docsNavigation } from "./navigation";

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation">
      <p className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Documentation
      </p>
      <ul className="space-y-1">
        {docsNavigation.map((item) => {
          const active = pathname === item.href || `${pathname}/` === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                {...(onNavigate ? { onClick: onNavigate } : {})}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function DesktopDocsNavigation() {
  return <NavigationLinks />;
}

export function MobileDocsNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b px-5 py-3 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              aria-label="Open documentation menu"
            />
          }
        >
          <MenuIcon aria-hidden="true" data-icon="inline-start" />
          Menu
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(20rem,85vw)]">
          <SheetHeader className="border-b">
            <SheetTitle>Documentation</SheetTitle>
            <SheetDescription>
              Browse the available docn-ui guides.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 py-2">
            <NavigationLinks onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
