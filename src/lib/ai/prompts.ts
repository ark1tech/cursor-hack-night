import { TOKEN_NAMES } from "@/lib/tokens/default-theme";
import { TOKEN_REGISTRY } from "@/lib/tokens/registry";
import { MAX_GRILL_QUESTIONS } from "./types";
import type { QaEntry } from "./types";

const ALLOWED_TOKENS_DOC = TOKEN_REGISTRY.map((t) => `- \`${t.name}\` (${t.kind}): ${t.description}`).join(
  "\n",
);

export const GRILL_SYSTEM_PROMPT = `You are a design-token assistant conducting a focused design interview (grill-me style).

Rules:
- Ask exactly ONE clarifying question at a time when the user's style request is ambiguous.
- Each question MUST include a "recommendedAnswer" the user can accept quickly.
- Stop early (set done=true) when you have enough detail for palette, contrast, radius, typography, and shadow direction.
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

Rules:
- Output sparse updates only — omit unchanged tokens.
- Use valid oklch() for colors when possible.
- Provide both :root (light) and .dark patches when relevant; omit unchanged scopes.
- Never invent token names outside the allowlist.
- Never output raw CSS — JSON only.
- Include rationale for every changed token.

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
