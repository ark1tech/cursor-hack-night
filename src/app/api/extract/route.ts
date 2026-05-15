import { NextResponse } from "next/server"

import type { DesignTokens } from "@/types/design-tokens"

export const runtime = "nodejs"

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash"

const extractionPrompt =
  "You are an expert design token extractor and typography analyst. Analyze the provided UI screenshot and reverse-engineer its design tokens. Extract colors in OKLCH with separate numeric Lightness (0-1), Chroma (0-0.4), and Hue (0-360). Extract radius and spacing as rem numbers. For typography, inspect headings, body text, buttons, labels, and nav text. Return blendable numeric font signals: font_style where 0=sans, 1=serif, 2=mono; font_serif, font_mono, font_display, and font_rounded as likelihoods from 0 to 1; font_contrast where 0=low-contrast grotesk/geometric and 1=high-contrast editorial; font_width where 0=condensed, 0.5=normal, 1=expanded; font_size as base body rem; line_height as a unitless ratio; font_weight from 300 to 800; tracking in em units from -0.04 to 0.06. Infer the dominant UI type system, not incidental logo text. Output strictly matching the provided JSON schema."

const responseSchema = {
  type: "OBJECT",
  properties: {
    bg_l: { type: "NUMBER", description: "Background Lightness (0 to 1)" },
    bg_c: { type: "NUMBER", description: "Background Chroma" },
    bg_h: { type: "NUMBER", description: "Background Hue (0 to 360)" },
    primary_l: { type: "NUMBER", description: "Primary Button Lightness" },
    primary_c: { type: "NUMBER", description: "Primary Button Chroma" },
    primary_h: { type: "NUMBER", description: "Primary Button Hue" },
    radius: { type: "NUMBER", description: "Border radius in rem (e.g., 0.5)" },
    spacing: { type: "NUMBER", description: "Base spacing unit in rem (e.g., 0.25)" },
    font_style: { type: "NUMBER", description: "Typography style axis: 0 sans, 1 serif, 2 monospace" },
    font_serif: { type: "NUMBER", description: "0 to 1 likelihood that the dominant UI font is serif" },
    font_mono: { type: "NUMBER", description: "0 to 1 likelihood that the dominant UI font is monospace" },
    font_display: { type: "NUMBER", description: "0 to 1 likelihood that the dominant UI font is expressive/display" },
    font_rounded: { type: "NUMBER", description: "0 to 1 likelihood that the dominant UI font has rounded terminals" },
    font_contrast: { type: "NUMBER", description: "0 to 1 stroke contrast, low grotesk to high editorial" },
    font_width: { type: "NUMBER", description: "Width axis: 0 condensed, 0.5 normal, 1 expanded" },
    font_size: { type: "NUMBER", description: "Base body font size in rem, usually 0.875 to 1.125" },
    line_height: { type: "NUMBER", description: "Base line-height ratio, usually 1.2 to 1.7" },
    font_weight: { type: "NUMBER", description: "Base font weight from 300 to 800" },
    tracking: { type: "NUMBER", description: "Letter spacing in em units, e.g. -0.01" },
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
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY." }, { status: 500 })
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
  const inlineData = await fileToInlineData(file)
  const modelName = GEMINI_MODEL.startsWith("models/") ? GEMINI_MODEL.slice("models/".length) : GEMINI_MODEL
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: extractionPrompt }, { inlineData }],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema,
      },
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Gemini extraction failed: ${response.status} ${details}`)
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }
  const text = payload.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text

  if (!text) {
    throw new Error("Gemini returned no JSON content.")
  }

  const parsed: unknown = JSON.parse(text)

  if (!isDesignTokens(parsed)) {
    throw new Error("Gemini response did not match the design token schema.")
  }

  return parsed
}

async function fileToInlineData(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())

  return {
    mimeType: file.type || "image/png",
    data: buffer.toString("base64"),
  }
}

function isDesignTokens(value: unknown): value is DesignTokens {
  if (!value || typeof value !== "object") {
    return false
  }

  return tokenKeys.every((key) => typeof (value as Record<string, unknown>)[key] === "number")
}
