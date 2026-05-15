import { serializeThemeCss } from "@/lib/tokens/css";
import type { TokenState } from "@/lib/tokens/default-theme";
import type { QaEntry, ThemePatchResult } from "./types";

export function generateDesignMd(
  userPrompt: string,
  qaHistory: readonly QaEntry[],
  result: ThemePatchResult,
  tokenState: TokenState,
): string {
  const changedTokens = listChangedTokens(result);
  const rationaleLines = changedTokens.map((token) => {
    const why = result.rationale[token] ?? "No rationale provided.";
    return `- **\`${token}\`**: ${why}`;
  });

  const qaSection =
    qaHistory.length === 0
      ? "_No clarifying questions were needed._"
      : qaHistory
          .map(
            (entry, index) =>
              `### ${index + 1}. ${entry.question}\n\n> ${entry.answer}`,
          )
          .join("\n\n");

  return [
    "# Design",
    "",
    "## Intent",
    "",
    result.intentSummary || userPrompt,
    "",
    "## Original prompt",
    "",
    userPrompt,
    "",
    "## Clarifying Q&A",
    "",
    qaSection,
    "",
    "## Token changes",
    "",
    ...rationaleLines,
    "",
    `Confidence: **${Math.round(result.confidence * 100)}%**`,
    "",
    "## Exported CSS",
    "",
    "```css",
    serializeThemeCss(tokenState),
    "```",
    "",
  ].join("\n");
}

function listChangedTokens(result: ThemePatchResult): string[] {
  const names = new Set<string>();
  for (const scope of ["root", "dark"] as const) {
    const patch = result.tokenPatch[scope];
    if (patch) {
      Object.keys(patch).forEach((name) => names.add(name));
    }
  }
  return [...names].sort();
}
