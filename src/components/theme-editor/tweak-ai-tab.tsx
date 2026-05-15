"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  DownloadIcon,
  Loader2Icon,
  SparklesIcon,
  Wand2Icon,
} from "lucide-react";
import { applyThemePatchResult } from "@/lib/ai/apply-patch";
import { generateDesignMd } from "@/lib/ai/design-md";
import type { GrillQuestionResult, QaEntry, ThemePatchResult } from "@/lib/ai/types";
import { MAX_GRILL_QUESTIONS } from "@/lib/ai/types";
import type { ThemeMode, TokenState } from "@/lib/tokens/default-theme";
import { computePreviewCssVars, serializeThemeCss } from "@/lib/tokens/css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PreviewCanvas } from "./preview-canvas";

type TweakAiPhase = "idle" | "questioning" | "generating" | "preview";

type TweakAiTabProps = Readonly<{
  tokenState: TokenState;
  onApply: (next: TokenState) => void;
}>;

export function TweakAiTab({ tokenState, onApply }: TweakAiTabProps) {
  const [phase, setPhase] = useState<TweakAiPhase>("idle");
  const [userPrompt, setUserPrompt] = useState("");
  const [qaHistory, setQaHistory] = useState<QaEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<GrillQuestionResult | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");
  const [patchResult, setPatchResult] = useState<ThemePatchResult | null>(null);
  const [previewState, setPreviewState] = useState<TokenState | null>(null);
  const [previewMode, setPreviewMode] = useState<ThemeMode>("light");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const questionCount = qaHistory.length;
  const canStart = userPrompt.trim().length > 0 && !loading;
  const previewStyle = useMemo(
    () => createPreviewStyle(previewState ?? tokenState, previewMode),
    [previewMode, previewState, tokenState],
  );

  const changedTokenCount = useMemo(() => {
    if (!patchResult) {
      return 0;
    }
    const names = new Set<string>();
    for (const scope of ["root", "dark"] as const) {
      const patch = patchResult.tokenPatch[scope];
      if (patch) {
        Object.keys(patch).forEach((n) => names.add(n));
      }
    }
    return names.size;
  }, [patchResult]);

  const fetchQuestion = useCallback(
    async (prompt: string, history: QaEntry[], count: number): Promise<GrillQuestionResult> => {
      const res = await fetch("/api/theme/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "question",
          prompt,
          qaHistory: history,
          questionCount: count,
          tokenState,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to fetch question.");
      }
      return data as GrillQuestionResult;
    },
    [tokenState],
  );

  const fetchGenerate = useCallback(
    async (prompt: string, history: QaEntry[]): Promise<ThemePatchResult> => {
      const res = await fetch("/api/theme/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          prompt,
          qaHistory: history,
          tokenState,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate token patch.");
      }
      return data as ThemePatchResult;
    },
    [tokenState],
  );

  async function handleStart(): Promise<void> {
    const prompt = userPrompt.trim();
    if (!prompt) {
      return;
    }

    setError(null);
    setLoading(true);
    setPhase("questioning");
    setQaHistory([]);
    setPatchResult(null);
    setPreviewState(null);

    try {
      const grill = await fetchQuestion(prompt, [], 0);
      if (grill.done) {
        await runGenerate(prompt, []);
        return;
      }
      setCurrentQuestion(grill);
      setAnswerDraft(grill.recommendedAnswer ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("idle");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer(): Promise<void> {
    if (!currentQuestion?.question) {
      return;
    }

    const prompt = userPrompt.trim();
    const answer = answerDraft.trim() || (currentQuestion.recommendedAnswer ?? "");
    const nextHistory: QaEntry[] = [
      ...qaHistory,
      { question: currentQuestion.question, answer },
    ];

    setError(null);
    setLoading(true);

    try {
      if (nextHistory.length >= MAX_GRILL_QUESTIONS) {
        await runGenerate(prompt, nextHistory);
        return;
      }

      const grill = await fetchQuestion(prompt, nextHistory, nextHistory.length);
      setQaHistory(nextHistory);

      if (grill.done) {
        await runGenerate(prompt, nextHistory);
        return;
      }

      setCurrentQuestion(grill);
      setAnswerDraft(grill.recommendedAnswer ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSkipToGenerate(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      await runGenerate(userPrompt.trim(), qaHistory);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function runGenerate(prompt: string, history: QaEntry[]): Promise<void> {
    setPhase("generating");
    const result = await fetchGenerate(prompt, history);
    const nextState = applyThemePatchResult(tokenState, result);
    setPatchResult(result);
    setPreviewState(nextState);
    setQaHistory(history);
    setCurrentQuestion(null);
    setPhase("preview");
  }

  function handleApply(): void {
    if (!previewState) {
      return;
    }
    onApply(previewState);
    setPhase("idle");
    setPatchResult(null);
    setPreviewState(null);
  }

  function handleReset(): void {
    setPhase("idle");
    setUserPrompt("");
    setQaHistory([]);
    setCurrentQuestion(null);
    setAnswerDraft("");
    setPatchResult(null);
    setPreviewState(null);
    setError(null);
  }

  function handleDownloadDesignMd(): void {
    if (!patchResult || !previewState) {
      return;
    }
    const md = generateDesignMd(userPrompt, qaHistory, patchResult, previewState);
    downloadTextFile("DESIGN.md", md);
  }

  return (
    <div className="tweak-chrome flex min-h-[calc(100vh-121px)] flex-col gap-6 p-6 lg:flex-row">
      <Card className="w-full lg:max-w-md shrink-0">
        <CardHeader>
          <p className="tweak-label text-muted-foreground">Prompt workflow</p>
          <CardTitle className="tweak-display flex items-center gap-2 text-3xl leading-tight">
            <Wand2Icon className="size-5" />
            Tweak AI
          </CardTitle>
          <CardDescription className="tweak-copy">
            Describe your desired style. The assistant asks up to {MAX_GRILL_QUESTIONS} focused
            questions, then proposes sparse token updates for light and dark modes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ai-prompt">Style prompt</Label>
            <Textarea
              id="ai-prompt"
              placeholder="e.g. Warm editorial SaaS with soft violet primary, generous radius, subtle shadows"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              disabled={phase !== "idle" && phase !== "questioning"}
              className="min-h-[100px]"
            />
          </div>

          {phase === "questioning" && currentQuestion?.question ? (
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Question {questionCount + 1} of {MAX_GRILL_QUESTIONS}
              </p>
              <p className="mt-2 text-sm font-medium">{currentQuestion.question}</p>
              {currentQuestion.recommendedAnswer ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Recommended: {currentQuestion.recommendedAnswer}
                </p>
              ) : null}
              <Textarea
                className="mt-3 min-h-[72px]"
                value={answerDraft}
                onChange={(e) => setAnswerDraft(e.target.value)}
                placeholder="Your answer..."
                disabled={loading}
              />
            </div>
          ) : null}

          {qaHistory.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">Clarifications</p>
              {qaHistory.map((entry, i) => (
                <div key={i} className="rounded-md border px-3 py-2 text-xs">
                  <p className="font-medium">{entry.question}</p>
                  <p className="mt-1 text-muted-foreground">{entry.answer}</p>
                </div>
              ))}
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {phase === "idle" ? (
            <Button onClick={handleStart} disabled={!canStart}>
              {loading ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : <SparklesIcon data-icon="inline-start" />}
              Start
            </Button>
          ) : null}

          {phase === "questioning" ? (
            <>
              <Button onClick={handleSubmitAnswer} disabled={loading}>
                {loading ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : <ArrowRightIcon data-icon="inline-start" />}
                Continue
              </Button>
              <Button variant="outline" onClick={handleSkipToGenerate} disabled={loading}>
                Generate now
              </Button>
            </>
          ) : null}

          {phase === "generating" ? (
            <Button disabled>
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
              Generating tokens...
            </Button>
          ) : null}

          {phase === "preview" ? (
            <>
              <Button onClick={handleApply}>
                <CheckIcon data-icon="inline-start" />
                Apply to theme
              </Button>
              <Button variant="outline" onClick={handleDownloadDesignMd}>
                <DownloadIcon data-icon="inline-start" />
                DESIGN.md
              </Button>
              <Button variant="ghost" onClick={handleReset}>
                Start over
              </Button>
            </>
          ) : null}

          {(phase === "questioning" || phase === "preview") && (
            <Button variant="ghost" size="sm" onClick={handleReset} disabled={loading}>
              Cancel
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card className="min-h-[320px] flex-1 overflow-hidden">
        <CardHeader>
          <p className="tweak-label text-muted-foreground">Live result</p>
          <CardTitle className="tweak-display text-2xl leading-tight">Generated preview</CardTitle>
          <CardDescription className="tweak-copy">
            {phase === "preview" && patchResult
              ? patchResult.intentSummary
              : "The generated theme will render as an actual component preview here."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0">
          {phase === "preview" && patchResult ? (
            <>
              <div className="min-h-[680px] border-y">
                <PreviewCanvas mode={previewMode} previewStyle={previewStyle} onModeChange={setPreviewMode} />
              </div>
              <div className="flex flex-col gap-4 p-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{changedTokenCount} tokens changed</Badge>
                  <Badge variant="outline">{Math.round(patchResult.confidence * 100)}% confidence</Badge>
                </div>
                <Separator />
                <TokenPatchList patch={patchResult} />
                {previewState ? (
                  <div className="mt-2">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Generated CSS</p>
                    <pre className="max-h-[280px] overflow-auto rounded-md border bg-muted/30 p-3 font-mono text-[10px] leading-relaxed">
                      {serializeThemeCss(previewState)}
                    </pre>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex min-h-[480px] flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
              {phase === "generating" ? "Generating your token patch..." : "Waiting for your style prompt."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TokenPatchList({ patch }: Readonly<{ patch: ThemePatchResult }>) {
  const entries: Array<{ scope: string; token: string; value: string; rationale: string }> = [];

  for (const scope of ["root", "dark"] as const) {
    const scopePatch = patch.tokenPatch[scope];
    if (!scopePatch) {
      continue;
    }
    for (const [token, value] of Object.entries(scopePatch)) {
      entries.push({
        scope: scope === "root" ? ":root" : ".dark",
        token,
        value,
        rationale: patch.rationale[token] ?? "",
      });
    }
  }

  return (
    <ul className="flex flex-col gap-2 text-xs">
      {entries.map((e) => (
        <li key={`${e.scope}-${e.token}`} className="rounded-md border px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              {e.scope}
            </Badge>
            <span className="font-mono font-medium">--{e.token}</span>
          </div>
          <p className="mt-1 font-mono text-muted-foreground">{e.value}</p>
          {e.rationale ? <p className="mt-1 text-foreground/80">{e.rationale}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function createPreviewStyle(tokenState: TokenState, mode: ThemeMode): CSSProperties {
  return { ...computePreviewCssVars(tokenState, mode) } as CSSProperties;
}

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
