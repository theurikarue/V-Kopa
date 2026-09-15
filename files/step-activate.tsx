"use client";

import { useEffect, useState } from "react";
import {
  Check, Loader2, Lock, Smartphone, RotateCw, Printer, Plus, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate, formatKES, normaliseMsisdn, prettyMsisdn } from "@/lib/hp";
import type { HPSchedule } from "@/lib/hp";
import type { OriginationDraft } from "@/lib/types";
import { MPESA_CONFIG, VTRUST_CONFIG } from "@/lib/mock-data";

type Phase = "pushing" | "waiting" | "confirmed" | "enrolling" | "done" | "failed";

/**
 * Mirrors the real sequence: STK Push → Safaricom C2B callback → contract
 * activation → VTrust enrolment. Each stage is visible because when this
 * fails in a store, the merchant needs to know which leg failed.
 */
const SEQUENCE: { phase: Phase; label: string; after: number }[] = [
  { phase: "pushing", label: "Sending STK Push to the customer's phone", after: 1400 },
  { phase: "waiting", label: "Waiting for the customer to enter their M-Pesa PIN", after: 2600 },
  { phase: "confirmed", label: "Payment confirmed by Safaricom", after: 1200 },
  { phase: "enrolling", label: "Enrolling handset with VTrust", after: 1600 },
];

export function StepActivate({
  draft,
  schedule,
}: {
  draft: OriginationDraft;
  schedule: HPSchedule | null;
}) {
  const [phase, setPhase] = useState<Phase>("pushing");
  const [receipt] = useState(() => mockReceipt());
  const [contractRef] = useState(() => mockContractRef());

  useEffect(() => {
    if (phase === "done" || phase === "failed") return;
    const step = SEQUENCE.findIndex((s) => s.phase === phase);
    const next = SEQUENCE[step + 1]?.phase ?? "done";
    const t = setTimeout(() => setPhase(next), SEQUENCE[step].after);
    return () => clearTimeout(t);
  }, [phase]);

  if (!draft.device || !schedule) return null;

  const msisdn = normaliseMsisdn(draft.kyc.msisdn);
  const done = phase === "done";
  const failed = phase === "failed";
  const activeIndex = SEQUENCE.findIndex((s) => s.phase === phase);

  return (
    <div className="mx-auto max-w-2xl py-4">
      {!done && !failed && (
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[hsl(var(--mpesa))]/10">
            <Smartphone className="size-7 stk-pulse text-[hsl(var(--mpesa))]" />
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight">
            Collecting {formatKES(schedule.deposit)}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground tnum">
            From {msisdn ? prettyMsisdn(msisdn) : "the customer"} · Paybill{" "}
            {MPESA_CONFIG.shortcode}
          </p>

          <ol className="mx-auto mt-8 max-w-md space-y-3 text-left">
            {SEQUENCE.map((s, i) => (
              <li key={s.phase} className="flex items-start gap-3 text-sm">
                {i < activeIndex ? (
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[hsl(var(--mpesa))]">
                    <Check className="size-3 text-white" />
                  </span>
                ) : i === activeIndex ? (
                  <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-[hsl(var(--vivo-blue))]" />
                ) : (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-border" />
                )}
                <span className={cn(i > activeIndex && "text-muted-foreground")}>
                  {s.label}
                </span>
              </li>
            ))}
          </ol>

          <Button
            variant="ghost"
            size="sm"
            className="mt-8 text-muted-foreground"
            onClick={() => setPhase("failed")}
          >
            Cancel collection
          </Button>
        </div>
      )}

      {failed && (
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[hsl(var(--arrears))]/10">
            <X className="size-7 text-[hsl(var(--arrears))]" />
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight">
            Collection cancelled
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            No money moved and nothing was enrolled. The draft is saved — send the
            prompt again, or switch the customer to Paybill {MPESA_CONFIG.shortcode}
            and enter the receipt manually.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Button onClick={() => setPhase("pushing")}>
              <RotateCw className="mr-2 size-4" />
              Send the prompt again
            </Button>
            <Button variant="outline">Enter an M-Pesa receipt</Button>
          </div>
        </div>
      )}

      {done && (
        <div>
          <div className="text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[hsl(var(--mpesa))]/10">
              <Check className="size-7 text-[hsl(var(--mpesa))]" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              {draft.kyc.fullName.split(" ")[0]} can take the phone home
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground tnum">
              Contract {contractRef} · activated {formatDate(new Date())}
            </p>
          </div>

          <div className="mt-7 overflow-hidden rounded-xl border bg-card">
            <Row
              label="Deposit received"
              value={formatKES(schedule.deposit)}
              note={`M-Pesa ${receipt}`}
              tone="money"
            />
            <Row
              label={`Next payment, ${formatDate(schedule.firstDueDate)}`}
              value={formatKES(schedule.instalmentAmount)}
              note={`1 of ${schedule.instalmentCount} · every ${
                draft.frequency === "daily" ? "day" : "week"
              }`}
            />
            <Row
              label="Handset enrolled"
              value={draft.imei}
              note={`VTrust ${VTRUST_CONFIG.tenantId} · heartbeat every ${
                VTRUST_CONFIG.heartbeatMinutes / 60
              }h`}
              mono
            />
            <Row
              label="Remote lock stops at"
              value={formatKES(schedule.lockProtectionThreshold)}
              note={`Payment ${schedule.lockProtectionInstalment} of ${schedule.instalmentCount} · Cap 507`}
              tone="statute"
            />
          </div>

          <div className="mt-5 rounded-xl bg-muted/60 p-4">
            <p className="text-sm font-medium">Before they leave the counter</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>Confirm the VTrust agent is running and the device has come online.</li>
              <li>
                Show them how to pay: Paybill {MPESA_CONFIG.shortcode}, account{" "}
                <span className="tnum">
                  {MPESA_CONFIG.accountRefPrefix}-{draft.kyc.nationalId}
                </span>
                .
              </li>
              <li>
                Point out the {draft.gracePeriodDays}-day grace period — the first
                reminder lands {formatDate(schedule.firstDueDate)}.
              </li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" size="lg">
              <Printer className="mr-2 size-4" />
              Print the agreement
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              <Plus className="mr-2 size-4" />
              Start another contract
            </Button>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3" />
            Agreement and KYC stored encrypted in ke-central-1
          </p>
        </div>
      )}
    </div>
  );
}

function Row({
  label, value, note, mono, tone,
}: {
  label: string; value: string; note: string;
  mono?: boolean; tone?: "money" | "statute";
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-5 py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground tnum">{note}</p>
      </div>
      <p
        className={cn(
          "text-base font-semibold",
          mono ? "text-sm font-normal tnum" : "tnum",
          tone === "money" && "text-[hsl(var(--mpesa))]",
          tone === "statute" && "text-[hsl(var(--statute))]"
        )}
      >
        {value}
      </p>
    </div>
  );
}

const mockReceipt = () =>
  "S" + Math.random().toString(36).slice(2, 11).toUpperCase();

const mockContractRef = () => {
  const now = new Date();
  const seq = String(Math.floor(1000 + Math.random() * 8999));
  return `HP-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${seq}`;
};
