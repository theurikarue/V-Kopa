"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildSchedule } from "@/lib/hp";
import { isValidImei, isValidNationalId, normaliseMsisdn } from "@/lib/hp";
import type { KycDraft, OriginationDraft } from "@/lib/types";
import { HP_PRODUCTS } from "@/lib/mock-data";
import { StepDevice } from "./step-device";
import { StepCustomer } from "./step-customer";
import { StepTerms } from "./step-terms";
import { StepReview } from "./step-review";
import { StepActivate } from "./step-activate";
import { ContractRail } from "./contract-rail";

const STEPS = [
  { id: "device", label: "Device" },
  { id: "customer", label: "Customer" },
  { id: "terms", label: "Terms" },
  { id: "review", label: "Review" },
  { id: "activate", label: "Activate" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

const emptyKyc: KycDraft = {
  fullName: "", nationalId: "", msisdn: "", altMsisdn: "", dateOfBirth: "",
  gender: "", county: "", physicalAddress: "", employmentType: "", monthlyIncome: "",
  guarantorName: "", guarantorMsisdn: "", guarantorRelationship: "",
  idFrontCaptured: false, idBackCaptured: false, selfieCaptured: false,
};

const initialDraft: OriginationDraft = {
  device: null,
  imei: "",
  product: HP_PRODUCTS[0],
  depositRatio: HP_PRODUCTS[0].minDepositRatio,
  tenorDays: HP_PRODUCTS[0].tenorDays,
  frequency: HP_PRODUCTS[0].frequency,
  gracePeriodDays: HP_PRODUCTS[0].gracePeriodDays,
  depositMethod: "mpesa_stk",
  kyc: emptyKyc,
};

export function OriginationFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<OriginationDraft>(initialDraft);
  const [furthest, setFurthest] = useState(0);

  const patch = (p: Partial<OriginationDraft>) => setDraft((d) => ({ ...d, ...p }));
  const patchKyc = (p: Partial<KycDraft>) =>
    setDraft((d) => ({ ...d, kyc: { ...d.kyc, ...p } }));

  const schedule = useMemo(() => {
    if (!draft.device || !draft.product) return null;
    return buildSchedule({
      cashPrice: draft.device.cashPrice,
      depositRatio: draft.depositRatio,
      tenorDays: draft.tenorDays,
      frequency: draft.frequency,
      monthlyServiceRate: draft.product.monthlyServiceRate,
      processingFee: draft.product.processingFee,
      gracePeriodDays: draft.gracePeriodDays,
    });
  }, [draft]);

  const blockers = useMemo(() => gatesFor(STEPS[stepIndex].id, draft), [stepIndex, draft]);
  const canAdvance = blockers.length === 0;

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, next));
    setStepIndex(clamped);
    setFurthest((f) => Math.max(f, clamped));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const current = STEPS[stepIndex].id;
  const isActivate = current === "activate";

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <Stepper steps={STEPS} index={stepIndex} furthest={furthest} onJump={go} />

      <div
        className={cn(
          "mt-6 gap-6",
          isActivate ? "block" : "grid lg:grid-cols-[minmax(0,1fr)_21rem]"
        )}
      >
        <div className="min-w-0">
          {current === "device" && <StepDevice draft={draft} patch={patch} />}
          {current === "customer" && <StepCustomer draft={draft} patchKyc={patchKyc} />}
          {current === "terms" && <StepTerms draft={draft} patch={patch} schedule={schedule} />}
          {current === "review" && (
            <StepReview draft={draft} schedule={schedule} onEdit={(i) => go(i)} />
          )}
          {current === "activate" && <StepActivate draft={draft} schedule={schedule} />}

          {!isActivate && (
            <div className="mt-6 flex flex-col-reverse items-stretch gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="ghost"
                onClick={() => go(stepIndex - 1)}
                disabled={stepIndex === 0}
                className="sm:w-auto"
              >
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>

              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                {!canAdvance && (
                  <p className="text-right text-xs text-[hsl(var(--arrears))]" role="status">
                    {blockers[0]}
                  </p>
                )}
                <Button onClick={() => go(stepIndex + 1)} disabled={!canAdvance} size="lg">
                  {current === "review" ? "Collect deposit" : "Continue"}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {!isActivate && (
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <ContractRail draft={draft} schedule={schedule} />
          </aside>
        )}
      </div>
    </div>
  );
}

/** Per-step preconditions. Returns human-readable reasons, not booleans,
 *  so the merchant is told exactly what is missing. */
function gatesFor(step: StepId, d: OriginationDraft): string[] {
  const out: string[] = [];
  if (step === "device") {
    if (!d.device) out.push("Choose a device to continue");
    else if (!isValidImei(d.imei)) out.push("Scan or key in a valid 15-digit IMEI");
    else if (!d.device.vtrustReady) out.push("This SKU is not enrolled with VTrust yet");
  }
  if (step === "customer") {
    const k = d.kyc;
    if (!k.fullName.trim()) out.push("Customer name is required");
    else if (!isValidNationalId(k.nationalId)) out.push("National ID must be 7 or 8 digits");
    else if (!normaliseMsisdn(k.msisdn)) out.push("Enter a valid Safaricom number");
    else if (!k.county) out.push("Select a county");
    else if (!k.employmentType) out.push("Select an income source");
    else if (!k.idFrontCaptured || !k.idBackCaptured || !k.selfieCaptured)
      out.push("Capture both ID sides and a selfie");
    else if (!k.guarantorName.trim() || !normaliseMsisdn(k.guarantorMsisdn))
      out.push("Guarantor name and phone are required");
  }
  if (step === "terms") {
    if (!d.product) out.push("Select an HP product");
    else if (d.depositRatio < d.product.minDepositRatio)
      out.push(`Deposit is below the ${Math.round(d.product.minDepositRatio * 100)}% policy floor`);
    else if (d.device && d.device.cashPrice > d.product.maxTicketSize)
      out.push("Device price exceeds this product's ticket limit");
  }
  return out;
}

function Stepper({
  steps, index, furthest, onJump,
}: {
  steps: readonly { id: string; label: string }[];
  index: number;
  furthest: number;
  onJump: (i: number) => void;
}) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto pb-1" aria-label="Contract steps">
      {steps.map((s, i) => {
        const done = i < index;
        const active = i === index;
        const reachable = i <= furthest;
        return (
          <li key={s.id} className="flex min-w-0 flex-1 items-center gap-1">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onJump(i)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                active && "bg-[hsl(var(--vivo-blue))]/10 font-medium text-[hsl(var(--vivo-blue))]",
                !active && reachable && "text-foreground hover:bg-muted",
                !reachable && "cursor-not-allowed text-muted-foreground/50"
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tnum",
                  done && "bg-[hsl(var(--vivo-blue))] text-white",
                  active && "border-2 border-[hsl(var(--vivo-blue))] text-[hsl(var(--vivo-blue))]",
                  !done && !active && "border border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="truncate">{s.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
