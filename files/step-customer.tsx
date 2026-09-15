"use client";

import { useState } from "react";
import { Camera, Check, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { isValidNationalId, normaliseMsisdn, prettyMsisdn } from "@/lib/hp";
import { COUNTIES, RELATIONSHIPS } from "@/lib/mock-data";
import type { KycDraft, OriginationDraft } from "@/lib/types";
import { StepHeading } from "./step-heading";

type CheckState = "idle" | "running" | "clear" | "flagged";

export function StepCustomer({
  draft,
  patchKyc,
}: {
  draft: OriginationDraft;
  patchKyc: (p: Partial<KycDraft>) => void;
}) {
  const k = draft.kyc;
  const [idrs, setIdrs] = useState<CheckState>("idle");
  const [blacklist, setBlacklist] = useState<CheckState>("idle");

  const idOk = isValidNationalId(k.nationalId);
  const msisdn = normaliseMsisdn(k.msisdn);

  /** Fires the two external checks a Kenyan HP book actually needs:
   *  IPRS identity verification and the shared negative-list lookup. */
  const runChecks = () => {
    setIdrs("running");
    setBlacklist("running");
    setTimeout(() => setIdrs("clear"), 1100);
    setTimeout(() => {
      // Deterministic demo behaviour: IDs ending in 7 come back flagged.
      setBlacklist(k.nationalId.endsWith("7") ? "flagged" : "clear");
    }, 1800);
  };

  return (
    <section className="space-y-6">
      <StepHeading
        title="Who is taking the device home?"
        description="Identity is verified against IPRS and screened against the shared installment negative list before terms are priced."
      />

      <Panel title="Identity">
        <Grid>
          <Field label="Full name as on ID" htmlFor="fullName" className="sm:col-span-2">
            <Input
              id="fullName"
              value={k.fullName}
              placeholder="e.g. Brian Otieno Ochieng"
              onChange={(e) => patchKyc({ fullName: e.target.value })}
            />
          </Field>

          <Field
            label="National ID"
            htmlFor="nationalId"
            hint={k.nationalId && !idOk ? "7 or 8 digits" : undefined}
          >
            <Input
              id="nationalId"
              inputMode="numeric"
              maxLength={8}
              value={k.nationalId}
              placeholder="32448190"
              aria-invalid={!!k.nationalId && !idOk}
              onChange={(e) => patchKyc({ nationalId: e.target.value.replace(/\D/g, "") })}
              className="tnum"
            />
          </Field>

          <Field label="Date of birth" htmlFor="dob">
            <Input
              id="dob"
              type="date"
              value={k.dateOfBirth}
              onChange={(e) => patchKyc({ dateOfBirth: e.target.value })}
            />
          </Field>

          <Field
            label="M-Pesa number"
            htmlFor="msisdn"
            hint={
              msisdn
                ? prettyMsisdn(msisdn)
                : k.msisdn
                ? "Use 07xx, 01xx or +254 format"
                : "Instalment reminders and STK prompts go here"
            }
          >
            <Input
              id="msisdn"
              inputMode="tel"
              value={k.msisdn}
              placeholder="0712 408 551"
              aria-invalid={!!k.msisdn && !msisdn}
              onChange={(e) => patchKyc({ msisdn: e.target.value })}
              className="tnum"
            />
          </Field>

          <Field label="Alternate number" htmlFor="altMsisdn" optional>
            <Input
              id="altMsisdn"
              inputMode="tel"
              value={k.altMsisdn}
              placeholder="Used by collections if the first line is off"
              onChange={(e) => patchKyc({ altMsisdn: e.target.value })}
              className="tnum"
            />
          </Field>

          <Field label="County" htmlFor="county">
            <Select value={k.county} onValueChange={(v) => patchKyc({ county: v })}>
              <SelectTrigger id="county">
                <SelectValue placeholder="Select county" />
              </SelectTrigger>
              <SelectContent>
                {COUNTIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Estate, street or landmark" htmlFor="address">
            <Input
              id="address"
              value={k.physicalAddress}
              placeholder="e.g. Pipeline, Nyayo Estate, Block C"
              onChange={(e) => patchKyc({ physicalAddress: e.target.value })}
            />
          </Field>
        </Grid>
      </Panel>

      <Panel title="Income">
        <Grid>
          <Field label="How they earn" htmlFor="employment">
            <Select
              value={k.employmentType}
              onValueChange={(v) => patchKyc({ employmentType: v as KycDraft["employmentType"] })}
            >
              <SelectTrigger id="employment">
                <SelectValue placeholder="Select income source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salaried">Salaried employment</SelectItem>
                <SelectItem value="self_employed">Business or self-employed</SelectItem>
                <SelectItem value="casual">Casual or daily work</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Monthly income (KES)"
            htmlFor="income"
            hint="Drives the affordability check and the deposit floor"
          >
            <Input
              id="income"
              inputMode="numeric"
              value={k.monthlyIncome}
              placeholder="35000"
              onChange={(e) => patchKyc({ monthlyIncome: e.target.value.replace(/\D/g, "") })}
              className="tnum"
            />
          </Field>
        </Grid>
      </Panel>

      <Panel
        title="Guarantor"
        subtitle="One contactable person who is not the customer. Required on every HP contract under our credit policy."
      >
        <Grid>
          <Field label="Guarantor name" htmlFor="gName">
            <Input
              id="gName"
              value={k.guarantorName}
              onChange={(e) => patchKyc({ guarantorName: e.target.value })}
            />
          </Field>
          <Field label="Guarantor phone" htmlFor="gPhone">
            <Input
              id="gPhone"
              inputMode="tel"
              value={k.guarantorMsisdn}
              placeholder="0722 000 000"
              aria-invalid={!!k.guarantorMsisdn && !normaliseMsisdn(k.guarantorMsisdn)}
              onChange={(e) => patchKyc({ guarantorMsisdn: e.target.value })}
              className="tnum"
            />
          </Field>
          <Field label="Relationship" htmlFor="gRel">
            <Select
              value={k.guarantorRelationship}
              onValueChange={(v) => patchKyc({ guarantorRelationship: v })}
            >
              <SelectTrigger id="gRel">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Grid>
      </Panel>

      <Panel title="Documents" subtitle="Stored encrypted, in-country. Nothing leaves the device unencrypted.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Capture
            label="ID front"
            done={k.idFrontCaptured}
            onCapture={() => patchKyc({ idFrontCaptured: !k.idFrontCaptured })}
          />
          <Capture
            label="ID back"
            done={k.idBackCaptured}
            onCapture={() => patchKyc({ idBackCaptured: !k.idBackCaptured })}
          />
          <Capture
            label="Selfie with ID"
            done={k.selfieCaptured}
            onCapture={() => patchKyc({ selfieCaptured: !k.selfieCaptured })}
          />
        </div>
      </Panel>

      <Panel title="Screening">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <CheckRow label="IPRS identity match" state={idrs} clearText="Name and ID match the register" />
            <CheckRow
              label="Installment negative list"
              state={blacklist}
              clearText="No active default with another provider"
              flagText="Open default recorded — escalate to credit before continuing"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={runChecks}
            disabled={!idOk || idrs === "running"}
          >
            {idrs === "running" || blacklist === "running" ? "Checking…" : "Run checks"}
          </Button>
        </div>
      </Panel>
    </section>
  );
}

function Panel({
  title, subtitle, children,
}: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="font-medium">{title}</h3>
      {subtitle && (
        <p className="mt-1 max-w-[62ch] text-sm text-muted-foreground">{subtitle}</p>
      )}
      <div className="mt-4">{children}</div>
    </div>
  );
}

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-4 sm:grid-cols-2">{children}</div>
);

