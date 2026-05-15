import { NextResponse } from "next/server"

import type { DesignTokens } from "@/types/design-tokens"

export const runtime = "nodejs"

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-pro"
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const MAX_OUTPUT_TOKENS = 4096

const extractionPrompt =
  "You are an expert design token extractor and typography analyst. Analyze the provided UI screenshot and reverse-engineer its design system, not a literal average of pixels. Choose the main background color from the largest app canvas/surface. Choose the primary brand color from the most intentional repeated accent: primary CTA buttons, selected nav states, links, active controls, badges, or chart accents. Ignore incidental image content, product photos, shadows, text color, browser/OS chrome, watermarks, and decorative logo lettering. Extract colors in OKLCH with separate numeric Lightness (0-1), Chroma (0-0.4), and Hue (0-360). Preserve the brand hue/chroma, but choose a primary lightness that can support readable button text. Extract radius and spacing as rem numbers from the real UI density: compact dense tables/forms should be near 0.18-0.24, normal dashboards near 0.25-0.33, airy marketing/editorial layouts near 0.34-0.48. For typography, inspect headings, body text, buttons, labels, and nav text. Return blendable numeric font signals: font_style where 0=sans, 1=serif, 2=mono; font_serif, font_mono, font_display, and font_rounded as likelihoods from 0 to 1; font_contrast where 0=low-contrast grotesk/geometric and 1=high-contrast editorial; font_width where 0=condensed, 0.5=normal, 1=expanded; font_size as base body rem; line_height as a unitless ratio; font_weight from 300 to 800; tracking in em units from -0.04 to 0.06. Infer the dominant UI type system, not incidental logo text. Output strictly matching the provided JSON schema."

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    bg_l: { type: "number", minimum: 0, maximum: 1, description: "Main app canvas or page background lightness, not text/image color" },
    bg_c: { type: "number", minimum: 0, maximum: 0.4, description: "Main app canvas or page background chroma" },
    bg_h: { type: "number", minimum: 0, maximum: 360, description: "Main app canvas or page background hue" },
    primary_l: { type: "number", minimum: 0, maximum: 1, description: "Primary brand/accent color lightness from CTAs, links, selected states, active controls, or chart accents" },
    primary_c: { type: "number", minimum: 0, maximum: 0.4, description: "Primary brand/accent color chroma from intentional repeated UI accents" },
    primary_h: { type: "number", minimum: 0, maximum: 360, description: "Primary brand/accent color hue from intentional repeated UI accents" },
    radius: { type: "number", minimum: 0, maximum: 2.5, description: "Border radius in rem (e.g., 0.5)" },
    spacing: { type: "number", minimum: 0.125, maximum: 0.75, description: "Base spacing unit in rem (e.g., 0.25)" },
    font_style: { type: "number", minimum: 0, maximum: 2, description: "Typography style axis: 0 sans, 1 serif, 2 monospace" },
    font_serif: { type: "number", minimum: 0, maximum: 1, description: "0 to 1 likelihood that the dominant UI font is serif" },
    font_mono: { type: "number", minimum: 0, maximum: 1, description: "0 to 1 likelihood that the dominant UI font is monospace" },
    font_display: { type: "number", minimum: 0, maximum: 1, description: "0 to 1 likelihood that the dominant UI font is expressive/display" },
    font_rounded: { type: "number", minimum: 0, maximum: 1, description: "0 to 1 likelihood that the dominant UI font has rounded terminals" },
    font_contrast: { type: "number", minimum: 0, maximum: 1, description: "0 to 1 stroke contrast, low grotesk to high editorial" },
    font_width: { type: "number", minimum: 0, maximum: 1, description: "Width axis: 0 condensed, 0.5 normal, 1 expanded" },
    font_size: { type: "number", minimum: 0.75, maximum: 1.25, description: "Base body font size in rem, usually 0.875 to 1.125" },
    line_height: { type: "number", minimum: 1.1, maximum: 1.8, description: "Base line-height ratio, usually 1.2 to 1.7" },
    font_weight: { type: "number", minimum: 300, maximum: 800, description: "Base font weight from 300 to 800" },
    tracking: { type: "number", minimum: -0.04, maximum: 0.06, description: "Letter spacing in em units, e.g. -0.01" },
  },
  required: [
    "bg_l",
    "bg_c",
    "bg_h",
    "primary_l",
    "primary_c",
    "primary_h",
    "radius",
    "spacing",
    "font_style",
    "font_serif",
    "font_mono",
    "font_display",
    "font_rounded",
    "font_contrast",
    "font_width",
    "font_size",
    "line_height",
    "font_weight",
    "tracking",
  ],
} as const

