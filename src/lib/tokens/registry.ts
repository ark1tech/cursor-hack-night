import { TOKEN_NAMES, type TokenName } from "./default-theme";

export type TokenKind =
  | "color"
  | "font"
  | "radius"
  | "shadow"
  | "tracking"
  | "spacing";

export type TokenGroupId =
  | "base"
  | "surfaces"
  | "brand"
  | "charts"
  | "sidebar"
  | "typography"
  | "radius"
  | "shadows"
  | "layout";

export type TokenGroup = Readonly<{
  id: TokenGroupId;
  label: string;
  description: string;
}>;

export type TokenDefinition = Readonly<{
  name: TokenName;
  label: string;
  kind: TokenKind;
  group: TokenGroupId;
  description: string;
}>;

export type ThemeAlias = Readonly<{
  name: `--${string}`;
  value: string;
  sourceToken: TokenName | null;
}>;

type TokenMetadata = Omit<TokenDefinition, "name">;

export const TOKEN_GROUPS = [
  {
    id: "base",
    label: "Base",
    description: "Page-level canvas, text, borders, inputs, and focus rings.",
  },
  {
    id: "surfaces",
    label: "Surfaces",
    description: "Card and popover surfaces with their foreground text.",
  },
  {
    id: "brand",
    label: "Brand",
    description: "Primary, secondary, muted, accent, and destructive roles.",
  },
  {
    id: "charts",
    label: "Charts",
    description: "Chart palette tokens used by preview data visualizations.",
  },
  {
    id: "sidebar",
    label: "Sidebar",
    description: "Navigation surface, foreground, accent, border, and ring tokens.",
  },
  {
    id: "typography",
    label: "Typography",
    description: "Font family and tracking tokens.",
  },
  {
    id: "radius",
    label: "Radius",
    description: "Base radius token that derived Tailwind radius aliases read from.",
  },
  {
    id: "shadows",
    label: "Shadows",
    description: "Shadow primitives and composed Tailwind shadow aliases.",
  },
  {
    id: "layout",
    label: "Layout",
    description: "Base spacing token for Tailwind spacing utilities.",
  },
] as const satisfies readonly TokenGroup[];

