"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { CalendarDaysIcon, CreditCardIcon, MailIcon, MoonIcon, SunIcon, TrendingUpIcon } from "lucide-react";
import type { ThemeMode } from "@/lib/tokens/default-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PreviewSceneId = "custom" | "cards" | "dashboard" | "mail" | "pricing" | "palette";

type PreviewCanvasProps = Readonly<{
  mode: ThemeMode;
  previewStyle: CSSProperties;
  onModeChange: (mode: ThemeMode) => void;
}>;

type PreviewScene = Readonly<{
  id: PreviewSceneId;
  label: string;
}>;

const PREVIEW_SCENES = [
  { id: "custom", label: "Custom" },
  { id: "cards", label: "Cards" },
  { id: "dashboard", label: "Dashboard" },
  { id: "mail", label: "Mail" },
  { id: "pricing", label: "Pricing" },
  { id: "palette", label: "Color Palette" },
] as const satisfies readonly PreviewScene[];

const METRICS = [
  { label: "Revenue", value: "$45,231", detail: "+20.1% from last month" },
  { label: "Subscriptions", value: "+2,350", detail: "+180.1% from last month" },
  { label: "Sales", value: "+12,234", detail: "+19% from last month" },
] as const;

const PAYMENTS = [
  { invoice: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
  { invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { invoice: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
] as const;

export function PreviewCanvas({ mode, previewStyle, onModeChange }: PreviewCanvasProps) {
  const [scene, setScene] = useState<PreviewSceneId>("dashboard");

  function handleSceneChange(value: string | number | null): void {
    if (!isPreviewSceneId(value)) {
      throw new Error(`Unknown preview scene "${String(value)}".`);
    }

    setScene(value);
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-muted/40">
      <div className="flex flex-col gap-3 border-b bg-background/80 p-3 backdrop-blur md:flex-row md:items-center md:justify-between">
        <Tabs value={scene} onValueChange={handleSceneChange}>
          <TabsList className="flex-wrap justify-start">
            {PREVIEW_SCENES.map((previewScene) => (
              <TabsTrigger key={previewScene.id} value={previewScene.id}>
                {previewScene.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button variant={mode === "light" ? "secondary" : "outline"} size="sm" onClick={() => onModeChange("light")}>
            <SunIcon data-icon="inline-start" />
            Light
          </Button>
          <Button variant={mode === "dark" ? "secondary" : "outline"} size="sm" onClick={() => onModeChange("dark")}>
            <MoonIcon data-icon="inline-start" />
            Dark
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border bg-background p-4 shadow-sm md:p-6">
          <div className={mode === "dark" ? "dark" : ""} style={previewStyle}>
            <div className="min-h-[720px] rounded-xl border bg-background p-4 text-foreground shadow-xs md:p-6">
              {scene === "custom" || scene === "dashboard" ? <DashboardPreview /> : <ComingSoonScene scene={scene} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">A live preview using the edited semantic tokens.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Download
          </Button>
          <Button size="sm">Create report</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {METRICS.map((metric, index) => (
          <MetricCard key={metric.label} metric={metric} index={index} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Exercise Minutes</CardTitle>
            <CardDescription>Your activity trend across the current week.</CardDescription>
            <CardAction>
              <Badge variant="secondary">
                <TrendingUpIcon data-icon="inline-start" />
                12%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <LineChart />
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <SubscriptionCard />
          <CreateAccountCard />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <CalendarCard />
          <MoveGoalCard />
        </div>
        <PaymentsCard />
      </div>
    </div>
  );
}

function MetricCard({
  metric,
  index,
}: Readonly<{
  metric: (typeof METRICS)[number];
  index: number;
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{metric.label}</CardTitle>
        <CardDescription>{metric.detail}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4">
        <div className="text-2xl font-semibold tracking-tight">{metric.value}</div>
        <Sparkline index={index} />
      </CardContent>
    </Card>
  );
}

function Sparkline({ index }: Readonly<{ index: number }>) {
  const paths = [
    "M2 22 C10 8 18 14 26 10 C34 6 40 18 48 6",
    "M2 18 C10 22 16 6 24 12 C32 18 38 8 48 12",
    "M2 24 C12 20 14 8 24 8 C34 8 36 18 48 10",
  ] as const;

  return (
    <svg aria-hidden="true" viewBox="0 0 50 28" className="h-10 w-20 text-primary">
      <path d={paths[index]} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function SubscriptionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscribe</CardTitle>
        <CardDescription>Get weekly token updates.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input aria-label="Email address" value="ray@example.com" readOnly />
        <Button>Subscribe</Button>
      </CardContent>
    </Card>
  );
}

function CreateAccountCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Enter your email below.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input aria-label="Name" value="Ray" readOnly />
        <Input aria-label="Email" value="ray@example.com" readOnly />
        <Button variant="secondary">Continue</Button>
      </CardContent>
    </Card>
  );
}

function CalendarCard() {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;
  const dates = ["12", "13", "14", "15", "16", "17", "18"] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDaysIcon data-icon="inline-start" />
          May 2026
        </CardTitle>
        <CardDescription>Launch week schedule.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((day) => (
          <div key={day} className="text-muted-foreground">
            {day}
          </div>
        ))}
        {dates.map((date) => (
          <div key={date} className="rounded-md border bg-muted/50 py-2 data-[today=true]:bg-primary data-[today=true]:text-primary-foreground" data-today={date === "15"}>
            {date}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MoveGoalCard() {
  const bars = [52, 74, 61, 88, 68, 95, 80] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Move Goal</CardTitle>
        <CardDescription>Set your daily activity target.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-end gap-2">
          {bars.map((height) => (
            <div key={height} className="flex flex-1 items-end rounded-md bg-muted" style={{ height: "96px" }}>
              <div className="w-full rounded-md bg-primary" style={{ height: `${height}%` }} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Calories</span>
          <span className="font-medium">620 / 800</span>
        </div>
      </CardContent>
    </Card>
  );
}

function LineChart() {
  return (
    <svg viewBox="0 0 640 220" className="h-64 w-full rounded-lg border bg-muted/30">
      <g stroke="var(--border)" strokeWidth="1">
        <path d="M40 40 H600" />
        <path d="M40 90 H600" />
        <path d="M40 140 H600" />
        <path d="M40 190 H600" />
      </g>
      <path
        d="M44 168 C118 86 156 104 204 128 C270 162 302 52 358 78 C430 112 470 196 596 56"
        fill="none"
        stroke="var(--chart-1)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M44 186 C112 152 160 172 214 144 C282 108 322 140 370 112 C442 70 498 126 596 92"
        fill="none"
        stroke="var(--chart-2)"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}

function PaymentsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCardIcon data-icon="inline-start" />
          Payments
        </CardTitle>
        <CardDescription>Recent transactions from connected accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PAYMENTS.map((payment) => (
              <TableRow key={payment.invoice}>
                <TableCell className="font-medium">{payment.invoice}</TableCell>
                <TableCell>
                  <Badge variant={payment.status === "Paid" ? "secondary" : "outline"}>{payment.status}</Badge>
                </TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell className="text-right">{payment.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ComingSoonScene({ scene }: Readonly<{ scene: PreviewSceneId }>) {
  return (
    <Empty className="min-h-[520px] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MailIcon />
        </EmptyMedia>
        <EmptyTitle>{getSceneLabel(scene)} scene coming soon</EmptyTitle>
        <EmptyDescription>Dashboard and Custom are wired for the MVP preview. This tab is reserved for the next scene pass.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Separator />
        <p className="text-xs text-muted-foreground">Token changes still apply to this canvas wrapper.</p>
      </EmptyContent>
    </Empty>
  );
}

function getSceneLabel(scene: PreviewSceneId): string {
  const previewScene = PREVIEW_SCENES.find((item) => item.id === scene);

  if (!previewScene) {
    throw new Error(`Unknown preview scene "${scene}".`);
  }

  return previewScene.label;
}

function isPreviewSceneId(value: string | number | null): value is PreviewSceneId {
  return typeof value === "string" && PREVIEW_SCENES.some((scene) => scene.id === value);
}
