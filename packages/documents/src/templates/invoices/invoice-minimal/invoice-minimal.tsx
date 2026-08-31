import { InvoiceDocument } from "../layout";
import { createInvoicePlan } from "../plan";
import { invoiceMinimalMetadata } from "./metadata";

export function createInvoiceMinimalPlan(input: unknown) {
  return createInvoicePlan(input, invoiceMinimalMetadata, (props) => (
    <InvoiceDocument props={props} variant="minimal" />
  ));
}
