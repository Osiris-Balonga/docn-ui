import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Source-owned PDF components for React.</p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-5">
            <li>
              <Link
                href="/docs/"
                className="flex min-h-10 items-center outline-none transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Docs
              </Link>
            </li>
            <li>
              <Link
                href="/templates/"
                className="flex min-h-10 items-center outline-none transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Template
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/Osiris-Balonga/docn-ui"
                target="_blank"
                rel="noreferrer"
                className="flex min-h-10 items-center outline-none transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
