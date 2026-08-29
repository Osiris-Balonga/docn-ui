import Link from "next/link";
import { GitForkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeMenu } from "@/features/theme/theme-menu";

export function SiteHeader() {
  return (
    <>
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-md transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-background/95 supports-backdrop-filter:backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            aria-label="docn-ui home"
            className="shrink-0 font-semibold tracking-tight outline-none focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            docn-ui
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1">
            <Link
              href="/docs/"
              className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Docs
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Button
              nativeButton={false}
              render={
                <a
                  href="https://github.com/Osiris-Balonga/docn-ui"
                  aria-label="docn-ui on GitHub"
                />
              }
              variant="ghost"
              size="icon"
            >
              <GitForkIcon aria-hidden="true" />
            </Button>
            <ThemeMenu />
          </div>
        </div>
      </header>
    </>
  );
}
