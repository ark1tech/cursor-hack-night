import type { ChangeEvent, CSSProperties } from "react";
import type { TokenDefinition } from "@/lib/tokens/registry";
import type { TokenName } from "@/lib/tokens/default-theme";
import { cn } from "@/lib/utils";

type TokenRowProps = Readonly<{
  token: TokenDefinition;
  value: string;
  onTokenChange: (tokenName: TokenDefinition["name"], value: string) => void;
}>;

type SelectOption = Readonly<{
  label: string;
  value: string;
  pickerValue?: `#${string}`;
}>;

type SliderConfig = Readonly<{
  min: number;
  max: number;
  step: number;
  unit: "px" | "rem" | "";
}>;

const COLOR_OPTIONS = [
  { label: "White", value: "oklch(1 0 0)", pickerValue: "#ffffff" },
  { label: "Near white", value: "oklch(0.985 0 0)", pickerValue: "#fafafa" },
  { label: "Subtle gray", value: "oklch(0.97 0 0)", pickerValue: "#f5f5f5" },
  { label: "Light gray", value: "oklch(0.922 0 0)", pickerValue: "#e5e5e5" },
  { label: "Mid gray", value: "oklch(0.556 0 0)", pickerValue: "#737373" },
  { label: "Dark gray", value: "oklch(0.269 0 0)", pickerValue: "#262626" },
  { label: "Almost black", value: "oklch(0.145 0 0)", pickerValue: "#171717" },
  { label: "Black", value: "#000000", pickerValue: "#000000" },
  { label: "Red", value: "oklch(0.577 0.245 27.325)", pickerValue: "#dc2626" },
  { label: "Orange", value: "oklch(0.705 0.213 47.604)", pickerValue: "#ea580c" },
  { label: "Amber", value: "oklch(0.769 0.188 70.08)", pickerValue: "#d97706" },
  { label: "Green", value: "oklch(0.723 0.219 149.579)", pickerValue: "#16a34a" },
  { label: "Cyan", value: "oklch(0.715 0.143 215.221)", pickerValue: "#0891b2" },
  { label: "Blue", value: "oklch(0.623 0.214 259.815)", pickerValue: "#2563eb" },
  { label: "Violet", value: "oklch(0.606 0.25 292.717)", pickerValue: "#7c3aed" },
  { label: "Pink", value: "oklch(0.656 0.241 354.308)", pickerValue: "#db2777" },
] as const satisfies readonly SelectOption[];

const FONT_OPTIONS = [
  { label: "Geist Sans", value: "var(--font-geist-sans)" },
  { label: "System Sans", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Editorial Serif", value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Geist Mono", value: "var(--font-geist-mono)" },
  { label: "System Mono", value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
] as const satisfies readonly SelectOption[];

const TRACKING_OPTIONS = [
  { label: "Tighter", value: "-0.04em" },
  { label: "Tight", value: "-0.02em" },
  { label: "Normal", value: "0em" },
  { label: "Relaxed", value: "0.025em" },
  { label: "Wide", value: "0.05em" },
  { label: "Widest", value: "0.08em" },
] as const satisfies readonly SelectOption[];

const SHADOW_OPTIONS = [
  { label: "None", value: "0 0 #0000" },
  { label: "Subtle", value: "0px 1px 3px 0px hsl(0 0% 0% / 0.09)" },
  {
    label: "Soft",
    value: "0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17)",
  },
  {
    label: "Lifted",
    value: "0px 4px 6px -1px hsl(0 0% 0% / 0.17), 0px 2px 4px -2px hsl(0 0% 0% / 0.17)",
  },
  {
    label: "Dramatic",
    value: "0px 16px 24px -8px hsl(0 0% 0% / 0.24), 0px 8px 10px -6px hsl(0 0% 0% / 0.18)",
  },
] as const satisfies readonly SelectOption[];

const SLIDER_CONFIGS = {
  radius: { min: 0, max: 2, step: 0.025, unit: "rem" },
  "shadow-x": { min: -24, max: 24, step: 1, unit: "px" },
  "shadow-y": { min: -24, max: 24, step: 1, unit: "px" },
  "shadow-blur": { min: 0, max: 64, step: 1, unit: "px" },
  "shadow-spread": { min: -24, max: 24, step: 1, unit: "px" },
  "shadow-opacity": { min: 0, max: 1, step: 0.01, unit: "" },
  spacing: { min: 0.125, max: 0.75, step: 0.025, unit: "rem" },
} as const satisfies Partial<Record<TokenName, SliderConfig>>;

type SliderTokenName = keyof typeof SLIDER_CONFIGS;

export function TokenRow({ token, value, onTokenChange }: TokenRowProps) {
  const isColorLike = token.kind === "color" || token.name === "shadow-color";

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight">{token.label}</div>
          <div className="truncate font-mono text-[0.6875rem] text-muted-foreground">--{token.name}</div>
        </div>
        {isColorLike ? (
          <div
            aria-hidden="true"
            className="size-7 shrink-0 rounded-md border shadow-xs"
            style={{ background: value }}
          />
        ) : null}
      </div>
      <TokenControl token={token} value={value} onTokenChange={onTokenChange} />
    </div>
  );
}

