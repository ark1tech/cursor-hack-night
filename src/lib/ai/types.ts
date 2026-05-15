import type { TokenName } from "@/lib/tokens/default-theme";

/** Sparse patch keyed by CSS scope (`:root` = light, `.dark` = dark). */
export type SparseTokenPatch = Readonly<{
  root?: Partial<Record<TokenName, string>>;
  dark?: Partial<Record<TokenName, string>>;
}>;

export type ThemePatchResult = Readonly<{
  intentSummary: string;
  questionsAsked: string[];
  tokenPatch: SparseTokenPatch;
  rationale: Record<string, string>;
  confidence: number;
}>;

export type QaEntry = Readonly<{
  question: string;
  answer: string;
}>;

export type GrillQuestionResult = Readonly<{
  done: boolean;
  question: string | null;
  recommendedAnswer: string | null;
  reason: string;
}>;

export const MAX_GRILL_QUESTIONS = 5;

export const MIN_GRILL_QUESTIONS_BEFORE_EARLY_EXIT = 1;
