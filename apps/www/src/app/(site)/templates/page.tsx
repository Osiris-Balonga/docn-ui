import type { Metadata } from "next";
import { TemplateCatalog } from "@/features/catalog/template-catalog";

export const metadata: Metadata = {
  title: "PDF template catalog — docn-ui",
  description:
    "Browse print-ready PDF templates, copy their install command, and inspect their complete source.",
};

export default function TemplatesPage() {
  return <TemplateCatalog />;
}
