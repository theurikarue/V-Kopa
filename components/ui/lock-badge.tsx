import { Badge } from "@/components/ui/badge";
import { Lock, ShieldCheck } from "lucide-react";

export function LockBadge({ state }: { state: string }) {
  if (state === "locked")
    return (
      <Badge className="border-transparent bg-[hsl(var(--arrears))]/12 font-normal text-[hsl(var(--arrears))] hover:bg-[hsl(var(--arrears))]/12">
        <Lock className="mr-1 size-3" />
        Locked
      </Badge>
    );
  if (state === "lock_blocked")
    return (
      <Badge className="border-transparent bg-[hsl(var(--statute))]/12 font-normal text-[hsl(var(--statute))] hover:bg-[hsl(var(--statute))]/12">
        <ShieldCheck className="mr-1 size-3" />
        Lock retired
      </Badge>
    );
  if (state === "released")
    return <Badge variant="secondary" className="font-normal">Owned outright</Badge>;
  return (
    <Badge className="border-transparent bg-[hsl(var(--mpesa))]/12 font-normal text-[hsl(var(--mpesa))] hover:bg-[hsl(var(--mpesa))]/12">
      Active
    </Badge>
  );
}