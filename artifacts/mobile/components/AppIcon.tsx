import React from "react";
import { Text } from "react-native";
import { SVG_ICON_MAP, type SvgIconProps } from "./SvgIcons";

const SVG_ALIASES: Record<string, string> = {
  "bookmark-outline": "bookmark",
  nutrition: "nutrition-outline",
  water: "water-outline",
  x: "close",
};

const TEXT_FALLBACKS: Record<string, string> = {
  "alert-circle": "!",
  "arrow-up-outline": "↑",
  "bug-outline": "◉",
  "calendar-outline": "▦",
  earth: "◉",
  "earth-outline": "◉",
  "map-outline": "◫",
  remove: "−",
  "resize-outline": "↔",
  "shield-checkmark": "✓",
  "trending-up": "↑",
};

interface AppIconProps extends SvgIconProps {
  name: string;
  style?: object;
}

export function AppIcon({ name, size = 24, color = "#000", style }: AppIconProps) {
  const resolvedName = SVG_ALIASES[name] ?? name;
  const SvgComponent = SVG_ICON_MAP[resolvedName];

  if (SvgComponent) {
    return <SvgComponent size={size} color={color} />;
  }

  const symbol = TEXT_FALLBACKS[name] ?? "·";
  return (
    <Text
      style={[
        {
          fontSize: size * 0.85,
          color,
          width: size,
          height: size,
          textAlign: "center",
          textAlignVertical: "center",
          includeFontPadding: false,
          lineHeight: size,
        },
        style,
      ]}
    >
      {symbol}
    </Text>
  );
}
