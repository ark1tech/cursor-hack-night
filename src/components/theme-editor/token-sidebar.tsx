import { useEffect, useState, type ChangeEvent } from "react";
import type { TokenName, TokenState, ThemeMode } from "@/lib/tokens/default-theme";
import {
  getTokenGroups,
  searchTokens,
  type TokenDefinition,
  type TokenGroup,
  type TokenGroupId,
} from "@/lib/tokens/registry";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TokenRow } from "./token-row";

type TokenRailId = "colors" | "typography" | "other" | "generate";

type TokenRail = Readonly<{
  id: TokenRailId;
  label: string;
  description: string;
}>;

type TokenSidebarProps = Readonly<{
  tokenState: TokenState;
  mode: ThemeMode;
  activeRail: TokenRailId;
  searchQuery: string;
  onRailChange: (railId: TokenRailId) => void;
  onSearchQueryChange: (query: string) => void;
  onTokenChange: (tokenName: TokenName, value: string) => void;
}>;

const TOKEN_RAILS = [
  {
    id: "colors",
    label: "Colors",
    description: "Surface, brand, chart, and sidebar colors.",
  },
  {
    id: "typography",
    label: "Typography",
    description: "Font family and tracking tokens.",
  },
  {
    id: "other",
    label: "Other",
    description: "Radius, shadow, spacing, and layout tokens.",
  },
  {
    id: "generate",
    label: "Generate",
    description: "Browse all tokens while generation tools are prepared.",
  },
] as const satisfies readonly TokenRail[];

const COLOR_GROUPS = new Set<TokenGroupId>(["base", "surfaces", "brand", "charts", "sidebar"]);
const TYPOGRAPHY_GROUPS = new Set<TokenGroupId>(["typography"]);

export type { TokenRailId };

export function TokenSidebar({
  tokenState,
  mode,
  activeRail,
  searchQuery,
  onRailChange,
  onSearchQueryChange,
  onTokenChange,
}: TokenSidebarProps) {
  const filteredTokens = getFilteredTokens(activeRail, searchQuery);
  const groups = getTokenGroups().filter((group) => {
    return filteredTokens.some((token) => token.group === group.id);
  });
  const openGroups = groups.map((group) => group.id);
  const [accordionValue, setAccordionValue] = useState<string[]>(openGroups);

  useEffect(() => {
    setAccordionValue((currentValue) => {
      const visibleGroups = new Set(openGroups);
      const preservedOpenGroups = currentValue.filter((groupId) => visibleGroups.has(groupId));
      const newlyVisibleGroups = openGroups.filter((groupId) => !currentValue.includes(groupId));

      return [...preservedOpenGroups, ...newlyVisibleGroups];
    });
  }, [openGroups]);

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    onSearchQueryChange(event.target.value);
  }

  return (
    <aside className="flex min-h-0 w-full border-r bg-sidebar text-sidebar-foreground lg:w-[360px]">
      <nav className="flex w-28 shrink-0 flex-col gap-1 border-r bg-sidebar p-2">
        {TOKEN_RAILS.map((rail) => (
          <Button
            key={rail.id}
            variant={activeRail === rail.id ? "secondary" : "ghost"}
            className={cn("h-auto justify-start px-2 py-2 text-left", activeRail === rail.id && "bg-sidebar-accent")}
            onClick={() => onRailChange(rail.id)}
          >
            {rail.label}
          </Button>
        ))}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-3 border-b p-3">
          <div>
            <h2 className="text-sm font-semibold">{getRail(activeRail).label}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{getRail(activeRail).description}</p>
          </div>
          <Input
            aria-label="Search tokens"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-3">
            <Accordion
              multiple
              value={accordionValue}
              onValueChange={(value) => setAccordionValue(value)}
              className="gap-1"
            >
              {groups.map((group) => (
                <AccordionItem key={group.id} value={group.id}>
                  <AccordionTrigger className="px-2">
                    <GroupHeader group={group} tokens={filteredTokens} />
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-2">
                    {filteredTokens
                      .filter((token) => token.group === group.id)
                      .map((token) => (
                        <TokenRow
                          key={token.name}
                          token={token}
                          value={tokenState[token.name][mode]}
                          onTokenChange={onTokenChange}
                        />
                      ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}

function GroupHeader({
  group,
  tokens,
}: Readonly<{
  group: TokenGroup;
  tokens: readonly TokenDefinition[];
}>) {
  const count = tokens.filter((token) => token.group === group.id).length;

  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="flex items-center gap-2">
        <span>{group.label}</span>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{count}</span>
      </span>
      <span className="truncate text-xs font-normal text-muted-foreground">{group.description}</span>
    </span>
  );
}

function getRail(railId: TokenRailId): TokenRail {
  const rail = TOKEN_RAILS.find((item) => item.id === railId);

  if (!rail) {
    throw new Error(`Unknown token rail "${railId}".`);
  }

  return rail;
}

function getFilteredTokens(railId: TokenRailId, searchQuery: string): readonly TokenDefinition[] {
  const matchingTokens = searchTokens(searchQuery);

  if (railId === "generate") {
    return matchingTokens;
  }

  if (railId === "colors") {
    return matchingTokens.filter((token) => COLOR_GROUPS.has(token.group));
  }

  if (railId === "typography") {
    return matchingTokens.filter((token) => TYPOGRAPHY_GROUPS.has(token.group));
  }

  return matchingTokens.filter((token) => !COLOR_GROUPS.has(token.group) && !TYPOGRAPHY_GROUPS.has(token.group));
}
