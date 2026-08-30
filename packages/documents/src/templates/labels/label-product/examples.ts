import type { LabelData } from "../schema";

export const productLabelExample = {
  labels: [
    {
      id: "notebook-01",
      title: "Studio Notebook",
      subtitle: "Made in Brazzaville",
      reference: "REF NB-A5-042",
      lines: ["A5 · 160 pages", "Recycled paper"],
      qrPayload: "https://example.com/products/notebook-01",
    },
  ],
  export: { mode: "individual" },
} as const satisfies LabelData;
