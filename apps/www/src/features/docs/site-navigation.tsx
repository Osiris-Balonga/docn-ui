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
import { DocsNavigationLinks } from "./docs-navigation";

const primaryNavigation = [
  { title: "Home", href: "/" },
  { title: "Docs", href: "/docs/" },
  { title: "Components", href: "/components/" },
  { title: "Template", href: "/templates/" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(href);
}

function NavigationLinks({
  ariaLabel,
  onNavigate,
}: {
  ariaLabel: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel}>
      <ul
        className={cn(
          "flex items-center",
          onNavigate && "flex-col items-stretch gap-1",
        )}
      >
        {primaryNavigation.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                {...(onNavigate ? { onClick: onNavigate } : {})}
                className={cn(
                  "flex h-10 items-center rounded-md px-3 text-sm font-medium outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "text-foreground" : "text-muted-foreground",
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

export function DesktopSiteNavigation() {
  return (
    <div className="hidden lg:block">
      <NavigationLinks ariaLabel="Primary" />
    </div>
  );
}

export function MobileSiteNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const showsDocumentation =
    pathname.startsWith("/docs") || pathname.startsWith("/components");

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              className="h-10 px-2.5"
              aria-label="Open site navigation"
            />
          }
        >
          <MenuIcon aria-hidden="true" data-icon="inline-start" />
          Menu
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(20rem,85vw)]">
          <SheetHeader className="border-b">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>
              Browse docn-ui documentation and PDF components.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 py-3">
            <NavigationLinks
              ariaLabel="Primary mobile"
              onNavigate={() => setOpen(false)}
            />
            {showsDocumentation ? (
              <div className="mt-5 border-t pt-5">
                <p className="mb-4 text-sm font-semibold">Documentation</p>
                <DocsNavigationLinks onNavigate={() => setOpen(false)} />
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
