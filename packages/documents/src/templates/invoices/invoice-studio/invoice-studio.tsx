import { InvoiceDocument } from "../layout";
import { createInvoicePlan } from "../plan";
import { invoiceStudioMetadata } from "./metadata";

export function createInvoiceStudioPlan(input: unknown) {
  return createInvoicePlan(input, invoiceStudioMetadata, (props) => (
    <InvoiceDocument props={props} variant="studio" />
  ));
}
