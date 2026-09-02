import { guideIndex } from "@/content/docs/guide-index";
import { componentCatalog } from "@docn-ui/documents/catalog/components";

export const docsNavigation = [
  {
    title: "Getting Started",
    items: [
      { title: "Overview", href: "/docs/" },
      { title: "Getting started", href: "/docs/getting-started/" },
      { title: "Formats", href: "/formats/" },
      { title: "Themes", href: "/themes/" },
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
      ...componentCatalog.map(({ slug, title }) => ({
        title,
        href: `/components/${slug}/`,
      })),
    ],
  },
] as const;
