import { PageHeader } from "@/components/shell/merchant-shell";
import { Badge } from "@/components/ui/badge";
import { buildSchedule, formatKES } from "@/lib/hp";
import { DEVICES, HP_PRODUCTS } from "@/lib/mock-data";

export const metadata = { title: "HP products · vivo Hire Purchase" };

/**
 * Read-only for merchants — pricing is owned by the credit team in the
 * Backoffice. What the store needs from this page is a quick answer to
 * "what would the Y19s cost on each plan?", so every product is priced
 * against a reference device at its minimum deposit.
 */
const REFERENCE = DEVICES.find((d) => d.sku === "VIVO-Y19S-6128")!;

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Hire purchase products"
        description={`Priced here against a ${REFERENCE.model} at the minimum deposit. Terms are set by credit — ask your regional manager to change them.`}
      />

      <div className="grid gap-4 px-5 py-6 sm:grid-cols-2 lg:px-8 xl:grid-cols-4">
        {HP_PRODUCTS.map((p) => {
          const affordable = REFERENCE.cashPrice <= p.maxTicketSize;
          const s = affordable
            ? buildSchedule({
                cashPrice: REFERENCE.cashPrice,
                depositRatio: p.minDepositRatio,
                tenorDays: p.tenorDays,
                frequency: p.frequency,
                monthlyServiceRate: p.monthlyServiceRate,
                processingFee: p.processingFee,
                gracePeriodDays: p.gracePeriodDays,
              })
            : null;

          return (
            <article key={p.id} className="flex flex-col rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-medium">{p.name}</h2>
                {p.popular && (
                  <Badge variant="secondary" className="font-normal">Most taken</Badge>
                )}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>

              {s ? (
                <p className="mt-5">
                  <span className="text-[26px] font-semibold leading-none tnum">
                    {formatKES(s.instalmentAmount)}
                  </span>
                  <span className="ml-1.5 text-sm text-muted-foreground">
                    a {p.frequency === "daily" ? "day" : "week"}
                  </span>
                </p>
              ) : (
                <p className="mt-5 text-sm text-muted-foreground">
                  {REFERENCE.model} is above this product's ticket limit.
                </p>
              )}

              <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
                <Spec label="Deposit from" value={`${Math.round(p.minDepositRatio * 100)}%`} />
                <Spec
                  label="Tenor"
                  value={
                    p.frequency === "weekly"
                      ? `${Math.round(p.tenorDays / 7)} weeks`
                      : `${p.tenorDays} days`
                  }
                />
                <Spec label="Service charge" value={`${p.monthlyServiceRate}% / 30 days`} />
                <Spec label="Processing fee" value={formatKES(p.processingFee)} />
                <Spec label="Grace period" value={`${p.gracePeriodDays} days`} />
                <Spec label="Ticket limit" value={formatKES(p.maxTicketSize)} />
              </dl>

              {s && (
                <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  Total {formatKES(s.hpPrice)} · lock retires after{" "}
                  <span className="tnum">{formatKES(s.lockProtectionThreshold)}</span>
                </p>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tnum">{value}</dd>
    </div>
  );
}
