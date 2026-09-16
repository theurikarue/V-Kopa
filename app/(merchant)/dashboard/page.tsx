"use client";

import Link from "next/link";
import {
  ArrowUpRight, ArrowDownRight, Plus, Lock, ShieldCheck, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shell/merchant-shell";
import { cn } from "@/lib/utils";
import { formatKES, prettyMsisdn } from "@/lib/hp";
import {
  BRANCH_METRICS as M, COLLECTION_TREND, CUSTOMERS, RECENT_ACTIVITY,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const arrears = CUSTOMERS.filter((c) => c.status === "arrears").sort(
    (a, b) => b.daysPastDue - a.daysPastDue
  );

  return (
    <>
      <PageHeader
        title="Today at Moi Avenue"
        description="Month-to-date performance for this branch. Collections refresh as M-Pesa callbacks land."
        action={
          <Button asChild size="lg">
            <Link href="/origination">
              <Plus className="mr-2 size-4" />
              New contract
            </Link>
          </Button>
        }
      />

      <div className="space-y-6 px-5 py-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Collected today"
            value={formatKES(M.collectedTodayKes)}
            sub={`${Math.round(M.collectionRate * 100)}% of what was due`}
            trend={COLLECTION_TREND}
          />
          <Metric
            label="Contracts written"
            value={String(M.contractsMtd)}
            sub="this month"
            delta={M.contractsMtdDelta}
          />
          <Metric
            label="Value disbursed"
            value={formatKES(M.disbursedValueMtd)}
            sub="this month"
            delta={M.disbursedValueDelta}
          />
          <Metric
            label="Portfolio at risk"
            value={`${(M.portfolioAtRisk * 100).toFixed(1)}%`}
            sub={`${M.arrearsContracts} contracts behind`}
            delta={-1.2}
            invertDelta
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Arrears queue — the merchant's actual work list */}
          <section className="rounded-xl border bg-card">
            <header className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-medium">Behind on payments</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Call these before the system locks them.
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/customers">
                  All customers
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </header>

            {arrears.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                Nobody is behind today. Go write a contract.
              </p>
            ) : (
              <ul className="divide-y">
                {arrears.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.fullName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground tnum">
                        {prettyMsisdn(c.msisdn)} · {c.county}
                      </p>
                    </div>
                    <p className="text-sm tnum">
                      <span className="font-semibold">{formatKES(c.outstanding)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {c.daysPastDue} days late
                      </span>
                    </p>
                    <LockBadge state={c.vtrust} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="space-y-6">
            {/* VTrust estate */}
            <section className="rounded-xl border bg-card p-5">
              <h2 className="font-medium">Device locks</h2>
              <dl className="mt-4 space-y-3">
                <EstateRow
                  icon={<Lock className="size-4 text-[hsl(var(--arrears))]" />}
                  label="Locked for arrears"
                  value={M.devicesLocked}
                />
                <EstateRow
                  icon={<ShieldCheck className="size-4 text-[hsl(var(--statute))]" />}
                  label="Past two-thirds, lock retired"
                  value={M.lockProtected}
                />
                <EstateRow
                  icon={<span className="size-2 rounded-full bg-[hsl(var(--mpesa))]" />}
                  label="Active and current"
                  value={M.activeContracts - M.devicesLocked - M.lockProtected}
                />
              </dl>
              <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
                Locks fire 24 hours after a missed instalment and lift within a minute
                of payment. Cap 507 blocks the command past two-thirds.
              </p>
            </section>

            <section className="rounded-xl border bg-card p-5">
              <h2 className="font-medium">Activity</h2>
              <ul className="mt-4 space-y-3.5">
                {RECENT_ACTIVITY.map((a) => (
                  <li key={a.id} className="flex gap-3 text-sm">
                    <span className="w-10 shrink-0 pt-0.5 text-xs text-muted-foreground tnum">
                      {a.at}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        a.tone === "positive" && "bg-[hsl(var(--mpesa))]",
                        a.tone === "warning" && "bg-[hsl(var(--arrears))]",
                        a.tone === "protected" && "bg-[hsl(var(--statute))]",
                        a.tone === "neutral" && "bg-border"
                      )}
                    />
                    <span className="min-w-0 leading-snug text-muted-foreground">{a.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function Metric({
  label, value, sub, delta, invertDelta, trend,
}: {
  label: string; value: string; sub: string;
  delta?: number; invertDelta?: boolean; trend?: number[];
}) {
  const good = delta === undefined ? null : invertDelta ? delta < 0 : delta > 0;
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-[26px] font-semibold leading-none tnum">{value}</p>
      <div className="mt-2.5 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium tnum",
              good ? "text-[hsl(var(--mpesa))]" : "text-[hsl(var(--arrears))]"
            )}
          >
            {delta > 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        <span className="text-muted-foreground">{sub}</span>
      </div>
      {trend && <Sparkline data={trend} />}
    </div>
  );
}

/** Inline SVG so the demo carries no charting dependency. */
function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / span) * 26}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-3 h-8 w-full" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke="hsl(var(--mpesa))"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EstateRow({
  icon, label, value,
}: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted">{icon}</span>
      <dt className="min-w-0 flex-1 text-sm text-muted-foreground">{label}</dt>
      <dd className="font-semibold tnum">{value}</dd>
    </div>
  );
}

export function LockBadge({ state }: { state: string }) {
  if (state === "locked")
    return (
      <Badge className="border-transparent bg-[hsl(var(--arrears))]/12 font-normal text-[hsl(var(--arrears))] hover:bg-[hsl(var(--arrears))]/12">
        <Lock className="mr-1 size-3" />
        Locked
      </Badge>
    );
  if (state === "lock_blocked")
    return (
      <Badge className="border-transparent bg-[hsl(var(--statute))]/12 font-normal text-[hsl(var(--statute))] hover:bg-[hsl(var(--statute))]/12">
        <ShieldCheck className="mr-1 size-3" />
        Lock retired
      </Badge>
    );
  if (state === "released")
    return <Badge variant="secondary" className="font-normal">Owned outright</Badge>;
  return (
    <Badge className="border-transparent bg-[hsl(var(--mpesa))]/12 font-normal text-[hsl(var(--mpesa))] hover:bg-[hsl(var(--mpesa))]/12">
      Active
    </Badge>
  );
}
