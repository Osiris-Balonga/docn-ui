export const guideIndex = [
  {
    slug: "installation",
    title: "Installation",
    description:
      "Add PDF source to your existing shadcn project without changing its configuration.",
  },
  {
    slug: "local-assets",
    title: "Local assets",
    description:
      "Prepare verified fonts once, then render from your own application.",
  },
  {
    slug: "browser-and-node",
    title: "Browser and Node",
    description:
      "Render an installed business card in the browser or an invoice in Node.",
  },
  {
    slug: "themes",
    title: "PDF themes",
    description:
      "Connect your design language to explicit PDF-safe colors and fonts.",
  },
  {
    slug: "formats-and-printing",
    title: "Formats and printing",
    description:
      "Choose physical dimensions, page behavior and print settings deliberately.",
  },
  {
    slug: "data-and-locales",
    title: "Data and locales",
    description:
      "Use validated data, explicit locales and deterministic document values.",
  },
  {
    slug: "updating-source",
    title: "Updating source",
    description:
      "Review upstream changes while keeping ownership of your installed components.",
  },
  {
    slug: "limitations",
    title: "Limitations",
    description:
      "Understand font, accessibility, scanning and printing limits before shipping.",
  },
] as const;

export type GuideSlug = (typeof guideIndex)[number]["slug"];

export function findGuide(slug: string) {
  return guideIndex.find((guide) => guide.slug === slug);
}
