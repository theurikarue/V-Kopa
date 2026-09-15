"use client";

import { AlertTriangle, Check, TrendingDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatKES } from "@/lib/hp";
import type { HPSchedule, Frequency } from "@/lib/hp";
import { HP_PRODUCTS } from "@/lib/mock-data";
import type { HPProduct, OriginationDraft } from "@/lib/types";
import { StepHeading } from "./step-heading";

const TENOR_CHOICES: Record<Frequency, number[]> = {
  daily: [30, 45, 60, 90, 120],
  weekly: [91, 182, 273, 364],
};

export function StepTerms({
  draft,
  patch,
  schedule,
}: {
  draft: OriginationDraft;
  patch: (p: Partial<OriginationDraft>) => void;
  schedule: HPSchedule | null;
}) {
  const product = draft.product;
  if (!product || !draft.device || !schedule) return null;

  const minPct = Math.round(product.minDepositRatio * 100);
  const depositPct = Math.round(draft.depositRatio * 100);
  const overTicket = draft.device.cashPrice > product.maxTicketSize;

  // Affordability: instalments are compared against declared income at a
  // 40% ceiling. Casual earners get measured on a daily basis, not monthly.
  const monthlyIncome = Number(draft.kyc.monthlyIncome || 0);
  const monthlyOutlay =
    draft.frequency === "daily"
      ? schedule.instalmentAmount * 30
      : schedule.instalmentAmount * 4.33;
  const burden = monthlyIncome > 0 ? monthlyOutlay / monthlyIncome : null;

  const selectProduct = (p: HPProduct) =>
    patch({
      product: p,
      frequency: p.frequency,
      tenorDays: p.tenorDays,
      gracePeriodDays: p.gracePeriodDays,
      depositRatio: Math.max(draft.depositRatio, p.minDepositRatio),
    });

  return (
    <section className="space-y-6">
      <StepHeading
        title="Set the repayment terms"
        description="Figures on the right update as you move these. Show the customer that panel — the daily figure is what closes the sale."
      />

      {/* Product */}
      <div className="grid gap-3 sm:grid-cols-2">
        {HP_PRODUCTS.map((p) => {
          const selected = product.id === p.id;
          const blocked = draft.device!.cashPrice > p.maxTicketSize;
          return (
            <button
              key={p.id}
              type="button"
              disabled={blocked}
              onClick={() => selectProduct(p)}
              aria-pressed={selected}
              className={cn(
                "rounded-xl border bg-card p-4 text-left transition-colors",
                selected
                  ? "border-[hsl(var(--vivo-blue))] ring-1 ring-[hsl(var(--vivo-blue))]"
                  : "hover:border-foreground/25",
                blocked && "opacity-45"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{p.name}</p>
                {selected ? (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[hsl(var(--vivo-blue))]">
                    <Check className="size-3 text-white" />
                  </span>
                ) : p.popular ? (
                  <Badge variant="secondary" className="font-normal">Most taken</Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
              <p className="mt-3 text-xs text-muted-foreground tnum">
                {p.frequency === "daily" ? "Daily" : "Weekly"} · {p.tenorDays} days ·
                from {Math.round(p.minDepositRatio * 100)}% deposit ·{" "}
                {p.monthlyServiceRate}% per 30 days
              </p>
              {blocked && (
                <p className="mt-2 text-xs text-[hsl(var(--arrears))]">
                  Caps at {formatKES(p.maxTicketSize)} — this device is above the limit
                </p>
              )}
            </button>
          );
        })}
      </div>

      {overTicket && (
        <div className="flex items-start gap-2 rounded-lg bg-[hsl(var(--arrears))]/10 p-4 text-sm text-[hsl(var(--arrears))]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            {draft.device.model} at {formatKES(draft.device.cashPrice)} exceeds the{" "}
            {formatKES(product.maxTicketSize)} limit on {product.name}. Move to the
            Flagship Plan or take a larger deposit on a different product.
          </p>
        </div>
      )}

      {/* Deposit */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Label htmlFor="deposit" className="text-base font-medium">Deposit</Label>
          <p className="text-sm text-muted-foreground tnum">
            <span className="text-xl font-semibold text-foreground">{depositPct}%</span>
            {" · "}
            {formatKES(schedule.deposit)} today
          </p>
        </div>

        <Slider
          id="deposit"
          className="mt-5"
          min={minPct}
          max={60}
          step={5}
          value={[depositPct]}
          onValueChange={([v]) => patch({ depositRatio: v / 100 })}
          aria-label="Deposit percentage"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground tnum">
          <span>{minPct}% policy floor</span>
          <span>60%</span>
        </div>

        <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <TrendingDown className="mt-0.5 size-4 shrink-0" />
          Every 5% added here cuts roughly{" "}
          <span className="font-medium text-foreground tnum">
            {formatKES(Math.round((draft.device.cashPrice * 0.05) / schedule.instalmentCount))}
          </span>{" "}
          off each {draft.frequency === "daily" ? "day" : "week"} and lowers the risk band.
        </p>
      </div>

      {/* Frequency + tenor */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <Label className="text-base font-medium">Repayment rhythm</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            Match how the customer earns, not the calendar.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Repayment frequency">
            {(["daily", "weekly"] as const).map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={draft.frequency === f}
                onClick={() =>
                  patch({ frequency: f, tenorDays: TENOR_CHOICES[f][1] })
                }
                className={cn(
                  "rounded-lg border px-3 py-3 text-sm transition-colors",
                  draft.frequency === f
                    ? "border-[hsl(var(--vivo-blue))] bg-[hsl(var(--vivo-blue))]/5 font-medium text-[hsl(var(--vivo-blue))]"
                    : "hover:border-foreground/25"
                )}
              >
                <span className="block capitalize">{f}</span>
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  {f === "daily" ? "Boda, mama mboga, hustle" : "Salaried, shop owners"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <Label className="text-base font-medium">Tenor</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            {schedule.instalmentCount} payments, ending{" "}
            {schedule.finalDueDate.toLocaleDateString("en-KE", { day: "numeric", month: "short" })}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {TENOR_CHOICES[draft.frequency].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => patch({ tenorDays: t })}
                aria-pressed={draft.tenorDays === t}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm tnum transition-colors",
                  draft.tenorDays === t
                    ? "border-[hsl(var(--vivo-blue))] bg-[hsl(var(--vivo-blue))]/5 font-medium text-[hsl(var(--vivo-blue))]"
                    : "hover:border-foreground/25"
                )}
              >
                {draft.frequency === "weekly" ? `${Math.round(t / 7)} weeks` : `${t} days`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grace */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Label htmlFor="grace" className="text-base font-medium">Grace period</Label>
          <p className="text-sm tnum">
            <span className="text-xl font-semibold">{draft.gracePeriodDays}</span>
            <span className="text-muted-foreground"> days before the first payment</span>
          </p>
        </div>
        <Slider
          id="grace"
          className="mt-5"
          min={0}
          max={30}
          step={1}
          value={[draft.gracePeriodDays]}
          onValueChange={([v]) => patch({ gracePeriodDays: v })}
          aria-label="Grace period in days"
        />
        <p className="mt-3 text-sm text-muted-foreground">
          No dunning message, no lock command, and no arrears flag inside this window.
          Sales teams use 7 days when a customer is between paydays.
        </p>
      </div>

      {/* Affordability */}
      {burden !== null && (
        <div
          className={cn(
            "rounded-xl border p-5",
            burden > 0.4
              ? "border-[hsl(var(--arrears))]/30 bg-[hsl(var(--arrears))]/[0.06]"
              : "bg-card"
          )}
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-medium">Affordability</p>
            <p className="text-sm tnum">
              <span
                className={cn(
                  "text-xl font-semibold",
                  burden > 0.4 && "text-[hsl(var(--arrears))]"
                )}
              >
                {Math.round(burden * 100)}%
              </span>
              <span className="text-muted-foreground"> of declared income</span>
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-300",
                burden > 0.4 ? "bg-[hsl(var(--arrears))]" : "bg-[hsl(var(--mpesa))]"
              )}
              style={{ width: `${Math.min(100, burden * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {burden > 0.4
              ? `${formatKES(Math.round(monthlyOutlay))} a month against declared income of ${formatKES(monthlyIncome)}. Raise the deposit or stretch the tenor before this goes to credit.`
              : `${formatKES(Math.round(monthlyOutlay))} a month against declared income of ${formatKES(monthlyIncome)}. Inside the 40% ceiling.`}
          </p>
        </div>
      )}
    </section>
  );
}
