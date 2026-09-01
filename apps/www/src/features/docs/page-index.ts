export type KnownPage = {
  title: string;
  description: string;
  href: string;
  section: "Site" | "Documentation" | "Components";
};

export const knownPages: readonly KnownPage[] = [
  ...guideIndex.map((guide) => ({
    title: guide.title,
    description: guide.description,
    href: `/docs/${guide.slug}/`,
    section: "Documentation" as const,
  })),
  {
    title: "Home",
    description: "Project status and qualified PDF foundations",
    href: "/",
    section: "Site",
  },
  {
    title: "Components",
    description: "PDF layout and content primitives",
    href: "/components/",
    section: "Components",
  },
  {
    title: "Templates",
    description: "Qualified document compositions",
    href: "/templates/",
    section: "Components",
  },
  {
    title: "Documentation",
    description: "Available docn-ui guides",
    href: "/docs/",
    section: "Documentation",
  },
  {
    title: "Getting started",
    description: "Current capabilities and project boundaries",
    href: "/docs/getting-started/",
    section: "Documentation",
  },
] as const;
import { guideIndex } from "@/content/docs/guide-index";
