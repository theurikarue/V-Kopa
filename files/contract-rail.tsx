"use client";

import { Smartphone, ShieldCheck, Info } from "lucide-react";
import { formatDate, formatKES } from "@/lib/hp";
import type { HPSchedule } from "@/lib/hp";
import type { OriginationDraft } from "@/lib/types";
import { MPESA_CONFIG } from "@/lib/mock-data";

/**
 * The rail is the one loud element in this flow. It stays on screen from the
 * first tap to signature so the merchant can answer the only two questions a
 * Kenyan customer actually asks at the counter: "how much today?" and
 * "how much each day?" — and it shows both updating live as terms change.
 */
export function ContractRail({
  draft,
  schedule,
}: {
  draft: OriginationDraft;
  schedule: HPSchedule | null;
}) {
  if (!draft.device || !schedule) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-center">
        <Smartphone className="mx-auto size-6 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-medium">No device selected</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick a device and the contract figures build here as you go.
        </p>
      </div>
    );
  }

  const freqWord = draft.frequency === "daily" ? "a day" : "a week";
  const protectionPct = Math.round(
    (schedule.lockProtectionInstalment / schedule.instalmentCount) * 100
  );

  return (
    <div className="overflow-hidden rounded-xl bg-[hsl(var(--ink))] text-white">
      <div className="px-5 pt-5">
        <p className="text-[11px] uppercase tracking-wide text-white/45">Draft contract</p>
        <p className="mt-1 text-[15px] font-medium">
          {draft.device.model} · {draft.device.storage}
        </p>
        <p className="text-xs text-white/50">{draft.device.colour}</p>
      </div>

      {/* The two numbers the customer cares about */}
      <div className="mt-5 grid grid-cols-2 gap-px bg-white/10">
        <Figure
          label="Pay today"
          value={formatKES(schedule.deposit)}
          sub={`${Math.round(draft.depositRatio * 100)}% deposit`}
        />
        <Figure
          label={`Then ${freqWord}`}
          value={formatKES(schedule.instalmentAmount)}
          sub={`× ${schedule.instalmentCount} payments`}
          accent
        />
      </div>

      <dl className="space-y-2.5 px-5 py-4 text-[13px]">
        <Row label="Cash price" value={formatKES(draft.device.cashPrice)} />
        <Row label="Service charge" value={formatKES(schedule.serviceCharge)} />
        <Row label="Processing fee" value={formatKES(schedule.processingFee)} />
        <div className="!mt-3 border-t border-white/10 pt-3">
          <Row label="Hire purchase price" value={formatKES(schedule.hpPrice)} strong />
        </div>
        <Row
          label="Cost of credit"
          value={`${schedule.costOfCreditPct.toFixed(1)}%`}
          muted
        />
      </dl>

      {/* Cap 507 two-thirds marker */}
      <div className="mx-5 mb-4 rounded-lg bg-[hsl(var(--statute))]/15 p-3.5">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[hsl(var(--statute))]" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium">Remote lock stops working</p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/60">
              After {formatKES(schedule.lockProtectionThreshold)} is paid — payment{" "}
              <span className="tnum">{schedule.lockProtectionInstalment}</span> of{" "}
              <span className="tnum">{schedule.instalmentCount}</span>. Cap 507 bars
              repossession past two-thirds, so the platform blocks the command.
            </p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[hsl(var(--statute))]"
                style={{ width: `${protectionPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 border-t border-white/10 px-5 py-4 text-xs text-white/55">
        <div className="flex justify-between gap-3">
          <span>First payment due</span>
          <span className="tnum text-white/80">{formatDate(schedule.firstDueDate)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Contract ends</span>
          <span className="tnum text-white/80">{formatDate(schedule.finalDueDate)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Collections</span>
          <span className="tnum text-white/80">
            Paybill {MPESA_CONFIG.shortcode}
          </span>
        </div>
      </div>

      {draft.gracePeriodDays > 0 && (
        <p className="flex items-start gap-2 border-t border-white/10 px-5 py-3 text-[11px] leading-relaxed text-white/45">
          <Info className="mt-px size-3.5 shrink-0" />
          {draft.gracePeriodDays}-day grace period after collection — no dunning, no
          lock, before the first instalment.
        </p>
      )}
    </div>
  );
}

function Figure({
  label, value, sub, accent,
}: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="bg-[hsl(var(--ink))] px-5 py-4">
      <p className="text-[11px] text-white/45">{label}</p>
      <p
        className={`mt-1 text-[22px] font-semibold leading-none tnum ${
          accent ? "text-[hsl(var(--vivo-blue))]" : ""
        }`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[11px] text-white/45 tnum">{sub}</p>
    </div>
  );
}

function Row({
  label, value, strong, muted,
}: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={muted ? "text-white/40" : "text-white/55"}>{label}</dt>
      <dd className={`tnum ${strong ? "text-[15px] font-semibold" : muted ? "text-white/40" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
