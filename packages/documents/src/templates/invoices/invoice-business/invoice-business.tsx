import { InvoiceDocument } from "../layout";
import { createInvoicePlan } from "../plan";
import { invoiceBusinessMetadata } from "./metadata";

export function createInvoiceBusinessPlan(input: unknown) {
  return createInvoicePlan(input, invoiceBusinessMetadata, (props) => (
    <InvoiceDocument props={props} variant="business" />
  ));
}
