import { Suspense } from "react";
import type { Metadata } from "next";
import { TemplateCatalog } from "@/features/catalog/template-catalog";

export const metadata: Metadata = {
  title: "PDF template catalog — docn-ui",
  description:
    "Search real PDF compositions by family and physical format, then customize and export them locally.",
};

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto min-h-[32rem] max-w-7xl px-5 py-16" />}
    >
      <TemplateCatalog />
    </Suspense>
  );
}
