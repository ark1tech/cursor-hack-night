import {
  DEFAULT_THEME,
  TOKEN_NAMES,
  createDefaultTokenState,
  type ThemeMode,
  type TokenName,
  type TokenState,
  type TokenValuePair,
} from "./default-theme";
import { THEME_ALIASES, isTokenName } from "./registry";

export type CssVariableName = `--${TokenName}`;

export type CssVariableMap = Readonly<Record<CssVariableName, string>>;

export function computePreviewCssVars(tokenState: TokenState, mode: ThemeMode): CssVariableMap {
  validateTokenState(tokenState);

  const entries = TOKEN_NAMES.map((tokenName): readonly [CssVariableName, string] => {
    return [`--${tokenName}`, tokenState[tokenName][mode]];
  });

  return Object.fromEntries(entries) as Record<CssVariableName, string>;
}

export function resetTokenState(): TokenState {
  return createDefaultTokenState();
}

export function updateTokenValue(
  tokenState: TokenState,
  tokenName: string,
  mode: ThemeMode,
  value: string,
): TokenState {
  validateTokenState(tokenState);

  if (!isTokenName(tokenName)) {
    throw new Error(`Cannot update unknown token "${tokenName}".`);
  }

  if (value.trim().length === 0) {
    throw new Error(`Token "${tokenName}" ${mode} value cannot be empty.`);
  }

  return {
    ...tokenState,
    [tokenName]: {
      ...tokenState[tokenName],
      [mode]: value,
    },
  };
}

export function serializeThemeCss(tokenState: TokenState): string {
  validateTokenState(tokenState);

  return [
    serializeTokenBlock(":root", tokenState, "light"),
    serializeTokenBlock(".dark", tokenState, "dark"),
    serializeThemeAliasBlock(),
  ].join("\n\n");
}

export function serializeTokenCssVars(tokenState: TokenState, mode: ThemeMode): string {
  validateTokenState(tokenState);

  return TOKEN_NAMES.map((tokenName) => {
    return formatCssDeclaration(tokenName, tokenState[tokenName][mode]);
  }).join("\n");
}

export function validateTokenState(tokenState: TokenState): void {
  const tokenStateKeys = Object.keys(tokenState);
  const unknownTokenNames = tokenStateKeys.filter((tokenName) => !isTokenName(tokenName));

  if (unknownTokenNames.length > 0) {
    throw new Error(`Token state includes unknown tokens: ${unknownTokenNames.join(", ")}.`);
  }

  const missingTokenNames = TOKEN_NAMES.filter((tokenName) => {
    return !Object.prototype.hasOwnProperty.call(tokenState, tokenName);
  });

  if (missingTokenNames.length > 0) {
    throw new Error(`Token state is missing tokens: ${missingTokenNames.join(", ")}.`);
  }

  TOKEN_NAMES.forEach((tokenName) => {
    validateTokenValuePair(tokenName, tokenState[tokenName]);
  });
}

export function isDefaultTokenState(tokenState: TokenState): boolean {
  validateTokenState(tokenState);

  return TOKEN_NAMES.every((tokenName) => {
    const tokenValue = tokenState[tokenName];
    const defaultValue = DEFAULT_THEME[tokenName];

    return tokenValue.light === defaultValue.light && tokenValue.dark === defaultValue.dark;
  });
}

function serializeTokenBlock(selector: ":root" | ".dark", tokenState: TokenState, mode: ThemeMode): string {
  return `${selector} {\n${serializeTokenCssVars(tokenState, mode)}\n}`;
}

function serializeThemeAliasBlock(): string {
  const aliasDeclarations = THEME_ALIASES.map((alias) => {
    return `  ${alias.name}: ${alias.value};`;
  }).join("\n");

  return `@theme inline {\n${aliasDeclarations}\n}`;
}

function formatCssDeclaration(tokenName: TokenName, value: string): string {
  return `  --${tokenName}: ${value};`;
}

function validateTokenValuePair(tokenName: TokenName, tokenValuePair: TokenValuePair): void {
  if (tokenValuePair.light.trim().length === 0) {
    throw new Error(`Token "${tokenName}" light value cannot be empty.`);
  }

  if (tokenValuePair.dark.trim().length === 0) {
    throw new Error(`Token "${tokenName}" dark value cannot be empty.`);
  }
}
