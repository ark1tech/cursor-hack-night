"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis } from "recharts";
import {
  BellIcon,
  BugIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  MailIcon,
  MinusIcon,
  MoreHorizontalIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  Share2Icon,
  SunIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { ThemeMode } from "@/lib/tokens/default-theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

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

const PAYMENTS = [
  { customer: "Sofia Davis", email: "sofia@example.com", status: "Paid", amount: "$1,999.00" },
  { customer: "Jackson Lee", email: "jackson@example.com", status: "Pending", amount: "$39.00" },
  { customer: "Isabella Nguyen", email: "isabella@example.com", status: "Paid", amount: "$299.00" },
  { customer: "William Kim", email: "william@example.com", status: "Failed", amount: "$99.00" },
] as const;

const REVENUE_DATA = [
  { day: "Mon", value: 1860 },
  { day: "Tue", value: 3050 },
  { day: "Wed", value: 2370 },
  { day: "Thu", value: 2180 },
  { day: "Fri", value: 2360 },
  { day: "Sat", value: 2890 },
  { day: "Sun", value: 5320 },
] as const;

const SUBSCRIPTION_DATA = [
  { day: "Mon", value: 1200 },
  { day: "Tue", value: 1480 },
  { day: "Wed", value: 2130 },
  { day: "Thu", value: 2910 },
  { day: "Fri", value: 1510 },
  { day: "Sat", value: 2670 },
  { day: "Sun", value: 1740 },
] as const;

const EXERCISE_DATA = [
  { day: "Mon", planned: 38, actual: 42, average: 28 },
  { day: "Tue", planned: 31, actual: 34, average: 24 },
  { day: "Wed", planned: 86, actual: 92, average: 30 },
  { day: "Thu", planned: 43, actual: 48, average: 27 },
  { day: "Fri", planned: 51, actual: 55, average: 29 },
  { day: "Sat", planned: 42, actual: 47, average: 26 },
  { day: "Sun", planned: 48, actual: 54, average: 32 },
] as const;

const MOVE_GOAL_DATA = [
  { time: "6a", calories: 245 },
  { time: "8a", calories: 180 },
  { time: "10a", calories: 305 },
  { time: "12p", calories: 230 },
  { time: "2p", calories: 265 },
  { time: "4p", calories: 220 },
  { time: "6p", calories: 295 },
  { time: "8p", calories: 250 },
] as const;

const TRAFFIC_CHANNEL_DATA = [
  { month: "Jan", desktop: 72, mobile: 54 },
  { month: "Feb", desktop: 96, mobile: 58 },
  { month: "Mar", desktop: 78, mobile: 84 },
  { month: "Apr", desktop: 48, mobile: 70 },
  { month: "May", desktop: 76, mobile: 62 },
  { month: "Jun", desktop: 80, mobile: 64 },
] as const;

const PALETTE_SWATCHES = [
  { label: "background", token: "var(--background)" },
  { label: "foreground", token: "var(--foreground)" },
  { label: "primary", token: "var(--primary)" },
  { label: "secondary", token: "var(--secondary)" },
  { label: "muted", token: "var(--muted)" },
  { label: "accent", token: "var(--accent)" },
  { label: "border", token: "var(--border)" },
  { label: "chart-1", token: "var(--chart-1)" },
  { label: "chart-2", token: "var(--chart-2)" },
  { label: "chart-3", token: "var(--chart-3)" },
  { label: "chart-4", token: "var(--chart-4)" },
  { label: "chart-5", token: "var(--chart-5)" },
] as const;

const ACTION_ICONS = [
  ClipboardIcon,
  BellIcon,
  CopyIcon,
  Share2Icon,
  MailIcon,
  MoreHorizontalIcon,
  MinusIcon,
  SearchIcon,
  SettingsIcon,
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
] as const;

const REVENUE_CHART_CONFIG = {
  value: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const SUBSCRIPTION_CHART_CONFIG = {
  value: {
    label: "Subscriptions",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const EXERCISE_CHART_CONFIG = {
  actual: {
    label: "Actual",
    color: "var(--chart-1)",
  },
  planned: {
    label: "Planned",
    color: "var(--chart-2)",
  },
  average: {
    label: "Average",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const MOVE_GOAL_CHART_CONFIG = {
  calories: {
    label: "Calories",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const TRAFFIC_CHART_CONFIG = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const CALENDAR_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const CALENDAR_DATES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
] as const;

const DASHBOARD_SCENES = ["custom", "cards", "dashboard"] as const satisfies readonly PreviewSceneId[];

type PaymentStatus = (typeof PAYMENTS)[number]["status"];

type CalendarCell = Readonly<{
  key: string;
  label: string;
  isSelected: boolean;
  isMuted: boolean;
}>;

const CALENDAR_CELLS = createCalendarCells();

function createCalendarCells(): readonly CalendarCell[] {
  const leadingCells = ["26", "27", "28", "29", "30", "31"].map((label) => ({
    key: `prev-${label}`,
    label,
    isSelected: false,
    isMuted: true,
  }));
  const currentCells = CALENDAR_DATES.map((label) => ({
    key: `current-${label}`,
    label,
    isSelected: label === "13",
    isMuted: false,
  }));

  return [...leadingCells, ...currentCells];
}

function isDashboardScene(scene: PreviewSceneId): boolean {
  return DASHBOARD_SCENES.some((dashboardScene) => dashboardScene === scene);
}

function getPaymentVariant(status: PaymentStatus): "secondary" | "outline" | "destructive" {
  if (status === "Paid") {
    return "secondary";
  }

  if (status === "Failed") {
    return "destructive";
  }

  return "outline";
}

function formatChartTick(value: string | number): string {
  return String(value);
}

export function PreviewCanvas({ mode, previewStyle, onModeChange }: PreviewCanvasProps) {
  const [scene, setScene] = useState<PreviewSceneId>("dashboard");
  const previewFrameWidth = getPreviewFrameWidth(scene);

  function handleSceneChange(value: string | number | null): void {
    if (!isPreviewSceneId(value)) {
      throw new Error(`Unknown preview scene "${String(value)}".`);
    }

    setScene(value);
  }

  return (
    <section className="tweak-chrome flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/40">
      <div className="flex shrink-0 flex-col gap-3 border-b bg-background/80 p-3 backdrop-blur md:flex-row md:items-center md:justify-between">
        <Tabs value={scene} onValueChange={handleSceneChange} className="min-w-0 flex-1">
          <TabsList className="max-w-full justify-start overflow-x-auto">
            {PREVIEW_SCENES.map((previewScene) => (
              <TabsTrigger key={previewScene.id} value={previewScene.id}>
                {previewScene.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex shrink-0 items-center gap-2">
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

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain p-4 md:p-6">
        <div
          className="mx-auto rounded-2xl border bg-background p-4 shadow-sm md:p-6"
          style={{ width: previewFrameWidth, minWidth: previewFrameWidth }}
        >
          <div className={mode === "dark" ? "dark" : ""} style={previewStyle}>
            <div
              className="min-h-[720px] rounded-xl border bg-background p-4 text-foreground shadow-xs md:p-6"
              style={{
                fontFamily: "var(--font-sans)",
                letterSpacing: "var(--tracking-normal)",
              }}
            >
              {scene === "custom" || scene === "dashboard" ? <DashboardPreview /> : null}
              {scene === "cards" ? <CardsPreview /> : null}
              {!isDashboardScene(scene) && scene !== "cards" ? <ComingSoonScene scene={scene} /> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getPreviewFrameWidth(scene: PreviewSceneId): string {
  if (scene === "cards") {
    return "1180px";
  }

  if (isDashboardScene(scene)) {
    return "1120px";
  }

  return "100%";
}

function DashboardPreview() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Full components, charts, forms, and tables using the edited tokens.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <DownloadIcon data-icon="inline-start" />
            Download
          </Button>
          <Button size="sm">Create report</Button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr_0.7fr_0.7fr] gap-4">
        <RevenueMetricCard />
        <SubscriptionsAreaCard />
        <CalendarCard />
        <MoveGoalCard />
      </div>

      <div className="grid grid-cols-[1.15fr_0.85fr] gap-4">
        <ExerciseMinutesCard />
        <div className="grid grid-cols-1 gap-4">
          <UpgradeSubscriptionCard />
          <CreateAccountCard />
        </div>
      </div>

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-4">
        <PaymentsCard />
        <SupportCard />
      </div>
    </div>
  );
}

function CardsPreview() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold">Cards</h2>
        <p className="text-sm text-muted-foreground">A dense gallery for validating color, radius, spacing, fonts, controls, and charts.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col gap-4">
          <PaletteCard />
          <TypographySampleCard />
          <EmptyStateGalleryCard />
        </div>
        <div className="flex flex-col gap-4">
          <IconActionGridCard />
          <AuthSettingsCard />
          <AnnouncementCard />
        </div>
        <div className="flex flex-col gap-4">
          <EnvironmentVariablesCard />
          <TrafficChannelsCard />
          <InviteTeamCard />
        </div>
        <div className="flex flex-col gap-4">
          <SkeletonPreviewCard />
          <BrowserShareCard />
          <ReportBugCard />
        </div>
      </div>
    </div>
  );
}

function RevenueMetricCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Revenue</CardTitle>
        <CardDescription>+20.1% from last month</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-3xl font-semibold tabular-nums">$15,231.89</div>
        <ChartContainer config={REVENUE_CHART_CONFIG} className="h-28 w-full">
          <RechartsLineChart data={REVENUE_DATA} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2.5} dot={{ r: 3 }} />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          </RechartsLineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function SubscriptionsAreaCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriptions</CardTitle>
        <CardDescription>+180.1% from last month</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-3xl font-semibold tabular-nums">+2,350</div>
        <ChartContainer config={SUBSCRIPTION_CHART_CONFIG} className="h-28 w-full">
          <AreaChart data={SUBSCRIPTION_DATA} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="subscription-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area dataKey="value" type="monotone" fill="url(#subscription-fill)" stroke="var(--color-value)" strokeWidth={2.5} />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function UpgradeSubscriptionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade your subscription</CardTitle>
        <CardDescription>Access all features with a Pro plan.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="upgrade-name">Name</Label>
            <Input id="upgrade-name" value="Evil Rabbit" readOnly />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="upgrade-email">Email</Label>
            <Input id="upgrade-email" value="example@acme.com" readOnly />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_0.65fr_0.55fr]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input id="card-number" value="1234 1234 1234 1234" readOnly />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="card-expiry">MM/YY</Label>
            <Input id="card-expiry" value="08 / 29" readOnly />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="card-cvc">CVC</Label>
            <Input id="card-cvc" value="123" readOnly />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="font-medium">Starter Plan</div>
            <p className="text-xs text-muted-foreground">Perfect for small businesses.</p>
          </div>
          <div className="rounded-lg border bg-primary text-primary-foreground p-3">
            <div className="font-medium">Pro Plan</div>
            <p className="text-xs opacity-80">More features and storage.</p>
          </div>
        </div>
        <Textarea aria-label="Notes" value="Priority onboarding and annual invoice." readOnly />
      </CardContent>
    </Card>
  );
}

function CalendarCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDaysIcon data-icon="inline-start" />
          June 2025
        </CardTitle>
        <CardDescription>Weekly planning overview.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-7 gap-1 text-center text-xs">
        {CALENDAR_DAYS.map((day) => (
          <div key={day} className="text-muted-foreground">
            {day}
          </div>
        ))}
        {CALENDAR_CELLS.map((cell) => (
          <div
            key={cell.key}
            className="rounded-md py-2 text-center data-[muted=true]:text-muted-foreground data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
            data-muted={cell.isMuted}
            data-selected={cell.isSelected}
          >
            {cell.label}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MoveGoalCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Move Goal</CardTitle>
        <CardDescription>Set your daily activity target.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-5">
          <Button variant="outline" size="icon-sm" aria-label="Decrease move goal">
            <MinusIcon />
          </Button>
          <div className="text-center">
            <div className="text-3xl font-semibold tabular-nums">350</div>
            <div className="text-[0.65rem] uppercase text-muted-foreground">Calories/day</div>
          </div>
          <Button variant="outline" size="icon-sm" aria-label="Increase move goal">
            <PlusIcon />
          </Button>
        </div>
        <ChartContainer config={MOVE_GOAL_CHART_CONFIG} className="h-24 w-full">
          <BarChart data={MOVE_GOAL_DATA} margin={{ left: 4, right: 4, top: 8, bottom: 8 }}>
            <Bar dataKey="calories" fill="var(--color-calories)" radius={5} />
          </BarChart>
        </ChartContainer>
        <Button variant="secondary" size="sm">Set Goal</Button>
      </CardContent>
    </Card>
  );
}

function ExerciseMinutesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Minutes</CardTitle>
        <CardDescription>Your exercise minutes are ahead of your normal pace.</CardDescription>
        <CardAction>
          <Badge variant="secondary">
            <TrendingUpIcon data-icon="inline-start" />
            12%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={EXERCISE_CHART_CONFIG} className="h-72 w-full">
          <RechartsLineChart data={EXERCISE_DATA} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickFormatter={formatChartTick} />
            <YAxis hide domain={[0, 100]} />
            <Line dataKey="planned" type="monotone" stroke="var(--color-planned)" strokeWidth={2} dot={false} />
            <Line dataKey="actual" type="monotone" stroke="var(--color-actual)" strokeWidth={3} dot={{ r: 3 }} />
            <Line dataKey="average" type="monotone" stroke="var(--color-average)" strokeWidth={2} dot={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
          </RechartsLineChart>
        </ChartContainer>
      </CardContent>
    </Card>
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
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PAYMENTS.map((payment) => (
              <TableRow key={payment.email}>
                <TableCell>
                  <Badge variant={getPaymentVariant(payment.status)}>{payment.status}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{payment.email}</TableCell>
                <TableCell className="font-medium">{payment.customer}</TableCell>
                <TableCell className="text-right tabular-nums">{payment.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CreateAccountCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your email below to create your account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-2 md:grid-cols-2">
          <Button variant="outline" size="sm">GitHub</Button>
          <Button variant="outline" size="sm">Google</Button>
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          <Label htmlFor="account-email">Email</Label>
          <Input id="account-email" value="m@example.com" readOnly />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="account-password">Password</Label>
          <Input id="account-password" type="password" value="correct-horse" readOnly />
        </div>
        <Button>Create account</Button>
      </CardContent>
    </Card>
  );
}

function SupportCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace assistant</CardTitle>
        <CardDescription>Contextual support card using muted and primary surfaces.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">S</div>
          <div className="text-sm">
            <div className="font-medium">Sofia Davis</div>
            <p className="text-muted-foreground">Hi, how can I help you today?</p>
          </div>
        </div>
        <Input aria-label="Support reply" value="Ask about plan limits..." readOnly />
      </CardContent>
    </Card>
  );
}

function PaletteCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova - Inter</CardTitle>
        <CardDescription>Designers love packing quick glyphs into test phrases.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-6 gap-2">
        {PALETTE_SWATCHES.map((swatch) => (
          <div key={swatch.label} className="flex flex-col gap-1">
            <div className="aspect-square rounded-lg border" style={{ backgroundColor: swatch.token }} />
            <div className="truncate font-mono text-[0.6rem] text-muted-foreground">--{swatch.label}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TypographySampleCard() {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="font-mono text-[0.65rem] uppercase">Inherit - Inter</CardDescription>
        <CardTitle className="text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
          Designing with rhythm and hierarchy.
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          A strong body style keeps long-form content readable and balances the visual weight of headings.
        </p>
        <p className="font-mono text-xs text-muted-foreground">font-mono token: ABC 123 xyz</p>
        <Button variant="outline" size="sm">Share Feedback</Button>
      </CardContent>
    </Card>
  );
}

function IconActionGridCard() {
  return (
    <Card>
      <CardContent className="grid grid-cols-6 gap-2 pt-0">
        {ACTION_ICONS.map((Icon, index) => (
          <Button key={index} variant="outline" size="icon-sm" aria-label={`Action ${index + 1}`}>
            <Icon />
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function AuthSettingsCard() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-0">
        <div className="flex gap-2">
          <Button size="sm">Button</Button>
          <Button variant="secondary" size="sm">Secondary</Button>
          <Button variant="outline" size="sm">Outline</Button>
          <Button variant="ghost" size="sm">Ghost</Button>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <div className="font-medium">Two-factor authentication</div>
            <p className="text-xs text-muted-foreground">Verify via email or phone number.</p>
          </div>
          <Button variant="outline" size="sm">Enable</Button>
        </div>
        <Input aria-label="Name" value="Name" readOnly />
        <Textarea aria-label="Message" value="Message" readOnly />
        <div className="flex flex-wrap gap-2">
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Button variant="outline" size="icon-sm" aria-label="Selected">
            <CheckIcon />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AnnouncementCard() {
  return (
    <Card className="pt-0">
      <div className="h-36 bg-[radial-gradient(circle_at_30%_30%,var(--chart-1),transparent_35%),linear-gradient(135deg,var(--muted),var(--primary))]" />
      <CardHeader>
        <CardTitle>Observability Plus is replacing Monitoring</CardTitle>
        <CardDescription>Switch to the improved way to explore data, with natural language and clearer reports.</CardDescription>
      </CardHeader>
      <CardFooter className="justify-between">
        <Button size="sm">Create Query</Button>
        <Badge variant="outline">Warning</Badge>
      </CardFooter>
    </Card>
  );
}

function EnvironmentVariablesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Variables</CardTitle>
        <CardDescription>Production - 8 variables</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <EnvRow name="DATABASE_URL" value="********" />
        <EnvRow name="NEXT_PUBLIC_API" value="https://api.example.com" />
        <EnvRow name="STRIPE_SECRET" value="************" />
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost" size="sm">Edit</Button>
        <Button size="sm">Deploy</Button>
      </CardFooter>
    </Card>
  );
}

function EnvRow({ name, value }: Readonly<{ name: string; value: string }>) {
  return (
    <div className="grid grid-cols-[0.75fr_1fr] items-center gap-2 rounded-md border bg-background px-2 py-1.5 font-mono text-xs">
      <span className="truncate font-semibold">{name}</span>
      <span className="truncate text-muted-foreground">{value}</span>
    </div>
  );
}

function TrafficChannelsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic channels</CardTitle>
        <CardDescription>Monthly desktop and mobile traffic for the last six months.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ChartContainer config={TRAFFIC_CHART_CONFIG} className="h-40 w-full">
          <BarChart data={TRAFFIC_CHANNEL_DATA} margin={{ left: 4, right: 4, top: 8, bottom: 8 }}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={formatChartTick} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
            <ChartTooltip content={<ChartTooltipContent />} />
          </BarChart>
        </ChartContainer>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <MetricPill label="Desktop" value="1,224" />
          <MetricPill label="Mobile" value="860" />
          <MetricPill label="Mix Delta" value="+42%" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="sm">View report</Button>
      </CardFooter>
    </Card>
  );
}

function MetricPill({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-lg bg-muted p-2">
      <div className="text-[0.6rem] uppercase text-muted-foreground">{label}</div>
      <div className="font-mono font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function BrowserShareCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Browser Share</CardTitle>
        <CardDescription>January - June 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <RingChart />
        <div className="grid w-full gap-2 text-xs">
          <ShareRow label="Firefox" value="68%" />
          <ShareRow label="Chrome" value="52%" />
          <ShareRow label="Edge" value="31%" />
        </div>
      </CardContent>
    </Card>
  );
}

function RingChart() {
  return (
    <svg viewBox="0 0 120 120" className="size-32">
      <circle cx="60" cy="60" r="42" fill="none" stroke="var(--muted)" strokeWidth="14" />
      <circle cx="60" cy="60" r="42" fill="none" stroke="var(--chart-1)" strokeDasharray="190 264" strokeLinecap="round" strokeWidth="14" transform="rotate(-90 60 60)" />
      <circle cx="60" cy="60" r="28" fill="none" stroke="var(--chart-3)" strokeDasharray="110 176" strokeLinecap="round" strokeWidth="10" transform="rotate(-35 60 60)" />
      <text x="60" y="58" textAnchor="middle" className="fill-foreground text-xl font-semibold">935</text>
      <text x="60" y="76" textAnchor="middle" className="fill-muted-foreground text-[0.6rem]">Visitors</text>
    </svg>
  );
}

function ShareRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: value }} />
      </div>
    </div>
  );
}

function InviteTeamCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team</CardTitle>
        <CardDescription>Add members to your workspace.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <InviteRow email="alex@example.com" role="Editor" />
        <InviteRow email="sam@example.com" role="Viewer" />
        <Button variant="outline" size="sm">
          <PlusIcon data-icon="inline-start" />
          Add another
        </Button>
        <Separator />
        <Input aria-label="Invite link" value="https://app.co/invite/x8f2k" readOnly />
      </CardContent>
    </Card>
  );
}

function InviteRow({ email, role }: Readonly<{ email: string; role: string }>) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <Input aria-label={`${email} invite email`} value={email} readOnly />
      <Button variant="outline" size="sm">
        {role}
        <ChevronDownIcon data-icon="inline-end" />
      </Button>
    </div>
  );
}

function EmptyStateGalleryCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Codespaces</CardTitle>
        <CardDescription>Your workspaces in the cloud.</CardDescription>
      </CardHeader>
      <CardContent>
        <Empty className="min-h-52 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardIcon />
            </EmptyMedia>
            <EmptyTitle>No codespaces</EmptyTitle>
            <EmptyDescription>You do not have any codespaces with this repository checked out.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Create Codespace</Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  );
}

function SkeletonPreviewCard() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-muted" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3 rounded-full bg-muted" />
            <div className="h-3 w-3/4 rounded-full bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 rounded-lg bg-muted" />
          <div className="h-10 rounded-lg bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

function ReportBugCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BugIcon data-icon="inline-start" />
          Report Bug
        </CardTitle>
        <CardDescription>Help us fix issues faster.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="bug-title">Title</Label>
          <Input id="bug-title" value="Brief description" readOnly />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bug-message">Details</Label>
          <Textarea id="bug-message" value="What happened, what you expected, and any logs." readOnly />
        </div>
        <Button size="sm">Send report</Button>
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
