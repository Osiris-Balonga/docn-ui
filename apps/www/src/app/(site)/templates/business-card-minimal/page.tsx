import type { Metadata } from "next";
import { BusinessCardPlayground } from "@/features/playground/business-card-playground";

export const metadata: Metadata = {
  title: "Minimal business card — docn-ui",
  description:
    "Edit a two-sided business card and download the exact locally generated PDF.",
};

export default function MinimalBusinessCardPage() {
  return <BusinessCardPlayground />;
}
