import type { ChangeEvent } from "react";
import type { TokenDefinition } from "@/lib/tokens/registry";
import { Input } from "@/components/ui/input";

type TokenRowProps = Readonly<{
  token: TokenDefinition;
  value: string;
  onTokenChange: (tokenName: TokenDefinition["name"], value: string) => void;
}>;

export function TokenRow({ token, value, onTokenChange }: TokenRowProps) {
  const isColorLike = token.kind === "color" || token.name === "shadow-color";

  function handleValueChange(event: ChangeEvent<HTMLInputElement>): void {
    onTokenChange(token.name, event.target.value);
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{token.label}</div>
          <div className="truncate text-xs text-muted-foreground">--{token.name}</div>
        </div>
        {isColorLike ? (
          <div
            aria-hidden="true"
            className="size-7 shrink-0 rounded-md border shadow-xs"
            style={{ background: value }}
          />
        ) : null}
      </div>
      <Input
        aria-label={`${token.label} value`}
        className="font-mono text-xs"
        value={value}
        onChange={handleValueChange}
      />
    </div>
  );
}
