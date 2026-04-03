#!/usr/bin/env node
/**
 * Converts Ionicons SVG files to a single TypeScript file with react-native-svg components.
 * Run: node artifacts/mobile/scripts/generate-svg-icons.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SVG_DIR = path.join(__dirname, "../assets/ionicons");
const OUT_FILE = path.join(__dirname, "../components/SvgIcons.tsx");

// Map CSS style string to JSX prop string
function styleToProps(styleStr) {
  if (!styleStr) return "";
  const parts = styleStr.split(";").filter(Boolean);
  const props = [];
  for (const part of parts) {
    const [key, val] = part.split(":").map((s) => s.trim());
    if (!key || !val) continue;
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    // numeric values (strip px)
    const num = parseFloat(val);
    if (!isNaN(num) && val.endsWith("px")) {
      props.push(`${camel}={${num}}`);
    } else if (val === "none" || val === "round" || val === "currentColor") {
      props.push(`${camel}="${val}"`);
    } else if (!isNaN(num)) {
      props.push(`${camel}={${num}}`);
    } else {
      props.push(`${camel}="${val}"`);
    }
  }
  return props.join(" ");
}

// Map SVG element name to react-native-svg component name
const ELEMENT_MAP = {
  path: "Path",
  line: "Line",
  circle: "Circle",
  rect: "Rect",
  ellipse: "Ellipse",
  polygon: "Polygon",
  polyline: "Polyline",
  g: "G",
};

// Collect all react-native-svg elements used across all SVGs
const usedElements = new Set(["Svg"]);

function convertElement(tag, attrs) {
  const comp = ELEMENT_MAP[tag.toLowerCase()];
  if (!comp) return null;
  usedElements.add(comp);

  // Parse attributes
  const attrPairs = [];

  // Handle style inline
  const styleMatch = attrs.match(/style="([^"]+)"/);
  const remainingAttrs = attrs.replace(/style="[^"]*"/, "").trim();

  // Parse remaining attributes (non-style)
  const attrRegex = /(\w[\w-]*)="([^"]*)"/g;
  let m;
  while ((m = attrRegex.exec(remainingAttrs)) !== null) {
    const [, key, val] = m;
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    // Skip xmlns and dimension attributes (handled by parent Svg)
    if (["xmlns", "width", "height", "viewBox"].includes(key)) continue;
    const num = parseFloat(val);
    if (!isNaN(num) && String(num) === val) {
      attrPairs.push(`${camel}={${num}}`);
    } else {
      attrPairs.push(`${camel}="${val}"`);
    }
  }

  if (styleMatch) {
    attrPairs.push(styleToProps(styleMatch[1]));
  }

  return `<${comp} ${attrPairs.join(" ")} />`;
}

function parseSvg(content) {
  // Extract viewBox
  const vbMatch = content.match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : "0 0 512 512";

  // Find all child elements (path, line, circle, etc.)
  const elements = [];
  const elemRegex = /<(path|line|circle|rect|ellipse|polygon|polyline)([^/]*)\s*\/>/gi;
  let m;
  while ((m = elemRegex.exec(content)) !== null) {
    const tag = m[1];
    const attrs = m[2];
    const converted = convertElement(tag, attrs);
    if (converted) elements.push(converted);
  }

  return { viewBox, elements };
}

function toPascalCase(name) {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

const svgFiles = fs.readdirSync(SVG_DIR).filter((f) => f.endsWith(".svg"));
const iconData = [];

for (const file of svgFiles) {
  const name = path.basename(file, ".svg");
  const content = fs.readFileSync(path.join(SVG_DIR, file), "utf8");
  const { viewBox, elements } = parseSvg(content);
  iconData.push({ name, componentName: `${toPascalCase(name)}Icon`, viewBox, elements });
}

// Sort alphabetically
iconData.sort((a, b) => a.name.localeCompare(b.name));

// Build output
const lines = [
  "// AUTO-GENERATED — do not edit by hand",
  `// Generated from assets/ionicons/*.svg on ${new Date().toISOString().split("T")[0]}`,
  `import React from "react";`,
  `import Svg, { ${[...usedElements].filter((e) => e !== "Svg").sort().join(", ")} } from "react-native-svg";`,
  ``,
  `export interface SvgIconProps {`,
  `  size?: number;`,
  `  color?: string;`,
  `}`,
  ``,
];

for (const { componentName, viewBox, elements } of iconData) {
  lines.push(`export function ${componentName}({ size = 24, color = "#000" }: SvgIconProps) {`);
  lines.push(`  return (`);
  lines.push(`    <Svg viewBox="${viewBox}" width={size} height={size} fill={color} color={color}>`);
  for (const el of elements) {
    lines.push(`      ${el}`);
  }
  lines.push(`    </Svg>`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push(``);
}

// Export a name map
lines.push(`export const SVG_ICON_MAP: Record<string, React.FC<SvgIconProps>> = {`);
for (const { name, componentName } of iconData) {
  lines.push(`  "${name}": ${componentName},`);
}
lines.push(`};`);

fs.writeFileSync(OUT_FILE, lines.join("\n"), "utf8");
console.log(`✓ Generated ${iconData.length} icons → ${OUT_FILE}`);
for (const { name } of iconData) console.log(`  - ${name}`);
