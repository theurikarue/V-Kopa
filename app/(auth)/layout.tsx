export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* Not a stock photo: the panel carries the one fact that distinguishes
          this product from every other lending portal. */}
      <aside className="hidden flex-col justify-between bg-[hsl(var(--ink))] p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded bg-[hsl(var(--vivo-blue))] text-[13px] font-bold">
            v
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            vivo <span className="font-normal text-white/60">Hire Purchase</span>
          </span>
        </div>

        <div className="max-w-md">
          <p className="text-[32px] font-semibold leading-[1.15] tracking-tight">
            A phone today, paid for in shillings a day.
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-white/60">
            Kenya pilot under the Hire Purchase Act, Cap 507. Deposits and instalments
            settle through M-Pesa; handsets are secured with VTrust until two-thirds of
            the price is paid, then the lock is retired for good.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
          {[
            ["1,042", "active contracts"],
            ["91.7%", "collected on time"],
            ["70+", "regions covered"],
          ].map(([v, l]) => (
            <div key={l}>
              <dt className="text-[22px] font-semibold tnum">{v}</dt>
              <dd className="mt-0.5 text-xs text-white/45">{l}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  );
}
