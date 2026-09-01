import { Path, Rect, Svg, View } from "@react-pdf/renderer";
import { assertListItems, type ListItem } from "./list-data";
import { Text } from "./text";
import { usePdfTheme } from "./theme-context";

export type ListMarker = "bullet" | "numbered" | "check";
export interface ListProps {
  /** Validated printable list entries with bounded nesting. */
  items: readonly ListItem[];
  /** Bullet, sequential number or static checkbox marker. */
  marker?: ListMarker;
}

function ListGroup({ items, marker }: Required<ListProps>) {
  const theme = usePdfTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {items.map((item, index) => (
        <View
          key={index}
          style={{ flexDirection: "row", gap: theme.spacing.sm }}
        >
          <View style={{ width: 22, flexShrink: 0 }}>
            {marker === "check" ? (
              <Svg
                width={10}
                height={10}
                viewBox="0 0 10 10"
                style={{ marginTop: 1.5 }}
              >
                <Rect
                  x={0.5}
                  y={0.5}
                  width={9}
                  height={9}
                  stroke={theme.colors.text}
                  strokeWidth={0.7}
                  fill="none"
                />
                {item.checked ? (
                  <Path
                    d="M 2 5 L 4 7 L 8 3"
                    stroke={theme.colors.text}
                    strokeWidth={1}
                    fill="none"
                  />
                ) : null}
              </Svg>
            ) : (
              <Text>{marker === "numbered" ? `${index + 1}.` : "•"}</Text>
            )}
          </View>
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <Text>{item.text}</Text>
            {item.description ? (
              <Text size="caption" tone="muted">
                {item.description}
              </Text>
            ) : null}
            {item.children?.length ? (
              <ListGroup items={item.children} marker={marker} />
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

export function List({ items, marker = "bullet" }: ListProps) {
  assertListItems(items);
  return <ListGroup items={items} marker={marker} />;
}

export type { ListItem } from "./list-data";
