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
  inline = false,
  minHeight,
  textStyle,
}: {
  backgroundColor: string;
  borderColor: string;
  columns: readonly FlowTableColumn[];
  color: string;
  left?: number;
  top: number;
  width?: number | string;
  inline?: boolean;
  minHeight?: number;
  textStyle?: TextProps["style"];
}) {
  return (
    <View
      fixed={!inline}
      style={{
        backgroundColor,
        borderBottomColor: borderColor,
        borderBottomWidth: 0.75,
        flexDirection: "row",
        left,
        paddingBottom: 6,
        paddingTop: 6,
        position: inline ? "relative" : "absolute",
        top,
        width,
        ...(minHeight === undefined ? {} : { minHeight }),
      }}
    >
      {columns.map((column) => (
        <Text
          key={column.key}
          style={[
            {
              color,
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: 0.4,
              paddingHorizontal: 4,
              textAlign: column.align ?? "left",
              textTransform: "uppercase",
              width: column.width,
            },
            textStyle,
          ]}
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
  minHeight = 28,
}: {
  borderColor: string;
  children: ReactNode;
  minHeight?: number;
}) {
  return (
    <View
      wrap={false}
      style={{
        borderBottomColor: borderColor,
        borderBottomWidth: 0.5,
        flexDirection: "row",
        minHeight,
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