const TOKEN_METADATA = {
  background: {
    label: "Background",
    kind: "color",
    group: "base",
    description: "Default page and preview background.",
  },
  foreground: {
    label: "Foreground",
    kind: "color",
    group: "base",
    description: "Default text color on the page background.",
  },
  card: {
    label: "Card",
    kind: "color",
    group: "surfaces",
    description: "Card surface background.",
  },
  "card-foreground": {
    label: "Card foreground",
    kind: "color",
    group: "surfaces",
    description: "Text color on card surfaces.",
  },
  popover: {
    label: "Popover",
    kind: "color",
    group: "surfaces",
    description: "Popover and floating surface background.",
  },
  "popover-foreground": {
    label: "Popover foreground",
    kind: "color",
    group: "surfaces",
    description: "Text color on popover surfaces.",
  },
  primary: {
    label: "Primary",
    kind: "color",
    group: "brand",
    description: "Primary action color.",
  },
  "primary-foreground": {
    label: "Primary foreground",
    kind: "color",
    group: "brand",
    description: "Text color on primary surfaces.",
  },
  secondary: {
    label: "Secondary",
    kind: "color",
    group: "brand",
    description: "Secondary action and supporting surface color.",
  },
  "secondary-foreground": {
    label: "Secondary foreground",
    kind: "color",
    group: "brand",
    description: "Text color on secondary surfaces.",
  },
  muted: {
    label: "Muted",
    kind: "color",
    group: "brand",
    description: "Subtle muted surface color.",
  },
  "muted-foreground": {
    label: "Muted foreground",
    kind: "color",
    group: "brand",
    description: "Subtle text and icon color.",
  },
  accent: {
    label: "Accent",
    kind: "color",
    group: "brand",
    description: "Accent surface color.",
  },
  "accent-foreground": {
    label: "Accent foreground",
    kind: "color",
    group: "brand",
    description: "Text color on accent surfaces.",
  },
  destructive: {
    label: "Destructive",
    kind: "color",
    group: "brand",
    description: "Destructive action color.",
  },
  "destructive-foreground": {
    label: "Destructive foreground",
    kind: "color",
    group: "brand",
    description: "Text color on destructive surfaces.",
  },
  border: {
    label: "Border",
    kind: "color",
    group: "base",
    description: "Default border color.",
  },
  input: {
    label: "Input",
    kind: "color",
    group: "base",
    description: "Input border and field background color.",
  },
  ring: {
    label: "Ring",
    kind: "color",
    group: "base",
    description: "Focus ring color.",
  },
  "chart-1": {
    label: "Chart 1",
    kind: "color",
    group: "charts",
    description: "First chart series color.",
  },
  "chart-2": {
    label: "Chart 2",
    kind: "color",
    group: "charts",
    description: "Second chart series color.",
  },
  "chart-3": {
    label: "Chart 3",
    kind: "color",
    group: "charts",
    description: "Third chart series color.",
  },
  "chart-4": {
    label: "Chart 4",
    kind: "color",
    group: "charts",
    description: "Fourth chart series color.",
  },
  "chart-5": {
    label: "Chart 5",
    kind: "color",
    group: "charts",
    description: "Fifth chart series color.",
  },
  sidebar: {
    label: "Sidebar",
    kind: "color",
    group: "sidebar",
    description: "Sidebar surface background.",
  },
  "sidebar-foreground": {
    label: "Sidebar foreground",
    kind: "color",
    group: "sidebar",
    description: "Default sidebar text color.",
  },
  "sidebar-primary": {
    label: "Sidebar primary",
    kind: "color",
    group: "sidebar",
    description: "Primary sidebar action color.",
  },
  "sidebar-primary-foreground": {
    label: "Sidebar primary foreground",
    kind: "color",
    group: "sidebar",
    description: "Text color on primary sidebar actions.",
  },
  "sidebar-accent": {
    label: "Sidebar accent",
    kind: "color",
    group: "sidebar",
    description: "Sidebar hover and accent surface color.",
  },
  "sidebar-accent-foreground": {
    label: "Sidebar accent foreground",
    kind: "color",
    group: "sidebar",
    description: "Text color on sidebar accent surfaces.",
  },
  "sidebar-border": {
    label: "Sidebar border",
    kind: "color",
    group: "sidebar",
    description: "Sidebar separator and outline color.",
  },
  "sidebar-ring": {
    label: "Sidebar ring",
    kind: "color",
    group: "sidebar",
    description: "Sidebar focus ring color.",
  },
  "font-sans": {
    label: "Sans font",
    kind: "font",
    group: "typography",
    description: "Sans-serif font family token.",
  },
  "font-serif": {
    label: "Serif font",
    kind: "font",
    group: "typography",
    description: "Serif font family token.",
  },
  "font-mono": {
    label: "Mono font",
    kind: "font",
    group: "typography",
    description: "Monospace font family token.",
  },
  radius: {
    label: "Radius",
    kind: "radius",
    group: "radius",
    description: "Base border radius for derived radius aliases.",
  },
  "shadow-x": {
    label: "Shadow X",
    kind: "shadow",
    group: "shadows",
    description: "Horizontal shadow offset primitive.",
  },
  "shadow-y": {
    label: "Shadow Y",
    kind: "shadow",
    group: "shadows",
    description: "Vertical shadow offset primitive.",
  },
  "shadow-blur": {
    label: "Shadow blur",
    kind: "shadow",
    group: "shadows",
    description: "Shadow blur primitive.",
  },
  "shadow-spread": {
    label: "Shadow spread",
    kind: "shadow",
    group: "shadows",
    description: "Shadow spread primitive.",
  },
  "shadow-opacity": {
    label: "Shadow opacity",
    kind: "shadow",
    group: "shadows",
    description: "Default shadow alpha primitive.",
  },
  "shadow-color": {
    label: "Shadow color",
    kind: "shadow",
    group: "shadows",
    description: "Default shadow color primitive.",
  },
  "shadow-2xs": {
    label: "Shadow 2XS",
    kind: "shadow",
    group: "shadows",
    description: "Tailwind 2xs shadow value.",
  },
  "shadow-xs": {
    label: "Shadow XS",
    kind: "shadow",
    group: "shadows",
    description: "Tailwind xs shadow value.",
  },
  "shadow-sm": {
    label: "Shadow SM",
    kind: "shadow",
    group: "shadows",
    description: "Tailwind sm shadow value.",
  },
  shadow: {
    label: "Shadow",
    kind: "shadow",
    group: "shadows",
    description: "Default Tailwind shadow value.",
  },
  "shadow-md": {
    label: "Shadow MD",
    kind: "shadow",
    group: "shadows",
    description: "Tailwind md shadow value.",
  },
  "shadow-lg": {
    label: "Shadow LG",
    kind: "shadow",
    group: "shadows",
    description: "Tailwind lg shadow value.",
  },
  "shadow-xl": {
    label: "Shadow XL",
    kind: "shadow",
    group: "shadows",
    description: "Tailwind xl shadow value.",
  },
  "shadow-2xl": {
    label: "Shadow 2XL",
    kind: "shadow",
    group: "shadows",
    description: "Tailwind 2xl shadow value.",
  },
  "tracking-normal": {
    label: "Tracking normal",
    kind: "tracking",
    group: "typography",
    description: "Base tracking value for derived letter-spacing aliases.",
  },
  spacing: {
    label: "Spacing",
    kind: "spacing",
    group: "layout",
    description: "Base spacing scale for Tailwind spacing utilities.",
  },
} as const satisfies Record<TokenName, TokenMetadata>;

