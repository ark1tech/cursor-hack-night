import { TOKEN_NAMES, type TokenName } from "@/lib/tokens/default-theme";
import { getTokenDefinition, isTokenName, type TokenKind } from "@/lib/tokens/registry";
import type { SparseTokenPatch, ThemePatchResult } from "./types";

const OKLCH_PATTERN = /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+(?:\s*\/\s*[\d.]+%?)?\s*\)$/i;
const HSL_PATTERN = /^hsl\(\s*[\d.]+\s+[\d.]+%?\s+[\d.]+%?(?:\s*\/\s*[\d.]+%?)?\s*\)$/i;
const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const LENGTH_PATTERN = /^-?[\d.]+(?:px|rem|em|%)$/;
const NUMBER_PATTERN = /^-?[\d.]+$/;

export type ValidationIssue = Readonly<{
  scope: "root" | "dark";
  token: string;
  message: string;
}>;

export type ValidationResult =
  | Readonly<{ ok: true; patch: SparseTokenPatch }>
  | Readonly<{ ok: false; issues: readonly ValidationIssue[] }>;

export function validateSparseTokenPatch(patch: SparseTokenPatch): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const scope of ["root", "dark"] as const) {
    const scopePatch = patch[scope];
    if (!scopePatch) {
      continue;
    }

    for (const [rawName, rawValue] of Object.entries(scopePatch)) {
      if (!isTokenName(rawName)) {
        issues.push({
          scope,
          token: rawName,
          message: `Unknown token "${rawName}". Allowed: ${TOKEN_NAMES.join(", ")}.`,
        });
        continue;
      }

      const valueError = validateTokenValue(rawName, rawValue);
      if (valueError) {
        issues.push({ scope, token: rawName, message: valueError });
      }
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return { ok: true, patch };
}

export function validateThemePatchResult(raw: unknown): ValidationResult & { result?: ThemePatchResult } {
  if (!isRecord(raw)) {
    return { ok: false, issues: [{ scope: "root", token: "*", message: "Response is not an object." }] };
  }

  const tokenPatch = raw.tokenPatch;
  if (!isRecord(tokenPatch)) {
    return { ok: false, issues: [{ scope: "root", token: "*", message: "tokenPatch is missing or invalid." }] };
  }

  const patchValidation = validateSparseTokenPatch({
    root: isRecord(tokenPatch.root) ? (tokenPatch.root as Partial<Record<TokenName, string>>) : undefined,
    dark: isRecord(tokenPatch.dark) ? (tokenPatch.dark as Partial<Record<TokenName, string>>) : undefined,
  });

  if (!patchValidation.ok) {
    return patchValidation;
  }

  const hasAnyChange =
    Object.keys(patchValidation.patch.root ?? {}).length > 0 ||
    Object.keys(patchValidation.patch.dark ?? {}).length > 0;

  if (!hasAnyChange) {
    return {
      ok: false,
      issues: [{ scope: "root", token: "*", message: "tokenPatch must include at least one token change." }],
    };
  }

  return {
    ok: true,
    patch: patchValidation.patch,
    result: {
      intentSummary: typeof raw.intentSummary === "string" ? raw.intentSummary : "",
      questionsAsked: Array.isArray(raw.questionsAsked)
        ? raw.questionsAsked.filter((q): q is string => typeof q === "string")
        : [],
      tokenPatch: patchValidation.patch,
      rationale: isRecord(raw.rationale)
        ? Object.fromEntries(
            Object.entries(raw.rationale).filter(([, v]) => typeof v === "string") as [string, string][],
          )
        : {},
      confidence: typeof raw.confidence === "number" ? Math.min(1, Math.max(0, raw.confidence)) : 0.5,
    },
  };
}

export function validateTokenValue(tokenName: TokenName, value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "Value cannot be empty.";
  }

  const { kind } = getTokenDefinition(tokenName);
  return validateByKind(kind, trimmed);
}

function validateByKind(kind: TokenKind, value: string): string | null {
  switch (kind) {
    case "color":
      return isColorValue(value) ? null : `Expected oklch(), hsl(), or hex color. Got: "${value}".`;
    case "font":
      return value.length >= 2 ? null : "Font stack must be at least 2 characters.";
    case "radius":
    case "spacing":
      return LENGTH_PATTERN.test(value) ? null : `Expected length (px/rem/em/%). Got: "${value}".`;
    case "tracking":
      return /^-?[\d.]+em$/.test(value) || value === "0" || value === "0em"
        ? null
        : `Expected em tracking value. Got: "${value}".`;
    case "shadow":
      return isShadowValue(value) ? null : `Expected shadow CSS value. Got: "${value}".`;
    default:
      return null;
  }
}

function isColorValue(value: string): boolean {
  return (
    OKLCH_PATTERN.test(value) ||
    HSL_PATTERN.test(value) ||
    HEX_PATTERN.test(value) ||
    value.startsWith("var(") ||
    /^oklch\(.+\)$/i.test(value)
  );
}

function isShadowValue(value: string): boolean {
  if (value === "0" || value === "none") {
    return true;
  }
  if (LENGTH_PATTERN.test(value) || NUMBER_PATTERN.test(value)) {
    return true;
  }
  if (isColorValue(value)) {
    return true;
  }
  return /shadow|px|rem|hsl|oklch|#|rgba?/i.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
