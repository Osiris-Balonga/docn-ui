export { ClassicResume, classicResumeExample } from "./resume/classic-resume";
export { PhotoReport, photoReportExample } from "./reports/photo-report";
export { StripeInvoice, stripeInvoiceExample } from "./invoices/stripe-invoice";
export {
  VerticalInvoice,
  verticalInvoiceExample,
} from "./invoices/vertical-invoice";
export {
  CorporateInvoice,
  corporateInvoiceExample,
} from "./invoices/corporate-invoice";
export {
  OrderConfirmation,
  orderConfirmationExample,
} from "./receipts/order-confirmation";
export type { TemplateDefinition, TemplateSampleAssets } from "./types";

import { stripeInvoiceDefinition } from "./invoices/stripe-invoice";
import { verticalInvoiceDefinition } from "./invoices/vertical-invoice";
import { corporateInvoiceDefinition } from "./invoices/corporate-invoice";
import { orderConfirmationDefinition } from "./receipts/order-confirmation";
import { photoReportDefinition } from "./reports/photo-report";
import { classicResumeDefinition } from "./resume/classic-resume";

export const templateDefinitions = [
  classicResumeDefinition,
  photoReportDefinition,
  stripeInvoiceDefinition,
  verticalInvoiceDefinition,
  corporateInvoiceDefinition,
  orderConfirmationDefinition,
] as const;
