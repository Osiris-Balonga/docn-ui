export type KnownPage = {
  title: string;
  description: string;
  href: string;
  section: "Site" | "Documentation";
};

export const knownPages: readonly KnownPage[] = [
  {
    title: "Home",
    description: "Project status and qualified PDF foundations",
    href: "/",
    section: "Site",
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
