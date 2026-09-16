"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, FileBarChart, Package, FilePlus2,
  Menu, X, LogOut, ShieldCheck, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MERCHANT } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/origination", label: "New contract", icon: FilePlus2, primary: true },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/products", label: "HP products", icon: Package },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

export function MerchantShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Mobile bar */}
      <header className="flex items-center justify-between border-b bg-[hsl(var(--ink))] px-4 py-3 text-white lg:hidden">
        <Brand />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-md p-2 hover:bg-white/10"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      <aside
        className={cn(
          "flex-col bg-[hsl(var(--ink))] text-white lg:flex lg:h-screen lg:sticky lg:top-0",
          open ? "flex" : "hidden"
        )}
      >
        <div className="hidden px-5 py-5 lg:block">
          <Brand />
        </div>

        <div className="mx-4 mb-4 rounded-lg bg-white/[0.06] px-3 py-2.5">
          <p className="text-[13px] font-medium leading-snug">{MERCHANT.storeName}</p>
          <p className="mt-0.5 text-[11px] text-white/55 tnum">
            {MERCHANT.storeCode} · {MERCHANT.region}
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map(({ href, label, icon: Icon, primary }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[hsl(var(--vivo-blue))] font-medium text-white"
                    : "text-white/70 hover:bg-white/[0.07] hover:text-white",
                  primary && !active && "text-white"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-2 px-2 py-1.5 text-[11px] text-white/50">
            <ShieldCheck className="size-3.5 shrink-0 text-[hsl(var(--statute))]" />
            <span className="leading-tight">{MERCHANT.licence}</span>
          </div>
          <button className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-white/[0.07]">
            <span className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-full bg-[hsl(var(--vivo-blue))] text-xs font-semibold">
                WK
              </span>
              <span>
                <span className="block text-[13px] font-medium">{MERCHANT.agentName}</span>
                <span className="block text-[11px] text-white/50">{MERCHANT.agentRole}</span>
              </span>
            </span>
            <ChevronDown className="size-4 text-white/40" />
          </button>
        </div>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded bg-[hsl(var(--vivo-blue))] text-[13px] font-bold">
        v
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        vivo <span className="font-normal text-white/60">Hire Purchase</span>
      </span>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b bg-card px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SignOutButton() {
  return (
    <Button variant="ghost" size="sm" className="text-muted-foreground">
      <LogOut className="mr-2 size-4" />
      Sign out
    </Button>
  );
}
