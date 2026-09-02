import { ThemeMenu } from "@/features/theme/theme-menu";
import { cn } from "@/lib/utils";
import { DocsSearch } from "./docs-search";
import { GitHubLink } from "./github-link";
import { DesktopSiteNavigation, MobileSiteNavigation } from "./site-navigation";

export function SiteHeader({ overMedia = false }: { overMedia?: boolean }) {
  return (
    <>
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-md transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "sticky top-0 z-40",
          overMedia ? "bg-transparent text-white" : "bg-background",
        )}
      >
        <div className="flex h-16 w-full items-center gap-2 px-4 sm:px-6">
          <MobileSiteNavigation overMedia={overMedia} />
          <DesktopSiteNavigation />
          <div className="ml-auto flex items-center gap-3">
            <DocsSearch overMedia={overMedia} />
            <GitHubLink />
            <ThemeMenu />
          </div>
        </div>
      </header>
    </>
  );
}
