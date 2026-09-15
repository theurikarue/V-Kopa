"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDate, formatKES, prettyMsisdn, normaliseMsisdn } from "@/lib/hp";
import type { HPSchedule } from "@/lib/hp";
import type { OriginationDraft } from "@/lib/types";
import { MPESA_CONFIG } from "@/lib/mock-data";
import { StepHeading } from "./step-heading";

export function StepReview({
  draft,
  schedule,
  onEdit,
}: {
  draft: OriginationDraft;
  schedule: HPSchedule | null;
  onEdit: (stepIndex: number) => void;
}) {
  const [consents, setConsents] = useState({ terms: false, lock: false, data: false });
  const [depositMethod, setDepositMethod] = useState(draft.depositMethod);

  if (!draft.device || !schedule) return null;
  const msisdn = normaliseMsisdn(draft.kyc.msisdn);
  const freq = draft.frequency === "daily" ? "day" : "week";

  return (
    <section className="space-y-6">
      <StepHeading
        title="Read this back to the customer"
        description="Then collect the deposit. Nothing is committed and no device is enrolled until the M-Pesa callback lands."
      />

      <Block title="Device" onEdit={() => onEdit(0)}>
        <Line label="Model" value={`${draft.device.model} · ${draft.device.storage} · ${draft.device.colour}`} />
        <Line label="IMEI" value={draft.imei} mono />
        <Line label="Cash price" value={formatKES(draft.device.cashPrice)} mono />
      </Block>

      <Block title="Customer" onEdit={() => onEdit(1)}>
        <Line label="Name" value={draft.kyc.fullName} />
        <Line label="National ID" value={draft.kyc.nationalId} mono />
        <Line label="M-Pesa" value={msisdn ? prettyMsisdn(msisdn) : "—"} mono />
        <Line label="County" value={draft.kyc.county} />
        <Line
          label="Guarantor"
          value={`${draft.kyc.guarantorName}${
            draft.kyc.guarantorRelationship ? ` · ${draft.kyc.guarantorRelationship}` : ""
          }`}
        />
      </Block>

      <Block title="Contract" onEdit={() => onEdit(2)}>
        <Line label="Product" value={draft.product?.name ?? "—"} />
        <Line
          label="Deposit"
          value={`${formatKES(schedule.deposit)} (${Math.round(draft.depositRatio * 100)}%)`}
          mono
        />
        <Line
          label="Instalment"
          value={`${formatKES(schedule.instalmentAmount)} every ${freq} × ${schedule.instalmentCount}`}
          mono
        />
        <Line label="Grace period" value={`${draft.gracePeriodDays} days`} mono />
        <Line label="First payment" value={formatDate(schedule.firstDueDate)} mono />
        <Line label="Hire purchase price" value={formatKES(schedule.hpPrice)} mono strong />
        <Line
          label="Lock protection at"
          value={`${formatKES(schedule.lockProtectionThreshold)} · payment ${schedule.lockProtectionInstalment}`}
          mono
        />
      </Block>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-medium">Collect the deposit</h3>
        <div className="mt-4 max-w-sm">
          <Label htmlFor="method">Method</Label>
          <Select
            value={depositMethod}
            onValueChange={(v) => setDepositMethod(v as typeof depositMethod)}
          >
            <SelectTrigger id="method" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mpesa_stk">STK Push to the customer's phone</SelectItem>
              <SelectItem value="mpesa_paybill">
                Customer pays Paybill {MPESA_CONFIG.shortcode} manually
              </SelectItem>
              <SelectItem value="cash">Cash at till</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="mt-3 text-sm text-muted-foreground tnum">
          {depositMethod === "mpesa_stk" &&
            `A prompt goes to ${msisdn ? prettyMsisdn(msisdn) : "the customer"} and expires after ${MPESA_CONFIG.stkTimeoutSeconds} seconds.`}
          {depositMethod === "mpesa_paybill" &&
            `Paybill ${MPESA_CONFIG.shortcode}, account ${MPESA_CONFIG.accountRefPrefix}-${draft.kyc.nationalId || "XXXXXXXX"}. Matched automatically on the C2B confirmation.`}
          {depositMethod === "cash" &&
            "Cash deposits are reconciled against the till float at the 23:30 EAT cut-off."}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-medium">Customer consent</h3>
        <div className="mt-4 space-y-3.5">
          <Consent
            id="c-terms"
            checked={consents.terms}
            onChange={(v) => setConsents((c) => ({ ...c, terms: v }))}
          >
            The hire purchase agreement was read aloud in a language the customer
            understands, including the total price of {formatKES(schedule.hpPrice)}.
          </Consent>
          <Consent
            id="c-lock"
            checked={consents.lock}
            onChange={(v) => setConsents((c) => ({ ...c, lock: v }))}
          >
            The customer understands the handset can be locked remotely while payments
            are behind, and that locking stops permanently once{" "}
            {formatKES(schedule.lockProtectionThreshold)} has been paid.
          </Consent>
          <Consent
            id="c-data"
            checked={consents.data}
            onChange={(v) => setConsents((c) => ({ ...c, data: v }))}
          >
            The customer consents to identity and credit checks under the Data
            Protection Act 2019, and to instalment reminders by SMS.
          </Consent>
        </div>

        {!Object.values(consents).every(Boolean) && (
          <p className="mt-4 text-xs text-muted-foreground">
            All three must be confirmed before the deposit can be collected.
          </p>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Title in the device stays with vivo HP Kenya Ltd until the full hire purchase
        price is settled, at which point it transfers automatically and the VTrust
        profile is released.
      </p>
    </section>
  );
}

function Block({
  title, onEdit, children,
}: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="mr-1.5 size-3.5" />
          Change
        </Button>
      </div>
      <dl className="mt-3 divide-y">{children}</dl>
    </div>
  );
}

function Line({
  label, value, mono, strong,
}: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`${mono ? "tnum" : ""} ${strong ? "text-base font-semibold" : ""}`}>
        {value || "—"}
      </dd>
    </div>
  );
}

function Consent({
  id, checked, onChange, children,
}: {
  id: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <Label htmlFor={id} className="text-sm font-normal leading-relaxed text-muted-foreground">
        {children}
      </Label>
    </div>
  );
}
