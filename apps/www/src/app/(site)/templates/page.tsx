import { TemplateCatalog } from "@/features/catalog/template-catalog";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "PDF template catalog — docn-ui",
  description:
    "Browse source-owned PDF template families built from docn-ui components.",
  path: "/templates/",
});

export default function TemplatesPage() {
  return <TemplateCatalog />;
}
