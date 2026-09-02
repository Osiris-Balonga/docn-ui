"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pageSections: Record<string, readonly { title: string; href: string }[]> =
  {
    "/docs/": [{ title: "Available guides", href: "#available-guides" }],
    "/docs/getting-started/": [
      { title: "What is ready", href: "#ready-foundations" },
      {
        title: "Development registry",
        href: "#development-installation",
      },
    ],
    "/components/": [{ title: "All Components", href: "#all-components" }],
  };

export function DocsOnThisPage({
  sections: providedSections,
}: {
  sections?: readonly { title: string; href: string }[];
}) {
  const pathname = usePathname();
  const sections =
    providedSections ?? pageSections[`${pathname.replace(/\/$/, "")}/`] ?? [];

  if (sections.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <p className="mb-3 text-sm font-medium">On This Page</p>
      <ul className="space-y-2.5">
        {sections.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="block text-sm leading-5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {section.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
