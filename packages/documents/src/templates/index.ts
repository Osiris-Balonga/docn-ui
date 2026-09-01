export { ClassicResume, classicResumeExample } from "./resume/classic-resume";
export { PhotoReport, photoReportExample } from "./reports/photo-report";
export { StripeInvoice, stripeInvoiceExample } from "./invoices/stripe-invoice";
export {
  OrderConfirmation,
  orderConfirmationExample,
} from "./receipts/order-confirmation";
export type { TemplateDefinition, TemplateSampleAssets } from "./types";

import { stripeInvoiceDefinition } from "./invoices/stripe-invoice";
import { orderConfirmationDefinition } from "./receipts/order-confirmation";
import { photoReportDefinition } from "./reports/photo-report";
import { classicResumeDefinition } from "./resume/classic-resume";

export const templateDefinitions = [
  classicResumeDefinition,
  photoReportDefinition,
  stripeInvoiceDefinition,
  orderConfirmationDefinition,
] as const;
