import { Rect, Svg, View } from "@react-pdf/renderer";
import type { ResolvedFixedFormat } from "../../core/formats";
import { createSafeFrame } from "../../primitives/measurement";
import { Image } from "../../primitives/image";
import { QRCode } from "../../primitives/qr-code-view";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";

function Brand({ inverse = false }: { inverse?: boolean }) {
  const color = inverse ? "#ffffff" : "#242033";
  return (
    <Row gap="xs" align="center">
      <Svg width={12} height={12} viewBox="0 0 12 12">
        <Rect x={1} y={5} width={10} height={2} rx={1} fill={color} />
        <Rect x={5} y={1} width={2} height={10} rx={1} fill={color} />
        <Rect
          x={3}
          y={3}
          width={6}
          height={6}
          rx={3}
          fill="none"
          stroke={color}
          strokeWidth={1}
        />
      </Svg>
      <Text weight="strong" style={{ color }}>
        NOVA HEALTH
      </Text>
    </Row>
  );
}

export function QrPortraitBadgeLayout({
  backgroundSource,
  format,
  portraitSource,
  variant,
}: {
  backgroundSource?: string;
  format: ResolvedFixedFormat;
  portraitSource: string;
  variant: "blue" | "light";
}) {
  const frame = createSafeFrame(format);
  const inverse = variant === "blue";
  const textColor = inverse ? "#ffffff" : "#15131e";
  return (
    <View style={{ height: "100%", position: "relative" }}>
      {backgroundSource ? (
        <View
          style={{
            height: format.trim.heightPt,
            left: -frame.x,
            position: "absolute",
            top: -frame.y,
            width: format.trim.widthPt,
          }}
        >
          <Image
            alt="Original abstract blue badge pattern"
            resolvedSource={backgroundSource}
            fit="cover"
            width={format.trim.widthPt}
            height={format.trim.heightPt}
          />
        </View>
      ) : (
        <View
          style={{
            backgroundColor: "#eadfff",
            height: frame.y + 28,
            left: -frame.x,
            position: "absolute",
            top: -frame.y,
            width: format.trim.widthPt,
          }}
        />
      )}
      <Stack gap="md" style={{ height: "100%" }}>
        <Row justify="between" align="start">
          <Stack gap="xs">
            <Text
              weight="strong"
              style={{ color: textColor, fontSize: 20, lineHeight: 1 }}
            >
              Celine{"\n"}Rose
            </Text>
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#ffffff",
                borderRadius: 5,
                marginTop: 4,
                paddingHorizontal: 5,
                paddingVertical: 2,
              }}
            >
              <Text size="caption" style={{ color: "#29223a" }}>
                Physician
              </Text>
            </View>
          </Stack>
          <View style={{ backgroundColor: "#ffffff", padding: 3 }}>
            <QRCode
              payload="https://nova.example/id/celine-rose"
              size={48}
              minimumModuleSize={0.8}
            />
          </View>
        </Row>
        <View style={{ alignItems: "center", marginTop: 3 }}>
          <Image
            alt="Fictional physician portrait"
            resolvedSource={portraitSource}
            fit="cover"
            width={112}
            height={118}
            borderRadius={3}
          />
        </View>
        <Row justify="between" align="end" style={{ marginTop: "auto" }}>
          <Brand inverse={inverse} />
          <Stack gap="xs">
            <Text align="right" size="caption" style={{ color: textColor }}>
              EXP DATE
            </Text>
            <Text align="right" size="caption" style={{ color: textColor }}>
              01/05/2029
            </Text>
          </Stack>
        </Row>
      </Stack>
    </View>
  );
}
