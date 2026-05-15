import type { CSSProperties } from "react"

import type { DesignTokens, Weights } from "@/types/design-tokens"

export const sampleCorners: [DesignTokens, DesignTokens, DesignTokens, DesignTokens] = [
  {
    bg_l: 0.98,
    bg_c: 0.012,
    bg_h: 95,
    primary_l: 0.56,
    primary_c: 0.22,
    primary_h: 250,
    radius: 0.5,
    spacing: 0.24,
    font_style: 0,
    font_weight: 520,
    tracking: -0.01,
  },
  {
    bg_l: 0.96,
    bg_c: 0.035,
    bg_h: 35,
    primary_l: 0.62,
    primary_c: 0.19,
    primary_h: 25,
    radius: 1.25,
    spacing: 0.31,
    font_style: 1,
    font_weight: 420,
    tracking: 0.01,
  },
  {
    bg_l: 0.15,
    bg_c: 0.03,
    bg_h: 265,
    primary_l: 0.72,
    primary_c: 0.17,
    primary_h: 165,
    radius: 0.125,
    spacing: 0.2,
    font_style: 2,
    font_weight: 650,
    tracking: -0.025,
  },
  {
    bg_l: 0.18,
    bg_c: 0.04,
    bg_h: 325,
    primary_l: 0.78,
    primary_c: 0.22,
    primary_h: 330,
    radius: 2,
    spacing: 0.34,
    font_style: 0.5,
    font_weight: 760,
    tracking: 0.035,
  },
]

export function calculateWeights(x: number, y: number): Weights {
  const safeX = clamp01(x)
  const safeY = clamp01(y)

  return {
    w1: (1 - safeX) * (1 - safeY),
    w2: safeX * (1 - safeY),
    w3: (1 - safeX) * safeY,
    w4: safeX * safeY,
  }
}

export function lerp4(v1: number, v2: number, v3: number, v4: number, weights: Weights): number {
  return v1 * weights.w1 + v2 * weights.w2 + v3 * weights.w3 + v4 * weights.w4
}

export function interpolateTokens(
  [topLeft, topRight, bottomLeft, bottomRight]: [DesignTokens, DesignTokens, DesignTokens, DesignTokens],
  x: number,
  y: number
): DesignTokens {
  const weights = calculateWeights(x, y)

  return {
    bg_l: lerp4(topLeft.bg_l, topRight.bg_l, bottomLeft.bg_l, bottomRight.bg_l, weights),
    bg_c: lerp4(topLeft.bg_c, topRight.bg_c, bottomLeft.bg_c, bottomRight.bg_c, weights),
    bg_h: interpolateHue(topLeft.bg_h, topRight.bg_h, bottomLeft.bg_h, bottomRight.bg_h, weights),
    primary_l: lerp4(topLeft.primary_l, topRight.primary_l, bottomLeft.primary_l, bottomRight.primary_l, weights),
    primary_c: lerp4(topLeft.primary_c, topRight.primary_c, bottomLeft.primary_c, bottomRight.primary_c, weights),
    primary_h: interpolateHue(
      topLeft.primary_h,
      topRight.primary_h,
      bottomLeft.primary_h,
      bottomRight.primary_h,
      weights
    ),
    radius: lerp4(topLeft.radius, topRight.radius, bottomLeft.radius, bottomRight.radius, weights),
    spacing: lerp4(topLeft.spacing, topRight.spacing, bottomLeft.spacing, bottomRight.spacing, weights),
    font_style: lerp4(topLeft.font_style, topRight.font_style, bottomLeft.font_style, bottomRight.font_style, weights),
    font_weight: lerp4(topLeft.font_weight, topRight.font_weight, bottomLeft.font_weight, bottomRight.font_weight, weights),
    tracking: lerp4(topLeft.tracking, topRight.tracking, bottomLeft.tracking, bottomRight.tracking, weights),
  }
}

export function formatOklch(lightness: number, chroma: number, hue: number): string {
  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`
}

export function designTokensToPreviewStyle(tokens: DesignTokens): CSSProperties {
  const background = formatOklch(tokens.bg_l, tokens.bg_c, tokens.bg_h)
  const primary = formatOklch(tokens.primary_l, tokens.primary_c, tokens.primary_h)
  const foreground = tokens.bg_l > 0.62 ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)"
  const primaryForeground = tokens.primary_l > 0.62 ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)"
  const cardLightness = Math.min(0.99, Math.max(0.08, tokens.bg_l + (tokens.bg_l > 0.55 ? -0.035 : 0.055)))
  const card = formatOklch(cardLightness, tokens.bg_c * 0.75, tokens.bg_h)
  const muted = formatOklch(Math.min(0.96, Math.max(0.12, tokens.bg_l + (tokens.bg_l > 0.55 ? -0.08 : 0.1))), tokens.bg_c * 0.5, tokens.bg_h)
  const border = formatOklch(Math.min(0.92, Math.max(0.22, tokens.bg_l + (tokens.bg_l > 0.55 ? -0.14 : 0.16))), tokens.bg_c * 0.35, tokens.bg_h)

  return {
    "--background": background,
    "--foreground": foreground,
    "--card": card,
    "--card-foreground": foreground,
    "--popover": card,
    "--popover-foreground": foreground,
    "--primary": primary,
    "--primary-foreground": primaryForeground,
    "--secondary": muted,
    "--secondary-foreground": foreground,
    "--muted": muted,
    "--muted-foreground": tokens.bg_l > 0.62 ? "oklch(0.45 0.02 260)" : "oklch(0.78 0.02 260)",
    "--accent": muted,
    "--accent-foreground": foreground,
    "--border": border,
    "--input": border,
    "--ring": primary,
    "--chart-1": primary,
    "--chart-2": formatOklch(tokens.primary_l, tokens.primary_c * 0.75, (tokens.primary_h + 45) % 360),
    "--chart-3": formatOklch(tokens.primary_l, tokens.primary_c * 0.65, (tokens.primary_h + 95) % 360),
    "--chart-4": formatOklch(tokens.primary_l, tokens.primary_c * 0.55, (tokens.primary_h + 150) % 360),
    "--chart-5": formatOklch(tokens.primary_l, tokens.primary_c * 0.45, (tokens.primary_h + 210) % 360),
    "--radius": `${tokens.radius.toFixed(3)}rem`,
    "--spacing": `${tokens.spacing.toFixed(3)}rem`,
    "--font-sans": pickFontFamily(tokens.font_style),
    "--font-mono":
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    "--tracking-normal": `${tokens.tracking.toFixed(3)}em`,
    fontFamily: pickFontFamily(tokens.font_style),
    fontWeight: Math.round(tokens.font_weight),
    letterSpacing: `${tokens.tracking.toFixed(3)}em`,
  } as CSSProperties
}

export function pickFontFamily(fontStyle: number): string {
  if (fontStyle < 0.67) {
    return 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  }

  if (fontStyle < 1.34) {
    return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
  }

  return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function interpolateHue(h1: number, h2: number, h3: number, h4: number, weights: Weights): number {
  const hues = [h1, h2, h3, h4]
  const weightValues = [weights.w1, weights.w2, weights.w3, weights.w4]

  const vector = hues.reduce(
    (acc, hue, index) => {
      const radians = (hue * Math.PI) / 180
      const weight = weightValues[index]

      return {
        x: acc.x + Math.cos(radians) * weight,
        y: acc.y + Math.sin(radians) * weight,
      }
    },
    { x: 0, y: 0 }
  )

  const degrees = (Math.atan2(vector.y, vector.x) * 180) / Math.PI
  return (degrees + 360) % 360
}
