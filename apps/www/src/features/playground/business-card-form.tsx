import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  businessCardDataSchema,
  type BusinessCardData,
} from "@docn-ui/documents/templates/business-cards/schema";

export type BusinessCardDraftField =
  | "address"
  | "email"
  | "name"
  | "organization"
  | "phone"
  | "qrPayload"
  | "role"
  | "website";

export type BusinessCardDraft = Record<BusinessCardDraftField, string>;
export type BusinessCardErrors = Partial<
  Record<BusinessCardDraftField, string>
>;

const inputFields: ReadonlyArray<{
  autoComplete: string;
  field: Exclude<BusinessCardDraftField, "address" | "qrPayload">;
  label: string;
  optional?: boolean;
  type?: "email" | "tel" | "text" | "url";
}> = [
  { autoComplete: "name", field: "name", label: "Name" },
  {
    autoComplete: "organization-title",
    field: "role",
    label: "Role",
    optional: true,
  },
  {
    autoComplete: "organization",
    field: "organization",
    label: "Organization",
    optional: true,
  },
  {
    autoComplete: "email",
    field: "email",
    label: "Email",
    optional: true,
    type: "email",
  },
  {
    autoComplete: "tel",
    field: "phone",
    label: "Phone",
    optional: true,
    type: "tel",
  },
  {
    autoComplete: "url",
    field: "website",
    label: "Website",
    optional: true,
    type: "url",
  },
];

export function toBusinessCardDraft(data: BusinessCardData): BusinessCardDraft {
  return {
    address: data.address ?? "",
    email: data.email ?? "",
    name: data.name,
    organization: data.organization ?? "",
    phone: data.phone ?? "",
    qrPayload: data.qrPayload ?? "",
    role: data.role ?? "",
    website: data.website ?? "",
  };
}

export function validateBusinessCardDraft(draft: BusinessCardDraft): {
  data?: BusinessCardData;
  errors: BusinessCardErrors;
} {
  const parsed = businessCardDataSchema.safeParse(draft);
  if (parsed.success) {
    const data = Object.fromEntries(
      Object.entries(parsed.data).filter(([, value]) => value !== undefined),
    ) as BusinessCardData;
    return { data, errors: {} };
  }
  const errors: BusinessCardErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (
      typeof field === "string" &&
      field in draft &&
      !errors[field as BusinessCardDraftField]
    )
      errors[field as BusinessCardDraftField] = issue.message;
  }
  return { errors };
}

export function BusinessCardForm({
  draft,
  errors,
  onChange,
}: {
  draft: BusinessCardDraft;
  errors: BusinessCardErrors;
  onChange: (field: BusinessCardDraftField, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {inputFields.map(({ autoComplete, field, label, optional, type }) => {
        const error = errors[field];
        return (
          <div key={field} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`card-${field}`}>{label}</Label>
              {optional ? (
                <span className="text-xs text-muted-foreground">Optional</span>
              ) : null}
            </div>
            <Input
              id={`card-${field}`}
              autoComplete={autoComplete}
              type={type ?? "text"}
              value={draft[field]}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `card-${field}-error` : undefined}
              onChange={(event) => onChange(field, event.target.value)}
            />
            {error ? (
              <p
                id={`card-${field}-error`}
                className="text-xs leading-5 text-destructive"
              >
                {error}
              </p>
            ) : null}
          </div>
        );
      })}
      <TextField
        field="address"
        label="Address"
        rows={3}
        autoComplete="street-address"
        draft={draft}
        errors={errors}
        onChange={onChange}
      />
      <TextField
        field="qrPayload"
        label="QR payload"
        rows={2}
        draft={draft}
        errors={errors}
        onChange={onChange}
      />
    </div>
  );
}

function TextField({
  autoComplete,
  draft,
  errors,
  field,
  label,
  onChange,
  rows,
}: {
  autoComplete?: string;
  draft: BusinessCardDraft;
  errors: BusinessCardErrors;
  field: "address" | "qrPayload";
  label: string;
  onChange: (field: BusinessCardDraftField, value: string) => void;
  rows: number;
}) {
  const error = errors[field];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={`card-${field}`}>{label}</Label>
        <span className="text-xs text-muted-foreground">Optional</span>
      </div>
      <Textarea
        id={`card-${field}`}
        autoComplete={autoComplete}
        rows={rows}
        value={draft[field]}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `card-${field}-error` : undefined}
        onChange={(event) => onChange(field, event.target.value)}
      />
      {error ? (
        <p
          id={`card-${field}-error`}
          className="text-xs leading-5 text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
