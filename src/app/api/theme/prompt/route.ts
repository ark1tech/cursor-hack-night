import { NextResponse } from "next/server";
import { askGrillQuestion, generateTokenPatch } from "@/lib/ai/openai";
import type { QaEntry } from "@/lib/ai/types";
import { createDefaultTokenState, type TokenState } from "@/lib/tokens/default-theme";
import { validateTokenState } from "@/lib/tokens/css";

export const runtime = "nodejs";

type PromptAction = "question" | "generate";

type PromptRequestBody = Readonly<{
  action: PromptAction;
  prompt: string;
  qaHistory?: readonly QaEntry[];
  questionCount?: number;
  tokenState?: TokenState;
}>;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as PromptRequestBody;
    const prompt = body.prompt?.trim() ?? "";

    if (prompt.length === 0) {
      return NextResponse.json({ error: "prompt is required." }, { status: 400 });
    }

    const qaHistory = Array.isArray(body.qaHistory) ? body.qaHistory : [];
    const questionCount = typeof body.questionCount === "number" ? body.questionCount : qaHistory.length;

    let tokenState = body.tokenState ?? createDefaultTokenState();
    try {
      validateTokenState(tokenState);
    } catch {
      tokenState = createDefaultTokenState();
    }

    if (body.action === "question") {
      const result = await askGrillQuestion(prompt, qaHistory, questionCount);
      return NextResponse.json(result);
    }

    if (body.action === "generate") {
      const result = await generateTokenPatch(prompt, qaHistory, tokenState);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'action must be "question" or "generate".' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
