import type { BusinessCardData } from "../schema";

export const editorialBusinessCardExample = {
  name: "Noémie Kanza",
  role: "Architecte éditoriale",
  organization: "Revue Latitude",
  email: "noemie@latitude.example",
  phone: "+33 6 12 34 56 78",
  website: "https://latitude.example",
  address: "27 rue des Écoles, Paris",
} as const satisfies BusinessCardData;
