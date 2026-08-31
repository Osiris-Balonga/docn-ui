import { Alert } from "../../primitives/alert";
import { Badge } from "../../primitives/badge";
import { Form } from "../../primitives/form";
import { Row } from "../../primitives/row";
import { Signature } from "../../primitives/signature";

export function AlertExample() {
  return (
    <Alert
      status="Review"
      title="Check before printing"
      description="Confirm the recipient, page size and final content before sending your document."
    />
  );
}
export function BadgeExample() {
  return (
    <Row gap="lg">
      <Badge label="Approved" />
      <Badge label="Draft" tone="outline" size="regular" />
    </Row>
  );
}
export function FormExample() {
  return (
    <Form
      groups={[
        {
          id: "contact",
          title: "Contact details",
          columns: 2,
          fields: [
            {
              id: "name",
              label: "Full name",
              value: "Élodie Mbemba",
              required: true,
            },
            { id: "reference", label: "Reference", value: "DOC-0042" },
            { id: "email", label: "Email" },
            { id: "phone", label: "Phone" },
          ],
        },
      ]}
    />
  );
}
export function SignatureExample() {
  return (
    <Signature
      signers={[
        { label: "Prepared by", name: "Alex Morgan", role: "Project lead" },
        {
          label: "Approved by",
          name: "Élodie Mbemba",
          role: "Creative director",
        },
      ]}
      space={42}
    />
  );
}
