"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { docsNavigation } from "./navigation";

export function DocsNavigationLinks({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation">
      <div className="space-y-7">
        {docsNavigation.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-2 text-sm font-semibold">{group.title}</p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || `${pathname}/` === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      {...(onNavigate ? { onClick: onNavigate } : {})}
                      className={cn(
                        "flex min-h-10 items-center rounded-md px-2 text-sm outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                        active
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function DesktopDocsNavigation() {
  return <DocsNavigationLinks />;
}