export const TOKEN_REGISTRY = TOKEN_NAMES.map((name) => {
  return {
    name,
    ...TOKEN_METADATA[name],
  };
}) satisfies readonly TokenDefinition[];

export const THEME_ALIASES = [
  { name: "--color-background", value: "var(--background)", sourceToken: "background" },
  { name: "--color-foreground", value: "var(--foreground)", sourceToken: "foreground" },
  { name: "--color-card", value: "var(--card)", sourceToken: "card" },
  {
    name: "--color-card-foreground",
    value: "var(--card-foreground)",
    sourceToken: "card-foreground",
  },
  { name: "--color-popover", value: "var(--popover)", sourceToken: "popover" },
  {
    name: "--color-popover-foreground",
    value: "var(--popover-foreground)",
    sourceToken: "popover-foreground",
  },
  { name: "--color-primary", value: "var(--primary)", sourceToken: "primary" },
  {
    name: "--color-primary-foreground",
    value: "var(--primary-foreground)",
    sourceToken: "primary-foreground",
  },
  { name: "--color-secondary", value: "var(--secondary)", sourceToken: "secondary" },
  {
    name: "--color-secondary-foreground",
    value: "var(--secondary-foreground)",
    sourceToken: "secondary-foreground",
  },
  { name: "--color-muted", value: "var(--muted)", sourceToken: "muted" },
  {
    name: "--color-muted-foreground",
    value: "var(--muted-foreground)",
    sourceToken: "muted-foreground",
  },
  { name: "--color-accent", value: "var(--accent)", sourceToken: "accent" },
  {
    name: "--color-accent-foreground",
    value: "var(--accent-foreground)",
    sourceToken: "accent-foreground",
  },
  { name: "--color-destructive", value: "var(--destructive)", sourceToken: "destructive" },
  {
    name: "--color-destructive-foreground",
    value: "var(--destructive-foreground)",
    sourceToken: "destructive-foreground",
  },
  { name: "--color-border", value: "var(--border)", sourceToken: "border" },
  { name: "--color-input", value: "var(--input)", sourceToken: "input" },
  { name: "--color-ring", value: "var(--ring)", sourceToken: "ring" },
  { name: "--color-chart-1", value: "var(--chart-1)", sourceToken: "chart-1" },
  { name: "--color-chart-2", value: "var(--chart-2)", sourceToken: "chart-2" },
  { name: "--color-chart-3", value: "var(--chart-3)", sourceToken: "chart-3" },
  { name: "--color-chart-4", value: "var(--chart-4)", sourceToken: "chart-4" },
  { name: "--color-chart-5", value: "var(--chart-5)", sourceToken: "chart-5" },
  { name: "--color-sidebar", value: "var(--sidebar)", sourceToken: "sidebar" },
  {
    name: "--color-sidebar-foreground",
    value: "var(--sidebar-foreground)",
    sourceToken: "sidebar-foreground",
  },
  {
    name: "--color-sidebar-primary",
    value: "var(--sidebar-primary)",
    sourceToken: "sidebar-primary",
  },
  {
    name: "--color-sidebar-primary-foreground",
    value: "var(--sidebar-primary-foreground)",
    sourceToken: "sidebar-primary-foreground",
  },
  {
    name: "--color-sidebar-accent",
    value: "var(--sidebar-accent)",
    sourceToken: "sidebar-accent",
  },
  {
    name: "--color-sidebar-accent-foreground",
    value: "var(--sidebar-accent-foreground)",
    sourceToken: "sidebar-accent-foreground",
  },
  {
    name: "--color-sidebar-border",
    value: "var(--sidebar-border)",
    sourceToken: "sidebar-border",
  },
  { name: "--color-sidebar-ring", value: "var(--sidebar-ring)", sourceToken: "sidebar-ring" },
  { name: "--font-sans", value: "var(--font-sans)", sourceToken: "font-sans" },
  { name: "--font-serif", value: "var(--font-serif)", sourceToken: "font-serif" },
  { name: "--font-mono", value: "var(--font-mono)", sourceToken: "font-mono" },
  { name: "--radius-sm", value: "calc(var(--radius) * 0.6)", sourceToken: "radius" },
  { name: "--radius-md", value: "calc(var(--radius) * 0.8)", sourceToken: "radius" },
  { name: "--radius-lg", value: "var(--radius)", sourceToken: "radius" },
  { name: "--radius-xl", value: "calc(var(--radius) * 1.4)", sourceToken: "radius" },
  { name: "--radius-2xl", value: "calc(var(--radius) * 1.8)", sourceToken: "radius" },
  { name: "--radius-3xl", value: "calc(var(--radius) * 2.2)", sourceToken: "radius" },
  { name: "--radius-4xl", value: "calc(var(--radius) * 2.6)", sourceToken: "radius" },
  { name: "--shadow-2xs", value: "var(--shadow-2xs)", sourceToken: "shadow-2xs" },
  { name: "--shadow-xs", value: "var(--shadow-xs)", sourceToken: "shadow-xs" },
  { name: "--shadow-sm", value: "var(--shadow-sm)", sourceToken: "shadow-sm" },
  { name: "--shadow", value: "var(--shadow)", sourceToken: "shadow" },
  { name: "--shadow-md", value: "var(--shadow-md)", sourceToken: "shadow-md" },
  { name: "--shadow-lg", value: "var(--shadow-lg)", sourceToken: "shadow-lg" },
  { name: "--shadow-xl", value: "var(--shadow-xl)", sourceToken: "shadow-xl" },
  { name: "--shadow-2xl", value: "var(--shadow-2xl)", sourceToken: "shadow-2xl" },
  { name: "--tracking-tighter", value: "calc(var(--tracking-normal) - 0.05em)", sourceToken: null },
  { name: "--tracking-tight", value: "calc(var(--tracking-normal) - 0.025em)", sourceToken: null },
  { name: "--tracking-normal", value: "var(--tracking-normal)", sourceToken: "tracking-normal" },
  { name: "--tracking-wide", value: "calc(var(--tracking-normal) + 0.025em)", sourceToken: null },
  { name: "--tracking-wider", value: "calc(var(--tracking-normal) + 0.05em)", sourceToken: null },
  { name: "--tracking-widest", value: "calc(var(--tracking-normal) + 0.1em)", sourceToken: null },
  { name: "--spacing", value: "var(--spacing)", sourceToken: "spacing" },
  { name: "--color-shadow-color", value: "var(--shadow-color)", sourceToken: "shadow-color" },
] as const satisfies readonly ThemeAlias[];

