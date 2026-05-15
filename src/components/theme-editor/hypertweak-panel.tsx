"use client"

import type { CSSProperties, PointerEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { ImageIcon, MoveIcon, SparklesIcon, UploadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  calculateWeights,
  designTokensToPreviewStyle,
  formatOklch,
  interpolateTokens,
  pickFontFamily,
  sampleCorners,
} from "@/lib/design-tokens"
import { cn } from "@/lib/utils"
import type { DesignTokens } from "@/types/design-tokens"

const cornerLabels = ["Top left", "Top right", "Bottom left", "Bottom right"] as const

type ExtractState = "idle" | "loading" | "ready" | "error"

type HypertweakPanelProps = Readonly<{
  onPreviewStyleChange: (style: CSSProperties) => void
}>

export function HypertweakPanel({ onPreviewStyleChange }: HypertweakPanelProps) {
  const padRef = useRef<HTMLDivElement>(null)
  const objectUrlsRef = useRef<string[]>([])
  const [corners, setCorners] = useState<[DesignTokens, DesignTokens, DesignTokens, DesignTokens]>(sampleCorners)
  const [files, setFiles] = useState<File[]>([])
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 })
  const [extractState, setExtractState] = useState<ExtractState>("idle")
  const [message, setMessage] = useState("Using sample tokens until you upload four reference screenshots.")
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const tokens = useMemo(() => interpolateTokens(corners, position.x, position.y), [corners, position])
  const weights = useMemo(() => calculateWeights(position.x, position.y), [position])
  const background = formatOklch(tokens.bg_l, tokens.bg_c, tokens.bg_h)
  const primary = formatOklch(tokens.primary_l, tokens.primary_c, tokens.primary_h)

  function revokeObjectUrls() {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    objectUrlsRef.current = []
  }

  useEffect(() => {
    onPreviewStyleChange(designTokensToPreviewStyle(tokens))
  }, [onPreviewStyleChange, tokens])

  useEffect(() => {
    return () => revokeObjectUrls()
  }, [])

  function updatePosition(event: PointerEvent<HTMLDivElement>) {
    const pad = padRef.current

    if (!pad) {
      return
    }

    const rect = pad.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    setPosition({
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    })
  }

  function handleFileChange(selectedFiles: FileList | null) {
    const nextFiles = Array.from(selectedFiles ?? []).slice(0, 4)
    const nextUrls = nextFiles.map((file) => URL.createObjectURL(file))

    revokeObjectUrls()
    objectUrlsRef.current = nextUrls
    setFiles(nextFiles)
    setImageUrls(nextUrls)
  }

  async function extractCorners() {
    if (files.length !== 4) {
      setExtractState("error")
      setMessage("Choose exactly four screenshots in order: top-left, top-right, bottom-left, bottom-right.")
      return
    }

    setExtractState("loading")
    setMessage("Hypertweak is extracting numerical OKLCH tokens with Gemini...")

    const formData = new FormData()
    files.forEach((file) => formData.append("images", file))

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      })
      const payload: unknown = await response.json()

      if (!response.ok) {
        const error = payload && typeof payload === "object" && "error" in payload ? String(payload.error) : ""
        throw new Error(error || "Extraction failed.")
      }

      if (!isCornerTuple(payload)) {
        throw new Error("The extraction route did not return four valid token objects.")
      }

      setCorners(payload)
      setExtractState("ready")
      setMessage("Four corners extracted. Drag the pad to explore the blended design space.")
    } catch (error) {
      setExtractState("error")
      setMessage(error instanceof Error ? error.message : "Extraction failed.")
    }
  }

  return (
    <aside className="tweak-chrome flex min-h-0 w-full flex-col border-r bg-background xl:w-[420px]">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="flex flex-col gap-2">
          <div className="tweak-label flex items-center gap-2 text-primary">
            <SparklesIcon className="size-4" />
            hypertweak
          </div>
          <div>
            <h1 className="tweak-display text-3xl font-semibold leading-tight">Interpolate four image references</h1>
            <p className="tweak-copy max-w-2xl text-sm text-muted-foreground">
              Upload four screenshots, let Gemini extract the corner tokens, then blend the design space locally with
              a real-time XY pad.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="size-4" />
                Images
              </CardTitle>
              <CardDescription>Use top-left, top-right, bottom-left, bottom-right order.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <label className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed bg-muted/40 p-4 transition-colors hover:bg-muted">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon className="size-4" />
                  Choose four screenshots
                </span>
                <input
                  className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => handleFileChange(event.target.files)}
                />
              </label>

              <div className="grid gap-2">
                {cornerLabels.map((label, index) => (
                  <div key={label} className="rounded-lg border bg-background p-3">
                    <div className="text-xs font-medium text-muted-foreground">{label}</div>
                    <div className="truncate text-sm font-medium">{files[index]?.name ?? "Sample corner token"}</div>
                  </div>
                ))}
              </div>

              <Button type="button" disabled={extractState === "loading"} onClick={extractCorners}>
                <SparklesIcon data-icon="inline-start" />
                {extractState === "loading" ? "Extracting..." : "Run Gemini extraction"}
              </Button>

              <p
                className={cn(
                  "min-h-10 text-sm leading-6 text-muted-foreground",
                  extractState === "error" && "text-destructive",
                  extractState === "ready" && "text-primary"
                )}
              >
                {message}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MoveIcon className="size-4" />
                XY design space
              </CardTitle>
              <CardDescription>The cursor position produces bilinear weights that always sum to 1.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div
                ref={padRef}
                className="relative aspect-square min-h-64 overflow-hidden rounded-2xl border bg-[linear-gradient(90deg,oklch(0.96_0.03_80),oklch(0.9_0.08_30)),linear-gradient(180deg,transparent,oklch(0.2_0.06_275_/_0.88))] touch-none select-none"
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId)
                  updatePosition(event)
                }}
                onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    updatePosition(event)
                  }
                }}
              >
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  {cornerLabels.map((label, index) => (
                    <div key={label} className="relative overflow-hidden bg-muted">
                      {imageUrls[index] ? (
                        <div
                          aria-label={`${label} reference`}
                          className="size-full bg-cover bg-center opacity-75"
                          role="img"
                          style={{ backgroundImage: `url(${imageUrls[index]})` }}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-muted text-xs font-medium text-muted-foreground">
                          {label}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px]" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-foreground/20" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/20" />
                <CornerLabel className="left-3 top-3">TL</CornerLabel>
                <CornerLabel className="right-3 top-3">TR</CornerLabel>
                <CornerLabel className="bottom-3 left-3">BL</CornerLabel>
                <CornerLabel className="bottom-3 right-3">BR</CornerLabel>
                <div
                  className="absolute z-10 size-7 rounded-full border-2 border-background bg-primary shadow-lg"
                  style={{
                    left: `${position.x * 100}%`,
                    top: `${position.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Metric label="x" value={position.x} />
                <Metric label="y" value={position.y} />
                <Metric label="w1" value={weights.w1} />
                <Metric label="w2" value={weights.w2} />
                <Metric label="w3" value={weights.w3} />
                <Metric label="w4" value={weights.w4} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current tokens</CardTitle>
              <CardDescription>These values are applied to the dashboard on the right.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-2 text-sm">
                <TokenRow label="Background" value={background} />
                <TokenRow label="Primary" value={primary} />
                <TokenRow label="Radius" value={`${tokens.radius.toFixed(3)}rem`} />
                <TokenRow label="Spacing" value={`${tokens.spacing.toFixed(3)}rem`} />
                <TokenRow label="Font" value={formatFontLabel(tokens)} />
                <TokenRow label="Serif" value={formatLikelihood(tokens.font_serif)} />
                <TokenRow label="Mono" value={formatLikelihood(tokens.font_mono)} />
                <TokenRow label="Display" value={formatLikelihood(tokens.font_display)} />
                <TokenRow label="Rounded" value={formatLikelihood(tokens.font_rounded)} />
                <TokenRow label="Contrast" value={formatLikelihood(tokens.font_contrast)} />
                <TokenRow label="Width" value={formatLikelihood(tokens.font_width)} />
                <TokenRow label="Size" value={`${tokens.font_size.toFixed(3)}rem`} />
                <TokenRow label="Line height" value={tokens.line_height.toFixed(2)} />
                <TokenRow label="Weight" value={Math.round(tokens.font_weight).toString()} />
                <TokenRow label="Tracking" value={`${tokens.tracking.toFixed(3)}em`} />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </aside>
  )
}

function CornerLabel({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={cn("absolute z-10 rounded-full bg-background/80 px-2 py-1 text-xs font-semibold", className)}>
      {children}
    </span>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold">{value.toFixed(3)}</div>
    </div>
  )
}

function TokenRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-lg border bg-background p-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="font-mono text-xs font-semibold break-all">{value}</dd>
    </div>
  )
}

function isCornerTuple(value: unknown): value is [DesignTokens, DesignTokens, DesignTokens, DesignTokens] {
  return Array.isArray(value) && value.length === 4 && value.every(isDesignTokens)
}

function isDesignTokens(value: unknown): value is DesignTokens {
  if (!value || typeof value !== "object") {
    return false
  }

  return [
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
  ].every(
    (key) => typeof (value as Record<string, unknown>)[key] === "number"
  )
}

function formatFontLabel(tokens: DesignTokens): string {
  const family = pickFontFamily(tokens)

  if (family.includes("ui-serif")) {
    return "Serif"
  }

  if (family.includes("ui-monospace")) {
    return "Monospace"
  }

  return "Sans"
}

function formatLikelihood(value: number): string {
  return `${Math.round(value * 100)}%`
}
