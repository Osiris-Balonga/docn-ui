import { ThemeMenu } from "@/features/theme/theme-menu";
import { DocsSearch } from "./docs-search";
import { DesktopSiteNavigation, MobileSiteNavigation } from "./site-navigation";

export function SiteHeader() {
  return (
    <>
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-md transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 bg-background/95 supports-backdrop-filter:backdrop-blur-sm">
        <div className="flex h-16 w-full items-center gap-2 px-4 sm:px-6">
          <MobileSiteNavigation />
          <DesktopSiteNavigation />
          <div className="ml-auto flex items-center gap-1.5">
            <DocsSearch />
            <ThemeMenu />
          </div>
        </div>
      </header>
    </>
  );
}
