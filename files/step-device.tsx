"use client";

import { useState } from "react";
import { ScanLine, Check, AlertTriangle, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatKES, isValidImei } from "@/lib/hp";
import { DEVICES, DEMO_IMEIS } from "@/lib/mock-data";
import type { OriginationDraft } from "@/lib/types";
import { StepHeading } from "./step-heading";

export function StepDevice({
  draft,
  patch,
}: {
  draft: OriginationDraft;
  patch: (p: Partial<OriginationDraft>) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const imeiOk = isValidImei(draft.imei);
  const imeiTouched = draft.imei.replace(/\D/g, "").length >= 15;

  const simulateScan = () => {
    setScanning(true);
    const pick = DEMO_IMEIS[Math.floor(Math.random() * DEMO_IMEIS.length)];
    setTimeout(() => {
      patch({ imei: pick });
      setScanning(false);
    }, 900);
  };

  return (
    <section>
      <StepHeading
        title="Which device is the customer taking?"
        description="Stock shown is live for this branch. Every unit must carry a VTrust factory lock before it leaves the counter."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {DEVICES.map((device) => {
          const selected = draft.device?.sku === device.sku;
          const outOfStock = device.stockAtBranch === 0;
          return (
            <button
              key={device.sku}
              type="button"
              disabled={outOfStock}
              onClick={() => patch({ device, imei: "" })}
              aria-pressed={selected}
              className={cn(
                "rounded-xl border bg-card p-4 text-left transition-colors",
                selected
                  ? "border-[hsl(var(--vivo-blue))] ring-1 ring-[hsl(var(--vivo-blue))]"
                  : "hover:border-foreground/25",
                outOfStock && "opacity-50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{device.model}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {device.storage} · {device.colour}
                  </p>
                </div>
                {selected && (
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[hsl(var(--vivo-blue))]">
                    <Check className="size-3 text-white" />
                  </span>
                )}
              </div>

              <p className="mt-3 text-lg font-semibold tnum">{formatKES(device.cashPrice)}</p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="font-normal tnum">
                  {device.stockAtBranch} in stock
                </Badge>
                {device.vtrustReady ? (
                  <Badge
                    variant="outline"
                    className="border-[hsl(var(--vivo-blue))]/30 font-normal text-[hsl(var(--vivo-blue))]"
                  >
                    <Lock className="mr-1 size-3" />
                    VTrust ready
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-[hsl(var(--arrears))]/40 font-normal text-[hsl(var(--arrears))]"
                  >
                    <AlertTriangle className="mr-1 size-3" />
                    Not enrolled
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {draft.device && (
        <div className="mt-6 rounded-xl border bg-card p-5">
          <h3 className="font-medium">Serial capture</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The IMEI ties this contract to one handset. VTrust enrols it the moment the
            deposit clears.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="imei">IMEI</Label>
              <Input
                id="imei"
                inputMode="numeric"
                maxLength={17}
                placeholder="15 digits"
                value={draft.imei}
                onChange={(e) => patch({ imei: e.target.value.replace(/[^\d]/g, "") })}
                aria-invalid={imeiTouched && !imeiOk}
                className="mt-1.5 tnum"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={simulateScan}
              disabled={scanning}
              className="sm:mb-px"
            >
              <ScanLine className={cn("mr-2 size-4", scanning && "stk-pulse")} />
              {scanning ? "Reading barcode…" : "Scan box"}
            </Button>
          </div>

          {imeiTouched && !imeiOk && (
            <p className="mt-2 text-xs text-[hsl(var(--arrears))]" role="alert">
              That IMEI fails the checksum. Re-scan the box or key it in again.
            </p>
          )}
          {imeiOk && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[hsl(var(--mpesa))]">
              <Check className="size-3.5" />
              Checksum valid · handset not linked to any other contract
            </p>
          )}

          {!draft.device.vtrustReady && (
            <div className="mt-4 rounded-lg bg-[hsl(var(--arrears))]/10 p-3 text-sm text-[hsl(var(--arrears))]">
              This SKU has no factory lock profile yet. Sell it for cash, or ask the
              regional team to enrol the batch with VTrust first.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
