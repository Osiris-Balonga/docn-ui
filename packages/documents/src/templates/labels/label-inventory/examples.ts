import type { LabelData } from "../schema";

export const inventoryLabelExample = {
  labels: [
    {
      id: "asset-2048",
      title: "Camera kit",
      reference: "AST-2048",
      lines: ["Studio B · Shelf 04", "Checked 2026-08-30"],
      qrPayload: "urn:docn:inventory:AST-2048",
    },
  ],
  export: { mode: "individual" },
} as const satisfies LabelData;
