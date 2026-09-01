import { Alert } from "../../primitives/alert";
import { Badge } from "../../primitives/badge";
import { Form } from "../../primitives/form";
import { Row } from "../../primitives/row";
import { Signature } from "../../primitives/signature";
import { Stack } from "../../primitives/stack";

export function AlertExample() {
  return (
    <Stack gap="xl">
      <AlertNoteExample />
      <AlertReviewExample />
      <AlertWarningExample />
    </Stack>
  );
}
export function AlertNoteExample() {
  return (
    <Alert
      title="Local rendering"
      description="Document data remains in the browser during preview."
    />
  );
}
export function AlertReviewExample() {
  return (
    <Alert
      status="Review"
      title="Check before printing"
      description="Confirm the recipient, page size and final content."
    />
  );
}
export function AlertWarningExample() {
  return <Alert status="Warning" title="Print at actual size" />;
}
export function BadgeExample() {
  return (
    <Stack gap="lg">
      <BadgeCompactExample />
      <BadgeRegularExample />
    </Stack>
  );
}
export function BadgeCompactExample() {
  return (
    <Row gap="lg">
      <Badge label="Approved" />
      <Badge label="Pending" tone="outline" />
    </Row>
  );
}
export function BadgeRegularExample() {
  return (
    <Row gap="lg">
      <Badge label="Paid" size="regular" />
      <Badge label="Draft" tone="outline" size="regular" />
    </Row>
  );
}
export function FormExample() {
  return (
    <Form
      groups={[
        {
          id: "identity",
          title: "Identity",
          columns: 1,
          fields: [
            {
              id: "name",
              label: "Full name",
              value: "Élodie Mbemba",
              required: true,
            },
          ],
        },
        {
          id: "contact",
          title: "Contact details — two columns",
          columns: 2,
          fields: [
            { id: "email", label: "Email" },
            { id: "phone", label: "Phone" },
          ],
        },
        {
          id: "delivery",
          title: "Delivery — three columns",
          columns: 3,
          fields: [
            { id: "date", label: "Date", value: "22 January 2026" },
            { id: "method", label: "Method", value: "Courier" },
            { id: "reference", label: "Reference", value: "DOC-0042" },
          ],
        },
      ]}
    />
  );
}
export function FormSingleColumnExample() {
  return (
    <Form
      groups={[
        {
          id: "contact",
          title: "Contact",
          columns: 1,
          fields: [
            {
              id: "name",
              label: "Full name",
              value: "Élodie Mbemba",
              required: true,
            },
            { id: "email", label: "Email" },
          ],
        },
      ]}
    />
  );
}
export function FormMultiColumnExample() {
  return (
    <Form
      groups={[
        {
          id: "delivery",
          title: "Delivery",
          columns: 3,
          fields: [
            { id: "date", label: "Date", value: "22 January 2026" },
            { id: "method", label: "Method", value: "Courier" },
            { id: "reference", label: "Reference", value: "DOC-0042" },
          ],
        },
      ]}
    />
  );
}
export function SignatureExample() {
  return (
    <Stack gap="xl">
      <SignatureSingleExample />
      <SignaturePairedExample />
    </Stack>
  );
}
export function SignatureSingleExample() {
  return (
    <Signature
      signers={[
        { label: "Customer signature", date: "Date: ____ / ____ / ______" },
      ]}
      space={34}
    />
  );
}
export function SignatureInlineExample() {
  return (
    <Signature
      layout="inline"
      signers={[
        {
          label: "Approved by",
          name: "Élodie Mbemba",
          role: "Creative director",
          date: "15 January 2026",
        },
      ]}
      space={42}
    />
  );
}
export function SignaturePairedExample() {
  return (
    <Signature
      signers={[
        { label: "Prepared by", name: "Alex Morgan", role: "Project lead" },
        {
          label: "Approved by",
          name: "Élodie Mbemba",
          role: "Creative director",
          date: "15 January 2026",
        },
      ]}
      space={42}
    />
  );
}
