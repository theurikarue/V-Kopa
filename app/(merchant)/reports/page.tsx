"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shell/merchant-shell";
import { cn } from "@/lib/utils";
import { formatKES } from "@/lib/hp";
import { COLLECTION_TREND } from "@/lib/mock-data";

const RANGES = ["Today", "This week", "This month", "Last 90 days"] as const;

/** Ageing buckets are the ones the credit committee reviews weekly. */
const AGEING = [
  { bucket: "Current", contracts: 976, value: 8_940_200, tone: "good" },
  { bucket: "1–7 days", contracts: 38, value: 412_600, tone: "warn" },
  { bucket: "8–30 days", contracts: 19, value: 268_400, tone: "warn" },
  { bucket: "31–60 days", contracts: 6, value: 121_900, tone: "bad" },
  { bucket: "60+ days", contracts: 3, value: 74_300, tone: "bad" },
] as const;

const SETTLEMENT = [
  { label: "Gross device margin", value: 486_300 },
  { label: "Agent commission earned", value: 96_400 },
  { label: "Refunds and cancellations", value: -18_750 },
  { label: "Net due to this branch", value: 563_950, strong: true },
];

export default function ReportsPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("This month");
  const totalValue = AGEING.reduce((a, b) => a + b.value, 0);
  const peak = Math.max(...COLLECTION_TREND);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Branch figures only. Portfolio-wide analytics live in the Backoffice."
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileSpreadsheet className="mr-2 size-4" />
              Export CSV
            </Button>
            <Button variant="outline">
              <Download className="mr-2 size-4" />
              PDF
            </Button>
          </div>
        }
      />

      <div className="space-y-6 px-5 py-6 lg:px-8">
        <div className="flex gap-1.5 overflow-x-auto">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={cn(
                "whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-colors",
                range === r
                  ? "border-[hsl(var(--vivo-blue))] bg-[hsl(var(--vivo-blue))]/5 font-medium text-[hsl(var(--vivo-blue))]"
                  : "hover:border-foreground/25"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-medium">Collections, last 14 days</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Sundays dip — the plan assumes it, dunning skips it.
          </p>
          <div className="mt-6 flex h-40 items-end gap-1.5" role="img" aria-label="Daily collections bar chart">
            {COLLECTION_TREND.map((v, i) => (
              <div key={i} className="group relative flex-1">
                <div
                  className="rounded-t bg-[hsl(var(--mpesa))]/75 transition-colors group-hover:bg-[hsl(var(--mpesa))]"
                  style={{ height: `${(v / peak) * 160}px` }}
                />
                <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[hsl(var(--ink))] px-2 py-1 text-[11px] text-white tnum group-hover:block">
                  {formatKES(v)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground tnum">
            14-day total {formatKES(COLLECTION_TREND.reduce((a, b) => a + b, 0))}
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-medium">Ageing</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatKES(totalValue)} outstanding across 1,042 contracts.
            </p>
            <ul className="mt-5 space-y-3.5">
              {AGEING.map((a) => (
                <li key={a.bucket}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{a.bucket}</span>
                    <span className="tnum">
                      {formatKES(a.value)}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {a.contracts}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        a.tone === "good" && "bg-[hsl(var(--mpesa))]",
                        a.tone === "warn" && "bg-[hsl(var(--arrears))]/70",
                        a.tone === "bad" && "bg-[hsl(var(--arrears))]"
                      )}
                      style={{ width: `${(a.value / totalValue) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-medium">Settlement</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Paid to Equity ****4471 on the 5th of next month.
            </p>
            <dl className="mt-5 divide-y">
              {SETTLEMENT.map((s) => (
                <div
                  key={s.label}
                  className="flex items-baseline justify-between gap-3 py-3 text-sm"
                >
                  <dt className={s.strong ? "font-medium" : "text-muted-foreground"}>
                    {s.label}
                  </dt>
                  <dd
                    className={cn(
                      "tnum",
                      s.strong && "text-base font-semibold",
                      s.value < 0 && "text-[hsl(var(--arrears))]"
                    )}
                  >
                    {formatKES(s.value)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
