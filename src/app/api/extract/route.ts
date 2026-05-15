import { NextResponse } from "next/server"

import type { DesignTokens } from "@/types/design-tokens"

export const runtime = "nodejs"

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash"

const extractionPrompt =
  "You are an expert design token extractor and typography analyst. Analyze the provided UI screenshot and reverse-engineer its design tokens. Extract colors in OKLCH with separate numeric Lightness (0-1), Chroma (0-0.4), and Hue (0-360). Extract radius and spacing as rem numbers. For typography, inspect headings, body text, buttons, labels, and nav text. Return blendable numeric font signals: font_style where 0=sans, 1=serif, 2=mono; font_serif, font_mono, font_display, and font_rounded as likelihoods from 0 to 1; font_contrast where 0=low-contrast grotesk/geometric and 1=high-contrast editorial; font_width where 0=condensed, 0.5=normal, 1=expanded; font_size as base body rem; line_height as a unitless ratio; font_weight from 300 to 800; tracking in em units from -0.04 to 0.06. Infer the dominant UI type system, not incidental logo text. Output strictly matching the provided JSON schema."

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    bg_l: { type: "number", description: "Background Lightness (0 to 1)" },
    bg_c: { type: "number", description: "Background Chroma" },
    bg_h: { type: "number", description: "Background Hue (0 to 360)" },
    primary_l: { type: "number", description: "Primary Button Lightness" },
    primary_c: { type: "number", description: "Primary Button Chroma" },
    primary_h: { type: "number", description: "Primary Button Hue" },
    radius: { type: "number", description: "Border radius in rem (e.g., 0.5)" },
    spacing: { type: "number", description: "Base spacing unit in rem (e.g., 0.25)" },
    font_style: { type: "number", description: "Typography style axis: 0 sans, 1 serif, 2 monospace" },
    font_serif: { type: "number", description: "0 to 1 likelihood that the dominant UI font is serif" },
    font_mono: { type: "number", description: "0 to 1 likelihood that the dominant UI font is monospace" },
    font_display: { type: "number", description: "0 to 1 likelihood that the dominant UI font is expressive/display" },
    font_rounded: { type: "number", description: "0 to 1 likelihood that the dominant UI font has rounded terminals" },
    font_contrast: { type: "number", description: "0 to 1 stroke contrast, low grotesk to high editorial" },
    font_width: { type: "number", description: "Width axis: 0 condensed, 0.5 normal, 1 expanded" },
    font_size: { type: "number", description: "Base body font size in rem, usually 0.875 to 1.125" },
    line_height: { type: "number", description: "Base line-height ratio, usually 1.2 to 1.7" },
    font_weight: { type: "number", description: "Base font weight from 300 to 800" },
    tracking: { type: "number", description: "Letter spacing in em units, e.g. -0.01" },
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

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
      max_tokens: 1200,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "design_tokens",
          strict: true,
          schema: responseSchema,
        },
      },
      messages: [
        {
          role: "system",
          content: extractionPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the design tokens from this UI screenshot. Return only JSON matching the schema.",
            },
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

  const parsed: unknown = JSON.parse(extractJsonText(text))

  if (!isDesignTokens(parsed)) {
    throw new Error("Gemini response did not match the design token schema.")
  }

  return parsed
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

function isDesignTokens(value: unknown): value is DesignTokens {
  if (!value || typeof value !== "object") {
    return false
  }

  return tokenKeys.every((key) => typeof (value as Record<string, unknown>)[key] === "number")
}
