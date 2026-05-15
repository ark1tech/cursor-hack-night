import {
  GENERATE_SYSTEM_PROMPT,
  GRILL_SYSTEM_PROMPT,
  buildGenerateUserMessage,
  buildGrillUserMessage,
  serializeCurrentTokensForPrompt,
} from "./prompts";
import type { GrillQuestionResult, QaEntry, ThemePatchResult } from "./types";
import { MAX_GRILL_QUESTIONS } from "./types";
import { validateThemePatchResult } from "./validate-patch";
import type { TokenState } from "@/lib/tokens/default-theme";

type ChatMessage = Readonly<{
  role: "system" | "user" | "assistant";
  content: string;
}>;

type ChatCompletionResponse = Readonly<{
  choices?: ReadonlyArray<{
    message?: Readonly<{
      content?: string | null;
    }>;
  }>;
}>;

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o";

export async function askGrillQuestion(
  userPrompt: string,
  qaHistory: readonly QaEntry[],
  questionCount: number,
): Promise<GrillQuestionResult> {
  if (questionCount >= MAX_GRILL_QUESTIONS) {
    return {
      done: true,
      question: null,
      recommendedAnswer: null,
      reason: "Maximum clarifying questions reached.",
    };
  }

  const raw = await chatJson([
    { role: "system", content: GRILL_SYSTEM_PROMPT },
    { role: "user", content: buildGrillUserMessage(userPrompt, qaHistory, questionCount) },
  ]);

  return parseGrillResponse(raw, questionCount);
}

export async function generateTokenPatch(
  userPrompt: string,
  qaHistory: readonly QaEntry[],
  tokenState: TokenState,
): Promise<ThemePatchResult> {
  const raw = await chatJson([
    { role: "system", content: GENERATE_SYSTEM_PROMPT },
    {
      role: "user",
      content: buildGenerateUserMessage(
        userPrompt,
        qaHistory,
        serializeCurrentTokensForPrompt(tokenState as Record<string, { light: string; dark: string }>),
      ),
    },
  ]);

  const validation = validateThemePatchResult(raw);
  if (!validation.ok) {
    const detail = validation.issues.map((i) => `${i.scope}/${i.token}: ${i.message}`).join("; ");
    throw new Error(`Model returned invalid token patch: ${detail}`);
  }

  return validation.result!;
}

async function chatJson(messages: readonly ChatMessage[]): Promise<unknown> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured. Add it to .env.local to use Tweak AI.");
  }

  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER ?? "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "tweakcn",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }

  return JSON.parse(content) as unknown;
}

function parseGrillResponse(raw: unknown, questionCount: number): GrillQuestionResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid grill response shape.");
  }

  const record = raw as Record<string, unknown>;
  const done = Boolean(record.done);

  if (done || questionCount + 1 >= MAX_GRILL_QUESTIONS) {
    return {
      done: true,
      question: null,
      recommendedAnswer: null,
      reason: typeof record.reason === "string" ? record.reason : "Ready to generate tokens.",
    };
  }

  const question = typeof record.question === "string" ? record.question : null;
  if (!question) {
    return {
      done: true,
      question: null,
      recommendedAnswer: null,
      reason: "No further question needed.",
    };
  }

  return {
    done: false,
    question,
    recommendedAnswer:
      typeof record.recommendedAnswer === "string" ? record.recommendedAnswer : null,
    reason: typeof record.reason === "string" ? record.reason : "",
  };
}
