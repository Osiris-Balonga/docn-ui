import { View } from "@react-pdf/renderer";
import {
  assertFormGroups,
  type FormField,
  type FormGroup,
} from "./printable-data";
import { usePdfTheme } from "./theme-context";
import { Heading, Text } from "./typography";

export type { FormField, FormGroup } from "./printable-data";
export interface FormProps {
  groups: readonly FormGroup[];
}

function FieldRow({
  fields,
  columns,
}: {
  fields: readonly FormField[];
  columns: number;
}) {
  const theme = usePdfTheme();
  return (
    <View wrap={false} style={{ flexDirection: "row", gap: theme.spacing.lg }}>
      {Array.from({ length: columns }, (_, index) => {
        const field = fields[index];
        return (
          <View
            key={field?.id ?? `blank-${index}`}
            style={{ flex: 1, minWidth: 0 }}
          >
            {field ? (
              <>
                <Text size="caption" weight="strong">
                  {field.label}
                  {field.required ? " (required)" : ""}
                </Text>
                <View
                  style={{
                    flexGrow: 1,
                    minHeight: theme.typeScale.body * 2 + theme.spacing.sm,
                    paddingVertical: theme.spacing.sm,
                    borderBottomColor: theme.colors.border,
                    borderBottomWidth: 0.5,
                  }}
                >
                  {field.value ? <Text>{field.value}</Text> : null}
                </View>
              </>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function Form({ groups }: FormProps) {
  const theme = usePdfTheme();
  assertFormGroups(groups);
  return (
    <View style={{ gap: theme.spacing.lg }}>
      {groups.map((group) => {
        const columns = group.columns ?? 1;
        const rows = Array.from(
          { length: Math.ceil(group.fields.length / columns) },
          (_, index) =>
            group.fields.slice(index * columns, (index + 1) * columns),
        );
        return (
          <View key={group.id} style={{ gap: theme.spacing.md }}>
            <View wrap={false} style={{ gap: theme.spacing.md }}>
              <Heading level={3}>{group.title}</Heading>
              <FieldRow fields={rows[0]!} columns={columns} />
            </View>
            {rows.slice(1).map((fields) => (
              <FieldRow key={fields[0]!.id} fields={fields} columns={columns} />
            ))}
          </View>
        );
      })}
    </View>
  );
}
