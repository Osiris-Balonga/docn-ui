import { Text, View, type TextProps } from "@react-pdf/renderer";
import type { ReactNode } from "react";

export interface FlowTableColumn {
  align?: "left" | "right";
  key: string;
  label: string;
  width: number | string;
}

export function FlowTableHeader({
  backgroundColor,
  borderColor,
  columns,
  color,
  left = 0,
  top,
  width = "100%",
}: {
  backgroundColor: string;
  borderColor: string;
  columns: readonly FlowTableColumn[];
  color: string;
  left?: number;
  top: number;
  width?: number | string;
}) {
  return (
    <View
      fixed
      style={{
        backgroundColor,
        borderBottomColor: borderColor,
        borderBottomWidth: 0.75,
        flexDirection: "row",
        left,
        paddingBottom: 6,
        paddingTop: 6,
        position: "absolute",
        top,
        width,
      }}
    >
      {columns.map((column) => (
        <Text
          key={column.key}
          style={{
            color,
            fontSize: 7,
            fontWeight: 700,
            letterSpacing: 0.4,
            paddingHorizontal: 4,
            textAlign: column.align ?? "left",
            textTransform: "uppercase",
            width: column.width,
          }}
        >
          {column.label}
        </Text>
      ))}
    </View>
  );
}

export function FlowTableRow({
  borderColor,
  children,
}: {
  borderColor: string;
  children: ReactNode;
}) {
  return (
    <View
      wrap={false}
      style={{
        borderBottomColor: borderColor,
        borderBottomWidth: 0.5,
        flexDirection: "row",
        minHeight: 28,
        paddingBottom: 7,
        paddingTop: 7,
      }}
    >
      {children}
    </View>
  );
}

export function FlowTableCell({
  align = "left",
  children,
  style,
  width,
}: {
  align?: "left" | "right";
  children: ReactNode;
  style?: TextProps["style"];
  width: number | string;
}) {
  return (
    <Text
      style={[
        {
          fontSize: 8,
          lineHeight: 1.35,
          paddingHorizontal: 4,
          textAlign: align,
          width,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
