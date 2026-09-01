import type { Metadata } from "next";
import { TemplateCatalog } from "@/features/catalog/template-catalog";

export const metadata: Metadata = {
  title: "PDF template catalog — docn-ui",
  description:
    "Browse source-owned PDF template families built from docn-ui components.",
};

export default function TemplatesPage() {
  return <TemplateCatalog />;
}
