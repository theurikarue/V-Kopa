"use client";

import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shell/merchant-shell";
import { LockBadge } from "@/components/ui/lock-badge";
import { cn } from "@/lib/utils";
import { formatKES, prettyMsisdn } from "@/lib/hp";
import { CUSTOMERS } from "@/lib/mock-data";

const FILTERS = [
  { id: "all", label: "Everyone" },
  { id: "current", label: "Up to date" },
  { id: "arrears", label: "Behind" },
  { id: "settled", label: "Settled" },
] as const;

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CUSTOMERS.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return [c.fullName, c.nationalId, c.msisdn, c.id]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, filter]);

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone who has taken a device from this branch."
        action={
          <Button variant="outline">
            <UserPlus className="mr-2 size-4" />
            Add without a contract
          </Button>
        }
      />

      <div className="px-5 py-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, ID or phone"
              className="pl-9"
              aria-label="Search customers"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={cn(
                  "whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition-colors",
                  filter === f.id
                    ? "border-[hsl(var(--vivo-blue))] bg-[hsl(var(--vivo-blue))]/5 font-medium text-[hsl(var(--vivo-blue))]"
                    : "hover:border-foreground/25"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border bg-card">
          {rows.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="font-medium">No match for “{query}”</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try the National ID, or clear the filter.
              </p>
            </div>
          ) : (
            <>
              {/* Table on wide screens, stacked rows on phones — store staff
                  work off a phone more often than a desktop. */}
              <table className="hidden w-full text-sm md:table">
                <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <Th>Customer</Th>
                    <Th>National ID</Th>
                    <Th>Contracts</Th>
                    <Th className="text-right">Outstanding</Th>
                    <Th>Risk</Th>
                    <Th>Device</Th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <Td>
                        <p className="font-medium">{c.fullName}</p>
                        <p className="text-xs text-muted-foreground tnum">
                          {prettyMsisdn(c.msisdn)} · {c.county}
                        </p>
                      </Td>
                      <Td className="tnum text-muted-foreground">{c.nationalId}</Td>
                      <Td className="tnum">{c.contracts}</Td>
                      <Td className="text-right tnum">
                        <span className={c.daysPastDue > 0 ? "text-[hsl(var(--arrears))]" : ""}>
                          {formatKES(c.outstanding)}
                        </span>
                        {c.daysPastDue > 0 && (
                          <span className="block text-xs text-muted-foreground">
                            {c.daysPastDue} days late
                          </span>
                        )}
                      </Td>
                      <Td>
                        <Badge variant="secondary" className="font-normal">{c.riskBand}</Badge>
                      </Td>
                      <Td><LockBadge state={c.vtrust} /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ul className="divide-y md:hidden">
                {rows.map((c) => (
                  <li key={c.id} className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{c.fullName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground tnum">
                          {prettyMsisdn(c.msisdn)} · ID {c.nationalId}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-sm font-semibold tnum">
                        {formatKES(c.outstanding)}
                      </p>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <LockBadge state={c.vtrust} />
                      <Badge variant="secondary" className="font-normal tnum">
                        {c.contracts} contract{c.contracts === 1 ? "" : "s"}
                      </Badge>
                      {c.daysPastDue > 0 && (
                        <span className="text-xs text-[hsl(var(--arrears))] tnum">
                          {c.daysPastDue} days late
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const Th = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={cn("px-5 py-3 font-normal", className)}>{children}</th>
);
const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={cn("px-5 py-3.5 align-top", className)}>{children}</td>
);