const tokenKeys = [
  "bg_l",
  "bg_c",
  "bg_h",
  "primary_l",
  "primary_c",
  "primary_h",
  "radius",
  "spacing",
  "font_style",
  "font_serif",
  "font_mono",
  "font_display",
  "font_rounded",
  "font_contrast",
  "font_width",
  "font_size",
  "line_height",
  "font_weight",
  "tracking",
] as const

const tokenRanges = {
  bg_l: [0, 1],
  bg_c: [0, 0.4],
  bg_h: [0, 360],
  primary_l: [0, 1],
  primary_c: [0, 0.4],
  primary_h: [0, 360],
  radius: [0, 2.5],
  spacing: [0.125, 0.75],
  font_style: [0, 2],
  font_serif: [0, 1],
  font_mono: [0, 1],
  font_display: [0, 1],
  font_rounded: [0, 1],
  font_contrast: [0, 1],
  font_width: [0, 1],
  font_size: [0.75, 1.25],
  line_height: [1.1, 1.8],
  font_weight: [300, 800],
  tracking: [-0.04, 0.06],
} as const satisfies Record<(typeof tokenKeys)[number], readonly [number, number]>

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENROUTER_API_KEY." }, { status: 500 })
  }

  const formData = await request.formData()
  const images = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.type.startsWith("image/"))

  if (images.length !== 4) {
    return NextResponse.json({ error: "Upload exactly 4 images using the images form field." }, { status: 400 })
  }

  try {
    const corners = await Promise.all(images.map((image) => extractDesignTokens(image, apiKey)))
    return NextResponse.json(corners)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown extraction error."
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

async function extractDesignTokens(file: File, apiKey: string): Promise<DesignTokens> {
  const imageUrl = await fileToDataUrl(file)
  const attempts = [
    { mode: "json_schema", prompt: buildUserPrompt(file) },
    { mode: "json_object", prompt: buildRetryPrompt(file) },
  ] as const
  let lastError: unknown

  for (const attempt of attempts) {
    try {
      const text = await requestOpenRouterExtraction({
        apiKey,
        imageUrl,
        prompt: attempt.prompt,
        responseFormat: attempt.mode,
      })

      return normalizeDesignTokens(parseModelJson(text))
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error("OpenRouter Gemini extraction failed.")
}

async function requestOpenRouterExtraction({
  apiKey,
  imageUrl,
  prompt,
  responseFormat,
}: Readonly<{
  apiKey: string
  imageUrl: string
  prompt: string
  responseFormat: "json_schema" | "json_object"
}>): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Hypertweak",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0,
      max_tokens: MAX_OUTPUT_TOKENS,
      response_format: buildResponseFormat(responseFormat),
      messages: [
        {
          role: "system",
          content: extractionPrompt,
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`OpenRouter Gemini extraction failed: ${response.status} ${details}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>
      }
    }>
    error?: {
      message?: string
    }
  }
  const text = getMessageText(payload.choices?.[0]?.message?.content)

  if (!text) {
    throw new Error(payload.error?.message ?? "OpenRouter Gemini returned no JSON content.")
  }

  return text
}

function buildResponseFormat(mode: "json_schema" | "json_object") {
  if (mode === "json_object") {
    return { type: "json_object" }
  }

  return {
    type: "json_schema",
    json_schema: {
      name: "design_tokens",
      strict: true,
      schema: responseSchema,
    },
  }
}

function buildUserPrompt(file: File): string {
  return [
    "Extract design tokens from this UI screenshot.",
    `Image filename: ${file.name || "uploaded-screenshot"}.`,
    "Use the visible application UI only. Ignore browser chrome, OS chrome, watermarks, and decorative logo lettering.",
    "Main color rules:",
    "- bg_* is the dominant app canvas/surface color, weighted by large UI areas.",
    "- primary_* is the strongest intentional brand/accent color from buttons, selected nav, links, active controls, badges, or charts.",
    "- Do not use text color, product imagery, drop shadows, or one-off illustration colors as primary unless they are clearly reused as UI accents.",
    "Feature rules:",
    "- radius is the base component corner radius in rem.",
    "- spacing is the base spacing density: compact 0.18-0.24, normal 0.25-0.33, airy 0.34-0.48.",
    "- typography should describe the dominant app text system, not logos.",
    "Return exactly one JSON object. Do not include markdown, comments, explanations, arrays, or alternate keys.",
    `Required numeric keys: ${tokenKeys.join(", ")}.`,
    "Keep the JSON compact and complete.",
  ].join("\n")
}

function buildRetryPrompt(file: File): string {
  return [
    buildUserPrompt(file),
    "The previous response was incomplete or invalid JSON.",
    "Retry with a compact single-line JSON object only.",
    "Every value must be a finite number. Do not include whitespace-heavy formatting.",
    "Use this exact key order:",
    tokenKeys.join(", "),
  ].join("\n")
}

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const mimeType = file.type || "image/png"

  return `data:${mimeType};base64,${buffer.toString("base64")}`
}

function getMessageText(content: string | Array<{ type?: string; text?: string }> | undefined): string | undefined {
  if (typeof content === "string") {
    return content
  }

  return content?.find((part) => part.type === "text" || part.text)?.text
}

function extractJsonText(text: string): string {
  const trimmed = text.trim()
  const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
  const start = withoutFence.indexOf("{")
  const end = withoutFence.lastIndexOf("}")

  if (start === -1 || end === -1 || end <= start) {
    return withoutFence
  }

  return withoutFence.slice(start, end + 1)
}

function parseModelJson(text: string): unknown {
  const jsonText = extractJsonText(text)
  const candidates = [jsonText, repairJsonText(jsonText)]
  let lastError: unknown

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch (error) {
      lastError = error
    }
  }

  const message = lastError instanceof Error ? lastError.message : "Unknown JSON parse error"
  throw new Error(`Gemini returned invalid JSON: ${message}. Raw response preview: ${jsonText.slice(0, 240)}`)
}

function repairJsonText(text: string): string {
  return text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_-]*)(\s*:)/g, '$1"$2"$3')
    .replace(/(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|"[^"]*"|\})\s*(\n\s*")/g, "$1,$2")
    .replace(/,\s*([}\]])/g, "$1")
}

function normalizeDesignTokens(value: unknown): DesignTokens {
  if (!value || typeof value !== "object") {
    throw new Error("Gemini response was not a JSON object.")
  }

  const record = value as Record<string, unknown>
  const missingKeys = tokenKeys.filter((key) => typeof record[key] !== "number" || !Number.isFinite(record[key]))

  if (missingKeys.length > 0) {
    throw new Error(`Gemini response is missing numeric token keys: ${missingKeys.join(", ")}.`)
  }

  return Object.fromEntries(
    tokenKeys.map((key) => {
      const [min, max] = tokenRanges[key]
      return [key, clamp(record[key] as number, min, max)]
    })
  ) as DesignTokens
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
