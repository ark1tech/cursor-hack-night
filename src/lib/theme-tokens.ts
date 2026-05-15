/**
 * Allowlist and schema for AI-modifiable design tokens.
 * Re-exports the canonical token registry used by the theme editor.
 */
export {
  TOKEN_NAMES,
  DEFAULT_THEME,
  createDefaultTokenState,
  type TokenName,
  type TokenState,
  type TokenValuePair,
  type ThemeMode,
} from "@/lib/tokens/default-theme";

export {
  TOKEN_REGISTRY,
  getTokenDefinition,
  isTokenName,
  type TokenKind,
  type TokenDefinition,
} from "@/lib/tokens/registry";

export type { SparseTokenPatch, ThemePatchResult, QaEntry, GrillQuestionResult } from "@/lib/ai/types";

export { validateSparseTokenPatch, validateThemePatchResult } from "@/lib/ai/validate-patch";

export { applySparseTokenPatch, applyThemePatchResult } from "@/lib/ai/apply-patch";

export { generateDesignMd } from "@/lib/ai/design-md";
