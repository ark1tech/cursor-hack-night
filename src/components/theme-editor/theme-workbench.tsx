"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { FrameIcon, RotateCcwIcon, SaveIcon, SparklesIcon } from "lucide-react";
import {
  createDefaultTokenState,
  type ThemeMode,
  type TokenName,
  type TokenState,
} from "@/lib/tokens/default-theme";
import {
  computePreviewCssVars,
  isDefaultTokenState,
  resetTokenState,
  serializeThemeCss,
  updateTokenValue,
} from "@/lib/tokens/css";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportDialog } from "./export-dialog";
import { HypertweakPanel } from "./hypertweak-panel";
import { PreviewCanvas } from "./preview-canvas";
import { TokenSidebar, type TokenRailId } from "./token-sidebar";
import { TweakAiTab } from "./tweak-ai-tab";

type AppTabId = "theme" | "hypertweak" | "tweak-ai";

const APP_TABS = [
  { id: "theme", label: "Theme" },
  { id: "hypertweak", label: "Hypertweak" },
  { id: "tweak-ai", label: "Tweak AI" },
] as const satisfies readonly Readonly<{ id: AppTabId; label: string }>[];

export function ThemeWorkbench() {
  const [activeTab, setActiveTab] = useState<AppTabId>("theme");
  const [activeRail, setActiveRail] = useState<TokenRailId>("colors");
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<ThemeMode>("light");
  const [tokenState, setTokenState] = useState<TokenState>(() => createDefaultTokenState());
  const [hypertweakPreviewStyle, setHypertweakPreviewStyle] = useState<CSSProperties>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewStyle = useMemo(() => createPreviewStyle(tokenState, mode), [tokenState, mode]);
  const exportedCss = useMemo(() => serializeThemeCss(tokenState), [tokenState]);
  const hasChanges = !isDefaultTokenState(tokenState);

  function handleAppTabChange(value: string | number | null): void {
    if (!isAppTabId(value)) {
      throw new Error(`Unknown app tab "${String(value)}".`);
    }

    setActiveTab(value);
  }

  function handleTokenChange(tokenName: TokenName, value: string): void {
    try {
      const nextTokenState = updateTokenValue(tokenState, tokenName, mode, value);
      setTokenState(nextTokenState);
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message);
    }
  }

  function handleResetClick(): void {
    setTokenState(resetTokenState());
    setErrorMessage(null);
  }

  return (
    <div className="tweak-chrome flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex flex-col gap-4 border-b bg-background/95 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <SparklesIcon />
          </div>
          <div>
            <div className="tweak-display text-2xl font-semibold leading-none">Tweak Seven</div>
            <div className="tweak-label mt-1 text-muted-foreground">Theme tokens for shadcn/ui</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm">
            Get Pro
          </Button>
          <Button variant="outline" size="sm">
            <FrameIcon data-icon="inline-start" />
            Export to Figma
          </Button>
          <Button variant="outline" size="sm">
            <SaveIcon data-icon="inline-start" />
            Save
          </Button>
          <ExportDialog css={exportedCss} />
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={handleAppTabChange} className="min-h-0 flex-1 gap-0">
        <div className="flex items-center justify-between border-b bg-background/80 px-4 py-2.5 backdrop-blur">
          <TabsList>
            {APP_TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button variant="ghost" size="sm" disabled={!hasChanges} onClick={handleResetClick}>
            <RotateCcwIcon data-icon="inline-start" />
            Reset
          </Button>
        </div>

        <TabsContent value="theme" className="min-h-0">
          <div className="flex min-h-[calc(100vh-121px)] flex-col lg:flex-row">
            <TokenSidebar
              tokenState={tokenState}
              mode={mode}
              activeRail={activeRail}
              searchQuery={searchQuery}
              onRailChange={setActiveRail}
              onSearchQueryChange={setSearchQuery}
              onTokenChange={handleTokenChange}
            />
            <div className="flex min-h-0 flex-1 flex-col">
              {errorMessage ? (
                <div className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">{errorMessage}</div>
              ) : null}
              <PreviewCanvas mode={mode} previewStyle={previewStyle} onModeChange={setMode} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hypertweak" className="min-h-0">
          <div className="flex min-h-[calc(100vh-121px)] flex-col xl:flex-row">
            <HypertweakPanel onPreviewStyleChange={setHypertweakPreviewStyle} />
            <PreviewCanvas mode={mode} previewStyle={hypertweakPreviewStyle} onModeChange={setMode} />
          </div>
        </TabsContent>
        <TabsContent value="tweak-ai" className="min-h-0">
          <TweakAiTab
            tokenState={tokenState}
            onApply={(next) => {
              setTokenState(next);
              setErrorMessage(null);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function createPreviewStyle(tokenState: TokenState, mode: ThemeMode): CSSProperties {
  return { ...computePreviewCssVars(tokenState, mode) } as CSSProperties;
}

function isAppTabId(value: string | number | null): value is AppTabId {
  return typeof value === "string" && APP_TABS.some((tab) => tab.id === value);
}