const TOKEN_NAME_SET: ReadonlySet<string> = new Set(TOKEN_NAMES);

const TOKEN_REGISTRY_BY_NAME = TOKEN_REGISTRY.reduce((registryByName, token) => {
  return {
    ...registryByName,
    [token.name]: token,
  };
}, {} as Record<TokenName, TokenDefinition>);

const TOKEN_GROUP_SET: ReadonlySet<string> = new Set(TOKEN_GROUPS.map((group) => group.id));

export function isTokenName(value: string): value is TokenName {
  return TOKEN_NAME_SET.has(value);
}

export function getTokenDefinition(tokenName: string): TokenDefinition {
  if (!isTokenName(tokenName)) {
    throw new Error(`Invalid token name "${tokenName}". Expected one of: ${TOKEN_NAMES.join(", ")}.`);
  }

  return TOKEN_REGISTRY_BY_NAME[tokenName];
}

export function getTokenGroups(): readonly TokenGroup[] {
  return TOKEN_GROUPS;
}

export function getTokensByGroup(groupId: TokenGroupId): readonly TokenDefinition[] {
  if (!TOKEN_GROUP_SET.has(groupId)) {
    throw new Error(`Invalid token group "${groupId}".`);
  }

  return TOKEN_REGISTRY.filter((token) => token.group === groupId);
}

export function searchTokens(query: string): readonly TokenDefinition[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return TOKEN_REGISTRY;
  }

  const groupLabelsById = TOKEN_GROUPS.reduce((labelsById, group) => {
    return {
      ...labelsById,
      [group.id]: group.label.toLowerCase(),
    };
  }, {} as Record<TokenGroupId, string>);

  return TOKEN_REGISTRY.filter((token) => {
    const searchableValues = [
      token.name,
      token.label,
      token.kind,
      token.description,
      groupLabelsById[token.group],
    ];

    return searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}
