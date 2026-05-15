import { NextResponse } from "next/server"

import type { DesignTokens } from "@/types/design-tokens"

export const runtime = "nodejs"

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash"

const extractionPrompt =
  "You are an expert design token extractor. Analyze the provided UI screenshot and reverse-engineer its design tokens. Extract the background color and the primary brand color in the OKLCH color space, separating the Lightness (0-1), Chroma (0-0.4), and Hue (0-360) into distinct numerical fields. Extract the base border-radius as a pure number representing rem units (e.g., 0.5 for 8px). Extract spacing as a rem number for a base spacing unit (usually 0.2 to 0.35). Extract typography as pure numbers: font_style where 0 means clean sans, 1 means editorial serif, and 2 means technical monospace; font_weight from 300 to 800; tracking in em units from -0.04 to 0.06. Output strictly matching the provided JSON schema."

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
