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
    font_serif: 0.05,
    font_mono: 0.02,
    font_display: 0.15,
    font_rounded: 0.25,
    font_contrast: 0.18,
    font_width: 0.5,
    font_size: 1,
    line_height: 1.5,
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
    font_serif: 0.9,
    font_mono: 0.02,
    font_display: 0.45,
    font_rounded: 0.05,
    font_contrast: 0.82,
    font_width: 0.55,
    font_size: 1.05,
    line_height: 1.62,
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
    font_serif: 0.02,
    font_mono: 0.9,
    font_display: 0.1,
    font_rounded: 0.05,
    font_contrast: 0.05,
    font_width: 0.42,
    font_size: 0.92,
    line_height: 1.45,
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
    font_serif: 0.15,
    font_mono: 0.04,
    font_display: 0.75,
    font_rounded: 0.85,
    font_contrast: 0.28,
    font_width: 0.72,
    font_size: 1.08,
    line_height: 1.35,
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
    font_serif: lerp4(topLeft.font_serif, topRight.font_serif, bottomLeft.font_serif, bottomRight.font_serif, weights),
    font_mono: lerp4(topLeft.font_mono, topRight.font_mono, bottomLeft.font_mono, bottomRight.font_mono, weights),
    font_display: lerp4(
      topLeft.font_display,
      topRight.font_display,
      bottomLeft.font_display,
      bottomRight.font_display,
      weights
    ),
    font_rounded: lerp4(
      topLeft.font_rounded,
      topRight.font_rounded,
      bottomLeft.font_rounded,
      bottomRight.font_rounded,
      weights
    ),
    font_contrast: lerp4(
      topLeft.font_contrast,
      topRight.font_contrast,
      bottomLeft.font_contrast,
      bottomRight.font_contrast,
      weights
    ),
    font_width: lerp4(topLeft.font_width, topRight.font_width, bottomLeft.font_width, bottomRight.font_width, weights),
    font_size: lerp4(topLeft.font_size, topRight.font_size, bottomLeft.font_size, bottomRight.font_size, weights),
    line_height: lerp4(topLeft.line_height, topRight.line_height, bottomLeft.line_height, bottomRight.line_height, weights),
    font_weight: lerp4(topLeft.font_weight, topRight.font_weight, bottomLeft.font_weight, bottomRight.font_weight, weights),
    tracking: lerp4(topLeft.tracking, topRight.tracking, bottomLeft.tracking, bottomRight.tracking, weights),
  }
}

