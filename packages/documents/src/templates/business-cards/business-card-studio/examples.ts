import type { BusinessCardData } from "../schema";

export const studioBusinessCardExample = {
  name: "Malik Turner",
  role: "Type designer",
  organization: "Common Form Studio",
  email: "malik@common-form.example",
  phone: "+44 20 7946 0138",
  website: "https://common-form.example",
  qrPayload: "https://common-form.example/malik",
} as const satisfies BusinessCardData;
