export const THEME_MODES = ["light", "dark"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export const TOKEN_NAMES = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "font-sans",
  "font-serif",
  "font-mono",
  "radius",
  "shadow-x",
  "shadow-y",
  "shadow-blur",
  "shadow-spread",
  "shadow-opacity",
  "shadow-color",
  "shadow-2xs",
  "shadow-xs",
  "shadow-sm",
  "shadow",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
  "tracking-normal",
  "spacing",
] as const;

export type TokenName = (typeof TOKEN_NAMES)[number];

export type TokenValuePair = Readonly<{
  light: string;
  dark: string;
}>;

export type TokenState = Readonly<Record<TokenName, TokenValuePair>>;

export const DEFAULT_THEME = {
  background: {
    light: "oklch(1 0 0)",
    dark: "oklch(0.145 0 0)",
  },
  foreground: {
    light: "oklch(0.145 0 0)",
    dark: "oklch(0.985 0 0)",
  },
  card: {
    light: "oklch(1 0 0)",
    dark: "oklch(0.205 0 0)",
  },
  "card-foreground": {
    light: "oklch(0.145 0 0)",
    dark: "oklch(0.985 0 0)",
  },
  popover: {
    light: "oklch(1 0 0)",
    dark: "oklch(0.205 0 0)",
  },
  "popover-foreground": {
    light: "oklch(0.145 0 0)",
    dark: "oklch(0.985 0 0)",
  },
  primary: {
    light: "oklch(0.205 0 0)",
    dark: "oklch(0.922 0 0)",
  },
  "primary-foreground": {
    light: "oklch(0.985 0 0)",
    dark: "oklch(0.205 0 0)",
  },
  secondary: {
    light: "oklch(0.97 0 0)",
    dark: "oklch(0.269 0 0)",
  },
  "secondary-foreground": {
    light: "oklch(0.205 0 0)",
    dark: "oklch(0.985 0 0)",
  },
  muted: {
    light: "oklch(0.97 0 0)",
    dark: "oklch(0.269 0 0)",
  },
  "muted-foreground": {
    light: "oklch(0.556 0 0)",
    dark: "oklch(0.708 0 0)",
  },
  accent: {
    light: "oklch(0.97 0 0)",
    dark: "oklch(0.269 0 0)",
  },
  "accent-foreground": {
    light: "oklch(0.205 0 0)",
    dark: "oklch(0.985 0 0)",
  },
  destructive: {
    light: "oklch(0.577 0.245 27.325)",
    dark: "oklch(0.704 0.191 22.216)",
  },
  "destructive-foreground": {
    light: "oklch(0.985 0 0)",
    dark: "oklch(0.985 0 0)",
  },
  border: {
    light: "oklch(0.922 0 0)",
    dark: "oklch(1 0 0 / 10%)",
  },
  input: {
    light: "oklch(0.922 0 0)",
    dark: "oklch(1 0 0 / 15%)",
  },
  ring: {
    light: "oklch(0.708 0 0)",
    dark: "oklch(0.556 0 0)",
  },
  "chart-1": {
    light: "oklch(0.87 0 0)",
    dark: "oklch(0.87 0 0)",
  },
  "chart-2": {
    light: "oklch(0.556 0 0)",
    dark: "oklch(0.556 0 0)",
  },
  "chart-3": {
    light: "oklch(0.439 0 0)",
    dark: "oklch(0.439 0 0)",
  },
  "chart-4": {
    light: "oklch(0.371 0 0)",
    dark: "oklch(0.371 0 0)",
  },
  "chart-5": {
    light: "oklch(0.269 0 0)",
    dark: "oklch(0.269 0 0)",
  },
  sidebar: {
    light: "oklch(0.985 0 0)",
    dark: "oklch(0.205 0 0)",
  },
  "sidebar-foreground": {
    light: "oklch(0.145 0 0)",
    dark: "oklch(0.985 0 0)",
  },
  "sidebar-primary": {
    light: "oklch(0.205 0 0)",
    dark: "oklch(0.488 0.243 264.376)",
  },
  "sidebar-primary-foreground": {
    light: "oklch(0.985 0 0)",
    dark: "oklch(0.985 0 0)",
  },
  "sidebar-accent": {
    light: "oklch(0.97 0 0)",
    dark: "oklch(0.269 0 0)",
  },
  "sidebar-accent-foreground": {
    light: "oklch(0.205 0 0)",
    dark: "oklch(0.985 0 0)",
  },
  "sidebar-border": {
    light: "oklch(0.922 0 0)",
    dark: "oklch(1 0 0 / 10%)",
  },
  "sidebar-ring": {
    light: "oklch(0.708 0 0)",
    dark: "oklch(0.556 0 0)",
  },
  "font-sans": {
    light: "var(--font-geist-sans)",
    dark: "var(--font-geist-sans)",
  },
  "font-serif": {
    light: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    dark: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  "font-mono": {
    light: "var(--font-geist-mono)",
    dark: "var(--font-geist-mono)",
  },
  radius: {
    light: "0.625rem",
    dark: "0.625rem",
  },
  "shadow-x": {
    light: "0px",
    dark: "0px",
  },
  "shadow-y": {
    light: "1px",
    dark: "1px",
  },
  "shadow-blur": {
    light: "3px",
    dark: "3px",
  },
  "shadow-spread": {
    light: "0px",
    dark: "0px",
  },
  "shadow-opacity": {
    light: "0.17",
    dark: "0.17",
  },
  "shadow-color": {
    light: "#000000",
    dark: "#000000",
  },
  "shadow-2xs": {
    light: "0px 1px 3px 0px hsl(0 0% 0% / 0.09)",
    dark: "0px 1px 3px 0px hsl(0 0% 0% / 0.09)",
  },
  "shadow-xs": {
    light: "0px 1px 3px 0px hsl(0 0% 0% / 0.09)",
    dark: "0px 1px 3px 0px hsl(0 0% 0% / 0.09)",
  },
  "shadow-sm": {
    light:
      "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17)",
    dark:
      "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17)",
  },
  shadow: {
    light:
      "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17)",
    dark:
      "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17)",
  },
  "shadow-md": {
    light:
      "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 2px 4px -1px hsl(0 0% 0% / 0.17)",
    dark:
      "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 2px 4px -1px hsl(0 0% 0% / 0.17)",
  },
  "shadow-lg": {
    light:
      "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 4px 6px -1px hsl(0 0% 0% / 0.17)",
    dark:
      "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 4px 6px -1px hsl(0 0% 0% / 0.17)",
  },
  "shadow-xl": {
    light:
      "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 8px 10px -1px hsl(0 0% 0% / 0.17)",
    dark:
      "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 8px 10px -1px hsl(0 0% 0% / 0.17)",
  },
  "shadow-2xl": {
    light: "0px 1px 3px 0px hsl(0 0% 0% / 0.43)",
    dark: "0px 1px 3px 0px hsl(0 0% 0% / 0.43)",
  },
  "tracking-normal": {
    light: "0.025em",
    dark: "0.025em",
  },
  spacing: {
    light: "0.25rem",
    dark: "0.25rem",
  },
} as const satisfies TokenState;

export function createDefaultTokenState(): TokenState {
  return TOKEN_NAMES.reduce((tokenState, tokenName) => {
    return {
      ...tokenState,
      [tokenName]: {
        light: DEFAULT_THEME[tokenName].light,
        dark: DEFAULT_THEME[tokenName].dark,
      },
    };
  }, {} as Record<TokenName, TokenValuePair>);
}
