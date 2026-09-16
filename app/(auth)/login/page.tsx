"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normaliseMsisdn } from "@/lib/hp";

export default function LoginPage() {
  const router = useRouter();
  const [msisdn, setMsisdn] = useState("0712 408 551");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const normalised = normaliseMsisdn(msisdn);
    if (!normalised) return setError("That is not a valid Kenyan number.");
    if (pin.length !== 4) return setError("Your staff PIN is 4 digits.");
    setError(null);
    setBusy(true);
    setTimeout(() => router.push(`/verify?msisdn=${normalised}`), 800);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Use the number registered to your store.
      </p>

      <div className="mt-8 space-y-4">
        <div>
          <Label htmlFor="msisdn">Phone number</Label>
          <Input
            id="msisdn"
            inputMode="tel"
            value={msisdn}
            onChange={(e) => setMsisdn(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="mt-1.5 tnum"
          />
        </div>

        <div>
          <Label htmlFor="pin">Staff PIN</Label>
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="mt-1.5 tracking-[0.3em] tnum"
          />
        </div>

        {error && (
          <p className="text-sm text-[hsl(var(--arrears))]" role="alert">
            {error}
          </p>
        )}

        <Button className="w-full" size="lg" onClick={submit} disabled={busy}>
          {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
          {busy ? "Sending code" : "Send me a code"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Forgotten your PIN? Your regional manager can reset it.
        </p>
      </div>
    </div>
  );
}
