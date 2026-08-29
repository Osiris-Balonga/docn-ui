import type { BusinessCardData } from "../schema";

export const minimalBusinessCardExampleFr = {
  name: "Élodie Mbemba",
  role: "Directrice créative",
  organization: "Atelier Nzela",
  email: "elodie@atelier-nzela.example",
  phone: "+242 06 555 01 24",
  website: "https://atelier-nzela.example",
  address: "14 avenue des Arts, Brazzaville",
} as const satisfies BusinessCardData;

export const minimalBusinessCardExampleEn = {
  name: "Amara Cole",
  role: "Design lead",
  organization: "Northline Studio",
  email: "amara@northline.example",
  phone: "+1 202 555 0146",
  website: "https://northline.example",
  address: "208 Cedar Street, Washington, DC",
} as const satisfies BusinessCardData;
