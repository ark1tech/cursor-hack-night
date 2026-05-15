import type { TokenName, TokenState } from "@/lib/tokens/default-theme";
import { updateTokenValue } from "@/lib/tokens/css";
import type { SparseTokenPatch, ThemePatchResult } from "./types";

export function applySparseTokenPatch(
  tokenState: TokenState,
  patch: SparseTokenPatch,
): TokenState {
  let next = tokenState;

  if (patch.root) {
    next = applyScopePatch(next, patch.root, "light");
  }

  if (patch.dark) {
    next = applyScopePatch(next, patch.dark, "dark");
  }

  return next;
}

export function applyThemePatchResult(tokenState: TokenState, result: ThemePatchResult): TokenState {
  return applySparseTokenPatch(tokenState, result.tokenPatch);
}

function applyScopePatch(
  tokenState: TokenState,
  scopePatch: Partial<Record<TokenName, string>>,
  mode: "light" | "dark",
): TokenState {
  return Object.entries(scopePatch).reduce((state, [tokenName, value]) => {
    return updateTokenValue(state, tokenName, mode, value);
  }, tokenState);
}
