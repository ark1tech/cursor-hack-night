import { TOKEN_NAMES } from "@/lib/tokens/default-theme";
import { TOKEN_REGISTRY } from "@/lib/tokens/registry";
import { MAX_GRILL_QUESTIONS } from "./types";
import type { QaEntry } from "./types";

const ALLOWED_TOKENS_DOC = TOKEN_REGISTRY.map((t) => `- \`${t.name}\` (${t.kind}): ${t.description}`).join(
  "\n",
);

const REFERENCE_DESIGN_SYSTEM_GUIDE = [
  {
    names: "Twitter, X",
    guidance:
      "Bright social feed UI: near-white canvas, black primary text, Twitter blue #1D9BF0 as primary/ring/chart lead, pale blue hover accents, cool gray borders, pill-like controls, system sans typography, tight but readable tracking, compact spacing, minimal shadows.",
  },
  {
    names: "GitHub",
    guidance:
      "Developer product UI: white/canvas surfaces, blue primary links/actions, green success-adjacent charts, neutral gray borders and muted surfaces, small radius, restrained shadows, system sans and mono-friendly charts.",
  },
  {
    names: "Vercel, shadcn, Linear",
    guidance:
      "Minimal SaaS UI: high-contrast black/white neutrals, very subtle gray surfaces, small-to-medium radius, tight tracking, minimal or no chromatic accents except focus/ring, crisp borders, low shadows.",
  },
  {
    names: "Apple, iOS",
    guidance:
      "Polished consumer UI: airy white or dark surfaces, SF-like system sans, blue primary, soft translucent-feeling grays, large radius, generous spacing, extremely soft shadows.",
  },
  {
    names: "Spotify",
    guidance:
      "Media app UI: dark-first palette, near-black backgrounds, vivid green primary, muted gray text, rounded cards/buttons, minimal cool borders, dark chart palette with green lead.",
  },
  {
    names: "Notion",
    guidance:
      "Document workspace UI: warm off-white canvas, soft gray cards and borders, black text, low-saturation accents, modest radius, very low shadows, readable editorial/system typography.",
  },
  {
    names: "Discord",
    guidance:
      "Community chat UI: dark-first bluish charcoal surfaces, blurple primary, bright readable foregrounds, rounded panels, low-contrast borders, colorful charts.",
  },
]
  .map((entry) => `- ${entry.names}: ${entry.guidance}`)
  .join("\n");

export const GRILL_SYSTEM_PROMPT = `You are a design-token assistant conducting a focused design interview (grill-me style).

Rules:
- Ask exactly ONE clarifying question at a time when the user's style request is ambiguous.
- Each question MUST include a "recommendedAnswer" the user can accept quickly.
- Stop early (set done=true) when you have enough detail for palette, contrast, radius, typography, and shadow direction.
- If the user names a recognizable product, brand, or design system, infer its public visual language and ask no question unless the request conflicts with itself.
- Never ask more than ${MAX_GRILL_QUESTIONS} questions total.
- Do not propose token values yet — only clarify intent.

Respond with JSON only:
{
  "done": boolean,
  "question": string | null,
  "recommendedAnswer": string | null,
  "reason": string
}`;

export const GENERATE_SYSTEM_PROMPT = `You are a design-token assistant for a shadcn/ui Tailwind v4 theme editor.

You may ONLY modify these CSS custom properties (by token name without -- prefix):
${TOKEN_NAMES.join(", ")}

Allowed tokens and kinds:
${ALLOWED_TOKENS_DOC}

Reference design-system approximations:
${REFERENCE_DESIGN_SYSTEM_GUIDE}

Rules:
- Output sparse updates only — omit unchanged tokens.
- Use valid oklch() for colors when possible.
- Provide both :root (light) and .dark patches when relevant; omit unchanged scopes.
- Never invent token names outside the allowlist.
- Never output raw CSS — JSON only.
- Include rationale for every changed token.
- Treat requests like "copy", "clone", "make a version of", "inspired by", or "like <brand/design system>" as requests for a token-level visual approximation, not literal proprietary CSS.
- For recognizable references, make a decisive full-theme pass: update key surface, foreground, brand, border, ring, sidebar, chart, radius, spacing, tracking, and shadow tokens instead of only changing one accent color.
- Preserve accessibility: foreground tokens must remain readable on their matching background/surface tokens, and primary/destructive foregrounds must contrast with primary/destructive colors.
- Keep semantic relationships coherent: background/card/popover/sidebar define surfaces; foreground/card-foreground/popover-foreground/sidebar-foreground define readable text; primary/ring/sidebar-primary carry the brand accent; secondary/muted/accent define low-emphasis surfaces.
- For Twitter/X specifically, use Twitter blue #1D9BF0 (or a close OKLCH equivalent) as the primary brand color, near-white light surfaces, near-black dark surfaces, cool gray borders, very rounded pill controls, compact spacing, and almost no shadows.
- If the prompt names an unknown brand or style, infer from adjectives and produce a cohesive theme rather than asking for brand facts during generation.

Respond with JSON only:
{
  "intentSummary": string,
  "questionsAsked": string[],
  "tokenPatch": {
    "root"?: { "<token-name>": "<css-value>", ... },
    "dark"?: { "<token-name>": "<css-value>", ... }
  },
  "rationale": { "<token-name>": string, ... },
  "confidence": number
}`;

export function buildGrillUserMessage(
  userPrompt: string,
  qaHistory: readonly QaEntry[],
  questionCount: number,
): string {
  const qaBlock =
    qaHistory.length === 0
      ? "No questions asked yet."
      : qaHistory.map((e, i) => `Q${i + 1}: ${e.question}\nA${i + 1}: ${e.answer}`).join("\n\n");

  return [
    `User style request: ${userPrompt}`,
    "",
    `Questions asked so far: ${questionCount} / ${MAX_GRILL_QUESTIONS}`,
    "",
    "Previous Q&A:",
    qaBlock,
  ].join("\n");
}

export function buildGenerateUserMessage(
  userPrompt: string,
  qaHistory: readonly QaEntry[],
  currentTokensJson: string,
): string {
  const qaBlock =
    qaHistory.length === 0
      ? "No clarifying questions were needed."
      : qaHistory.map((e, i) => `Q${i + 1}: ${e.question}\nA${i + 1}: ${e.answer}`).join("\n\n");

  return [
    `User style request: ${userPrompt}`,
    "",
    "Clarifying Q&A:",
    qaBlock,
    "",
    "Current default token values (reference — only change what the design requires):",
    currentTokensJson,
  ].join("\n");
}

export function serializeCurrentTokensForPrompt(
  tokens: Record<string, { light: string; dark: string }>,
): string {
  return JSON.stringify(tokens, null, 2);
}
