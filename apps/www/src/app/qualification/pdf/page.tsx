import type { Metadata } from "next";
import { QualificationViewer } from "@/features/pdf-qualification/qualification-viewer";

export const metadata: Metadata = {
  title: "PDF pipeline qualification — docn-ui",
  robots: { index: false, follow: false },
};

export default function PdfQualificationPage() {
  return <QualificationViewer />;
}
