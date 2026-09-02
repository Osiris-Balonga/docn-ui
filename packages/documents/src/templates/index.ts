export { ClassicResume, classicResumeExample } from "./resume/classic-resume";
export {
  AccountantResume,
  accountantResumeExample,
} from "./resume/accountant-resume";
export {
  DesignerResume,
  designerResumeExample,
} from "./resume/designer-resume";
export {
  SpaciousInvoice,
  spaciousInvoiceExample,
} from "./invoices/spacious-invoice";
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
export {
  ProductBarcodeReceipt,
  productBarcodeReceiptExample,
} from "./receipts/product-barcode-receipt";
export {
  CashRegisterReceipt,
  cashRegisterReceiptExample,
} from "./receipts/cash-register-receipt";
export { ProductAnalyticsReport } from "./reports/product-analytics-report";
export { MarketplaceRevenueReport } from "./reports/marketplace-revenue-report";
export { CustomerSupportReport } from "./reports/customer-support-report";
export { ProfileLanyardBadge } from "./badges/profile-lanyard-badge";
export { QrPortraitLightBadge } from "./badges/qr-portrait-light-badge";
export { QrPortraitBlueBadge } from "./badges/qr-portrait-blue-badge";
export { CoralQrBusinessCard } from "./business-cards/coral-qr-business-card";
export { VioletFounderBusinessCard } from "./business-cards/violet-founder-business-card";
export { PhotoHeaderInvoice } from "./invoices/photo-header-invoice";
export type { TemplateDefinition, TemplateSampleAssets } from "./types";
export {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleDefinition,
  type TemplateStyleOverrides,
} from "./style-policy";

import { spaciousInvoiceDefinition } from "./invoices/spacious-invoice";
import { photoHeaderInvoiceDefinition } from "./invoices/photo-header-invoice";
import { verticalInvoiceDefinition } from "./invoices/vertical-invoice";
import { corporateInvoiceDefinition } from "./invoices/corporate-invoice";
import { orderConfirmationDefinition } from "./receipts/order-confirmation";
import { productBarcodeReceiptDefinition } from "./receipts/product-barcode-receipt";
import { cashRegisterReceiptDefinition } from "./receipts/cash-register-receipt";
import { productAnalyticsReportDefinition } from "./reports/product-analytics-report";
import { marketplaceRevenueReportDefinition } from "./reports/marketplace-revenue-report";
import { customerSupportReportDefinition } from "./reports/customer-support-report";
import { profileLanyardBadgeDefinition } from "./badges/profile-lanyard-badge";
import { qrPortraitLightBadgeDefinition } from "./badges/qr-portrait-light-badge";
import { qrPortraitBlueBadgeDefinition } from "./badges/qr-portrait-blue-badge";
import { coralQrBusinessCardDefinition } from "./business-cards/coral-qr-business-card";
import { violetFounderBusinessCardDefinition } from "./business-cards/violet-founder-business-card";
import { classicResumeDefinition } from "./resume/classic-resume";
import { accountantResumeDefinition } from "./resume/accountant-resume";
import { designerResumeDefinition } from "./resume/designer-resume";

export const templateDefinitions = [
  classicResumeDefinition,
  accountantResumeDefinition,
  designerResumeDefinition,
  spaciousInvoiceDefinition,
  verticalInvoiceDefinition,
  corporateInvoiceDefinition,
  photoHeaderInvoiceDefinition,
  orderConfirmationDefinition,
  productBarcodeReceiptDefinition,
  cashRegisterReceiptDefinition,
  productAnalyticsReportDefinition,
  marketplaceRevenueReportDefinition,
  customerSupportReportDefinition,
  profileLanyardBadgeDefinition,
  qrPortraitLightBadgeDefinition,
  qrPortraitBlueBadgeDefinition,
  coralQrBusinessCardDefinition,
  violetFounderBusinessCardDefinition,
] as const;