function TokenControl({ token, value, onTokenChange }: TokenRowProps) {
  const sliderConfig = getSliderConfig(token.name);

  if (sliderConfig) {
    return (
      <SliderControl
        label={token.label}
        value={value}
        config={sliderConfig}
        onValueChange={(nextValue) => onTokenChange(token.name, nextValue)}
      />
    );
  }

  if (token.kind === "font") {
    return (
      <SelectControl
        label={token.label}
        value={value}
        options={FONT_OPTIONS}
        onValueChange={(nextValue) => onTokenChange(token.name, nextValue)}
      />
    );
  }

  if (token.kind === "tracking") {
    return (
      <SelectControl
        label={token.label}
        value={value}
        options={TRACKING_OPTIONS}
        onValueChange={(nextValue) => onTokenChange(token.name, nextValue)}
      />
    );
  }

  if (token.kind === "color" || token.name === "shadow-color") {
    return (
      <ColorControl
        label={token.label}
        value={value}
        onValueChange={(nextValue) => onTokenChange(token.name, nextValue)}
      />
    );
  }

  return (
    <SelectControl
      label={token.label}
      value={value}
      options={SHADOW_OPTIONS}
      onValueChange={(nextValue) => onTokenChange(token.name, nextValue)}
    />
  );
}

function ColorControl({
  label,
  value,
  onValueChange,
}: Readonly<{
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}>) {
  function handlePickerChange(event: ChangeEvent<HTMLInputElement>): void {
    onValueChange(event.target.value);
  }

  return (
    <div className="flex gap-2">
      <input
        aria-label={`${label} color picker`}
        className="h-8 w-12 shrink-0 cursor-pointer rounded-lg border border-input bg-background p-1 outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        type="color"
        value={getPickerValue(value)}
        onChange={handlePickerChange}
      />
      <SelectControl
        label={label}
        value={value}
        options={COLOR_OPTIONS}
        onValueChange={onValueChange}
      />
    </div>
  );
}

function getSliderConfig(tokenName: TokenName): SliderConfig | undefined {
  if (tokenName in SLIDER_CONFIGS) {
    return SLIDER_CONFIGS[tokenName as SliderTokenName];
  }

  return undefined;
}

function SelectControl({
  label,
  value,
  options,
  onValueChange,
}: Readonly<{
  label: string;
  value: string;
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
}>) {
  const hasCurrentValue = options.some((option) => option.value === value);

  function handleValueChange(event: ChangeEvent<HTMLSelectElement>): void {
    onValueChange(event.target.value);
  }

  return (
    <select
      aria-label={`${label} value`}
      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 font-mono text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      value={value}
      onChange={handleValueChange}
    >
      {hasCurrentValue ? null : <option value={value}>Current: {value}</option>}
      {options.map((option) => (
        <option key={`${option.label}-${option.value}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function SliderControl({
  label,
  value,
  config,
  onValueChange,
}: Readonly<{
  label: string;
  value: string;
  config: SliderConfig;
  onValueChange: (value: string) => void;
}>) {
  const numericValue = clamp(parseTokenNumber(value, config.min), config.min, config.max);

  function handleValueChange(event: ChangeEvent<HTMLInputElement>): void {
    onValueChange(formatSliderValue(Number(event.target.value), config));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 font-mono text-xs text-muted-foreground">
        <span>{config.min}{config.unit}</span>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-foreground">{formatSliderValue(numericValue, config)}</span>
        <span>{config.max}{config.unit}</span>
      </div>
      <input
        aria-label={`${label} value`}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring/50"
        )}
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={numericValue}
        onChange={handleValueChange}
        style={{ "--value": numericValue } as CSSProperties}
      />
    </div>
  );
}

function parseTokenNumber(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatSliderValue(value: number, config: SliderConfig): string {
  const decimals = config.step < 0.1 ? 3 : 0;
  const trimmedValue = value.toFixed(decimals).replace(/\.?0+$/, "");

  return `${trimmedValue}${config.unit}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getPickerValue(value: string): `#${string}` {
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value as `#${string}`;
  }

  const matchingOption = COLOR_OPTIONS.find((option) => option.value === value);

  return matchingOption?.pickerValue ?? "#000000";
}