export function formatOklch(lightness: number, chroma: number, hue: number): string {
  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`
}

const INK_DARK = "oklch(0.145 0 0)"
const INK_LIGHT = "oklch(0.985 0 0)"
const MUTED_INK_ON_LIGHT_SURFACE = "oklch(0.45 0.02 260)"
const MUTED_INK_ON_DARK_SURFACE = "oklch(0.78 0.02 260)"
const MIN_TEXT_CONTRAST = 4.5
const DARK_INK_LIGHTNESS_CUTOFF = 0.44

export function designTokensToPreviewStyle(tokens: DesignTokens): CSSProperties {
  const background = formatOklch(tokens.bg_l, tokens.bg_c, tokens.bg_h)
  const cardLightness = Math.min(0.99, Math.max(0.08, tokens.bg_l + (tokens.bg_l > 0.55 ? -0.035 : 0.055)))
  const cardChroma = tokens.bg_c * 0.75
  const card = formatOklch(cardLightness, cardChroma, tokens.bg_h)
  const primaryColor = ensureContrastColor(
    ensureContrastColor(
      {
        lightness: tokens.primary_l,
        chroma: Math.max(0.06, tokens.primary_c),
        hue: tokens.primary_h,
      },
      tokens.bg_l,
      tokens.bg_c,
      tokens.bg_h
    ),
    cardLightness,
    cardChroma,
    tokens.bg_h
  )
  const primary = formatOklch(primaryColor.lightness, primaryColor.chroma, primaryColor.hue)
  const spacing = normalizeSpacing(tokens.spacing)
  const mutedLightness = Math.min(0.96, Math.max(0.12, tokens.bg_l + (tokens.bg_l > 0.55 ? -0.08 : 0.1)))
  const mutedChroma = tokens.bg_c * 0.5
  const muted = formatOklch(mutedLightness, mutedChroma, tokens.bg_h)
  const borderColor = pickLineColorForSurface(cardLightness, tokens.bg_h, "subtle")
  const strongLineColor = pickLineColorForSurface(cardLightness, tokens.bg_h, "strong")
  const mediumLineColor = pickLineColorForSurface(cardLightness, tokens.bg_h, "medium")
  const softLineColor = pickLineColorForSurface(cardLightness, tokens.bg_h, "soft")

  const foreground = pickInkForSurface(tokens.bg_l, tokens.bg_c, tokens.bg_h)
  const cardForeground = pickInkForSurface(cardLightness, cardChroma, tokens.bg_h)
  const secondaryForeground = pickInkForSurface(mutedLightness, mutedChroma, tokens.bg_h)
  const primaryForeground = pickInkForSurface(primaryColor.lightness, primaryColor.chroma, primaryColor.hue)
  const mutedForeground = pickMutedForegroundForSurface(mutedLightness, mutedChroma, tokens.bg_h)

  return {
    "--background": background,
    "--foreground": foreground,
    "--card": card,
    "--card-foreground": cardForeground,
    "--popover": card,
    "--popover-foreground": cardForeground,
    "--primary": primary,
    "--primary-foreground": primaryForeground,
    "--secondary": muted,
    "--secondary-foreground": secondaryForeground,
    "--muted": muted,
    "--muted-foreground": mutedForeground,
    "--accent": muted,
    "--accent-foreground": secondaryForeground,
    "--border": borderColor,
    "--input": borderColor,
    "--ring": primary,
    "--chart-1": primary,
    "--chart-2": mediumLineColor,
    "--chart-3": strongLineColor,
    "--chart-4": formatOklch(primaryColor.lightness, Math.max(0.08, primaryColor.chroma * 0.65), (primaryColor.hue + 110) % 360),
    "--chart-5": softLineColor,
    "--radius": `${tokens.radius.toFixed(3)}rem`,
    "--spacing": `${spacing.toFixed(3)}rem`,
    "--font-sans": pickFontFamily(tokens),
    "--font-serif": 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    "--font-mono":
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    "--tracking-normal": `${tokens.tracking.toFixed(3)}em`,
    fontFamily: pickFontFamily(tokens),
    fontSize: `${tokens.font_size.toFixed(3)}rem`,
    fontWeight: Math.round(tokens.font_weight),
    letterSpacing: `${tokens.tracking.toFixed(3)}em`,
    lineHeight: tokens.line_height,
    fontStretch: `${Math.round(75 + tokens.font_width * 50)}%`,
    fontOpticalSizing: "auto",
  } as CSSProperties
}

type OklchColor = {
  lightness: number
  chroma: number
  hue: number
}

function normalizeSpacing(spacing: number): number {
  if (spacing < 0.25) {
    return Math.max(0.18, spacing)
  }

  if (spacing < 0.36) {
    return 0.25 + (spacing - 0.25) * 0.75
  }

  return Math.min(0.5, 0.3325 + (spacing - 0.36) * 0.45)
}

function ensureContrastColor(color: OklchColor, backgroundLightness: number, backgroundChroma: number, backgroundHue: number): OklchColor {
  const backgroundLuminance = oklchToRelativeLuminance(backgroundLightness, backgroundChroma, backgroundHue)
  const minContrast = 3

  if (contrastRatio(backgroundLuminance, oklchToRelativeLuminance(color.lightness, color.chroma, color.hue)) >= minContrast) {
    return color
  }

  const shouldDarken = backgroundLightness >= 0.5
  let best = color

  for (let step = 0; step <= 24; step += 1) {
    const lightness = shouldDarken
      ? Math.max(0.18, color.lightness - step * 0.025)
      : Math.min(0.86, color.lightness + step * 0.025)
    const candidate = { ...color, lightness }
    const contrast = contrastRatio(backgroundLuminance, oklchToRelativeLuminance(lightness, color.chroma, color.hue))

    best = candidate

    if (contrast >= minContrast) {
      return candidate
    }
  }

  return best
}

function pickLineColorForSurface(
  surfaceLightness: number,
  hue: number,
  strength: "soft" | "subtle" | "medium" | "strong"
): string {
  const lightnessByStrength = {
    soft: surfaceLightness >= 0.5 ? 0.62 : 0.56,
    subtle: surfaceLightness >= 0.5 ? 0.52 : 0.66,
    medium: surfaceLightness >= 0.5 ? 0.38 : 0.78,
    strong: surfaceLightness >= 0.5 ? 0.24 : 0.9,
  } as const

  return formatOklch(lightnessByStrength[strength], 0.025, hue)
}

export function pickFontFamily(tokens: Pick<DesignTokens, "font_style" | "font_serif" | "font_mono" | "font_display" | "font_rounded" | "font_contrast">): string {
  if (tokens.font_mono >= 0.5 || tokens.font_style >= 1.65) {
    return 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
  }

  if (tokens.font_serif >= 0.45 || tokens.font_contrast >= 0.7 || (tokens.font_style >= 0.75 && tokens.font_style < 1.65)) {
    return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
  }

  if (tokens.font_rounded >= 0.55) {
    return 'ui-rounded, "SF Pro Rounded", "Nunito", "Avenir Next Rounded", ui-sans-serif, system-ui, sans-serif'
  }

  if (tokens.font_display >= 0.65) {
    return '"Arial Black", "Impact", "Trebuchet MS", ui-sans-serif, system-ui, sans-serif'
  }

  return 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function pickInkForSurface(lightness: number, chroma: number, hue: number): string {
  const surfaceLuminance = oklchToRelativeLuminance(lightness, chroma, hue)
  const darkLuminance = oklchToRelativeLuminance(0.145, 0, 0)
  const lightLuminance = oklchToRelativeLuminance(0.985, 0, 0)
  const darkContrast = contrastRatio(surfaceLuminance, darkLuminance)
  const lightContrast = contrastRatio(surfaceLuminance, lightLuminance)

  if (darkContrast >= MIN_TEXT_CONTRAST && lightContrast >= MIN_TEXT_CONTRAST) {
    return lightness >= DARK_INK_LIGHTNESS_CUTOFF ? INK_DARK : INK_LIGHT
  }

  if (darkContrast >= MIN_TEXT_CONTRAST) {
    return INK_DARK
  }

  if (lightContrast >= MIN_TEXT_CONTRAST) {
    return INK_LIGHT
  }

  return lightContrast >= darkContrast ? INK_LIGHT : INK_DARK
}

function pickMutedForegroundForSurface(lightness: number, chroma: number, hue: number): string {
  const ink = pickInkForSurface(lightness, chroma, hue)
  const preferred = ink === INK_LIGHT ? MUTED_INK_ON_DARK_SURFACE : MUTED_INK_ON_LIGHT_SURFACE
  const preferredLuminance = oklchStringToRelativeLuminance(preferred)
  const surfaceLuminance = oklchToRelativeLuminance(lightness, chroma, hue)

  if (contrastRatio(surfaceLuminance, preferredLuminance) >= 4.5) {
    return preferred
  }

  const alternate = ink === INK_LIGHT ? MUTED_INK_ON_LIGHT_SURFACE : MUTED_INK_ON_DARK_SURFACE
  const alternateLuminance = oklchStringToRelativeLuminance(alternate)

  return contrastRatio(surfaceLuminance, alternateLuminance) > contrastRatio(surfaceLuminance, preferredLuminance)
    ? alternate
    : preferred
}

function oklchStringToRelativeLuminance(oklch: string): number {
  const match = /oklch\(\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\)/i.exec(oklch)

  if (!match) {
    return 0
  }

  return oklchToRelativeLuminance(Number(match[1]), Number(match[2]), Number(match[3]))
}

function oklchToRelativeLuminance(lightness: number, chroma: number, hue: number): number {
  const hueRadians = (hue * Math.PI) / 180
  const a = chroma * Math.cos(hueRadians)
  const b = chroma * Math.sin(hueRadians)
  const [linearRed, linearGreen, linearBlue] = oklabToLinearSrgb(lightness, a, b)

  return linearRgbToRelativeLuminance(linearRed, linearGreen, linearBlue)
}

function oklabToLinearSrgb(lightness: number, a: number, b: number): [number, number, number] {
  const l = lightness + 0.3963377774 * a + 0.2158037573 * b
  const m = lightness - 0.1055613458 * a - 0.0638541728 * b
  const s = lightness - 0.0894841775 * a - 1.291485548 * b
  const l3 = l ** 3
  const m3 = m ** 3
  const s3 = s ** 3

  return [
    +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ]
}

function linearRgbToRelativeLuminance(red: number, green: number, blue: number): number {
  return 0.2126 * clampLinearRgb(red) + 0.7152 * clampLinearRgb(green) + 0.0722 * clampLinearRgb(blue)
}

function contrastRatio(luminanceA: number, luminanceB: number): number {
  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)

  return (lighter + 0.05) / (darker + 0.05)
}

function clampLinearRgb(channel: number): number {
  return Math.min(1, Math.max(0, channel))
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
