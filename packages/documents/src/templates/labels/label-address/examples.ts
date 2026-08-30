import type { LabelData } from "../schema";

export const addressLabelExample = {
  labels: [
    {
      id: "recipient-01",
      title: "Maya Kanza",
      reference: "DELIVER TO",
      lines: [
        "42 rue de la Corniche",
        "Poto-Poto",
        "Brazzaville, Republic of the Congo",
      ],
      subtitle: "FROM · Nzela Studio",
    },
  ],
  export: { mode: "individual" },
} as const satisfies LabelData;
