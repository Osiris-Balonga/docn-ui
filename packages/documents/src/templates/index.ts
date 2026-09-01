export { ClassicResume, classicResumeExample } from "./resume/classic-resume";
export {
  AccountantResume,
  accountantResumeExample,
} from "./resume/accountant-resume";
export {
  DesignerResume,
  designerResumeExample,
} from "./resume/designer-resume";
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
export {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleDefinition,
  type TemplateStyleOverrides,
} from "./style-policy";

import { stripeInvoiceDefinition } from "./invoices/stripe-invoice";
import { verticalInvoiceDefinition } from "./invoices/vertical-invoice";
import { corporateInvoiceDefinition } from "./invoices/corporate-invoice";
import { orderConfirmationDefinition } from "./receipts/order-confirmation";
import { classicResumeDefinition } from "./resume/classic-resume";
import { accountantResumeDefinition } from "./resume/accountant-resume";
import { designerResumeDefinition } from "./resume/designer-resume";

export const templateDefinitions = [
  classicResumeDefinition,
  accountantResumeDefinition,
  designerResumeDefinition,
  stripeInvoiceDefinition,
  verticalInvoiceDefinition,
  corporateInvoiceDefinition,
  orderConfirmationDefinition,
] as const;