function Field({
  label, htmlFor, hint, optional, className, children,
}: {
  label: string; htmlFor: string; hint?: string; optional?: boolean;
  className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="flex items-baseline gap-1.5">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">optional</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground tnum">{hint}</p>}
    </div>
  );
}

function Capture({
  label, done, onCapture,
}: { label: string; done: boolean; onCapture: () => void }) {
  return (
    <button
      type="button"
      onClick={onCapture}
      aria-pressed={done}
      className={cn(
        "flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm transition-colors",
        done
          ? "border-solid border-[hsl(var(--mpesa))] bg-[hsl(var(--mpesa))]/5 text-[hsl(var(--mpesa))]"
          : "text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
    >
      {done ? <Check className="size-5" /> : <Camera className="size-5" />}
      <span className="font-medium">{label}</span>
      <span className="text-xs opacity-70">{done ? "Captured · tap to retake" : "Tap to capture"}</span>
    </button>
  );
}

function CheckRow({
  label, state, clearText, flagText,
}: { label: string; state: CheckState; clearText: string; flagText?: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {state === "running" && <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" />}
      {state === "clear" && <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[hsl(var(--mpesa))]" />}
      {state === "flagged" && <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[hsl(var(--arrears))]" />}
      {state === "idle" && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-border" />}
      <div>
        <p className={state === "idle" ? "text-muted-foreground" : "font-medium"}>{label}</p>
        {state === "clear" && <p className="text-xs text-muted-foreground">{clearText}</p>}
        {state === "flagged" && (
          <p className="text-xs text-[hsl(var(--arrears))]">{flagText}</p>
        )}
      </div>
    </div>
  );
}
