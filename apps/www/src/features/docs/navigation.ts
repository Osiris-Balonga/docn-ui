import { guideIndex } from "@/content/docs/guide-index";

export const docsNavigation = [
  {
    title: "Getting Started",
    items: [
      { title: "Overview", href: "/docs/" },
      { title: "Getting started", href: "/docs/getting-started/" },
    ],
  },
  {
    title: "Guides",
    items: guideIndex.map((guide) => ({
      title: guide.title,
      href: `/docs/${guide.slug}/`,
    })),
  },
  {
    title: "Components",
    items: [
      { title: "Overview", href: "/components/" },
      { title: "Templates", href: "/templates/" },
    ],
  },
] as const;
