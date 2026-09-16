"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prettyMsisdn } from "@/lib/hp";

const LENGTH = 6;
/** Demo code. In production this never reaches the client. */
const DEMO_CODE = "204815";

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const msisdn = params.get("msisdn") ?? "254712408551";

  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds === 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const code = digits.join("");

  useEffect(() => {
    if (code.length !== LENGTH) return;
    setBusy(true);
    const t = setTimeout(() => {
      if (code === DEMO_CODE) router.push("/dashboard");
      else {
        setError("That code did not match. Check the SMS and try again.");
        setDigits(Array(LENGTH).fill(""));
        refs.current[0]?.focus();
        setBusy(false);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [code, router]);

  const setAt = (i: number, v: string) => {
    const next = [...digits];
    next[i] = v.slice(-1);
    setDigits(next);
    setError(null);
    if (v && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    setDigits(Array.from({ length: LENGTH }, (_, i) => pasted[i] ?? ""));
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Enter your code</h1>
      <p className="mt-1.5 text-sm text-muted-foreground tnum">
        We sent six digits to {prettyMsisdn(msisdn)}.
      </p>

      <div className="mt-8 flex gap-2" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            maxLength={1}
            autoFocus={i === 0}
            disabled={busy}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => setAt(i, e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
            }}
            className={cn(
              "h-14 w-full rounded-lg border bg-card text-center text-xl font-semibold tnum",
              "focus:border-[hsl(var(--vivo-blue))] focus:outline-none focus:ring-2 focus:ring-ring",
              error && "border-[hsl(var(--arrears))]"
            )}
          />
        ))}
      </div>

      {error && (
        <p className="mt-3 text-sm text-[hsl(var(--arrears))]" role="alert">
          {error}
        </p>
      )}

      {busy && !error && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Checking
        </p>
      )}

      <div className="mt-7 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Use a different number</Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={seconds > 0}
          onClick={() => setSeconds(30)}
          className="tnum"
        >
          {seconds > 0 ? `Resend in ${seconds}s` : "Resend the code"}
        </Button>
      </div>

      <p className="mt-8 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground tnum">
        Demo build — the code is {DEMO_CODE}.
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
