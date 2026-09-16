/**
 * Hire Purchase engine — Kenya pilot (Hire Purchase Act, Cap 507).
 *
 * Everything the origination flow shows on screen is derived here so the
 * summary rail, the review step and the eventual contract PDF can never
 * disagree with each other. Pure functions, no React, no I/O.
 */

export type Frequency = "daily" | "weekly";

export interface HPTerms {
  /** Retail cash price of the device, in KES. */
  cashPrice: number;
  /** 0.10 – 0.60. Regulator-agnostic, but our credit policy floors it at 20%. */
  depositRatio: number;
  /** Total contract length in days. */
  tenorDays: number;
  frequency: Frequency;
  /** Flat service charge per 30 days, applied to the financed amount. */
  monthlyServiceRate: number;
  /** One-off origination fee in KES. */
  processingFee: number;
  /** Days after activation before the first instalment falls due. */
  gracePeriodDays: number;
}

export interface HPSchedule {
  deposit: number;
  financedAmount: number;
  serviceCharge: number;
  processingFee: number;
  /** Deposit + financed + all charges. The figure the 2/3 rule applies to. */
  hpPrice: number;
  balanceAfterDeposit: number;
  instalmentCount: number;
  instalmentAmount: number;
  /** Instalment × count, may exceed balance by a few shillings from rounding. */
  totalOfInstalments: number;
  firstDueDate: Date;
  finalDueDate: Date;
  /** Cumulative paid (incl. deposit) at which remote lock must be disabled. */
  lockProtectionThreshold: number;
  /** Instalment number on which the threshold is crossed. */
  lockProtectionInstalment: number;
  /** Effective cost of credit over the cash price, as a percentage. */
  costOfCreditPct: number;
}

const DAYS_IN: Record<Frequency, number> = { daily: 1, weekly: 7 };

/** Round up to the nearest 10 KES — merchants collect cash, not cents. */
const roundInstalment = (n: number) => Math.ceil(n / 10) * 10;

export function buildSchedule(terms: HPTerms, activationDate = new Date()): HPSchedule {
  const {
    cashPrice,
    depositRatio,
    tenorDays,
    frequency,
    monthlyServiceRate,
    processingFee,
    gracePeriodDays,
  } = terms;

  const deposit = Math.round(cashPrice * depositRatio);
  const financedAmount = cashPrice - deposit;

  const serviceCharge = Math.round(
    financedAmount * (monthlyServiceRate / 100) * (tenorDays / 30)
  );

  const hpPrice = cashPrice + serviceCharge + processingFee;
  const balanceAfterDeposit = hpPrice - deposit;

  const step = DAYS_IN[frequency];
  const instalmentCount = Math.max(1, Math.ceil(tenorDays / step));
  const instalmentAmount = roundInstalment(balanceAfterDeposit / instalmentCount);
  const totalOfInstalments = instalmentAmount * instalmentCount;

  const firstDueDate = addDays(activationDate, gracePeriodDays + step);
  const finalDueDate = addDays(firstDueDate, (instalmentCount - 1) * step);

  const lockProtectionThreshold = Math.round((hpPrice * 2) / 3);
  const shortfall = Math.max(0, lockProtectionThreshold - deposit);
  const lockProtectionInstalment = Math.min(
    instalmentCount,
    Math.ceil(shortfall / instalmentAmount)
  );

  return {
    deposit,
    financedAmount,
    serviceCharge,
    processingFee,
    hpPrice,
    balanceAfterDeposit,
    instalmentCount,
    instalmentAmount,
    totalOfInstalments,
    firstDueDate,
    finalDueDate,
    lockProtectionThreshold,
    lockProtectionInstalment,
    costOfCreditPct: ((hpPrice - cashPrice) / cashPrice) * 100,
  };
}

/**
 * Cap 507 s.15: once the hirer has paid two-thirds of the hire purchase
 * price, the owner may not repossess — and by our own policy the remote
 * lock is disabled — without a court order. The platform blocks the lock
 * command at source rather than relying on collections discipline.
 */
export function lockStatusFor(paidToDate: number, schedule: HPSchedule) {
  const protectedByStatute = paidToDate >= schedule.lockProtectionThreshold;
  const progress = Math.min(1, paidToDate / schedule.lockProtectionThreshold);
  return {
    protectedByStatute,
    progressToProtection: progress,
    remainingToProtection: Math.max(0, schedule.lockProtectionThreshold - paidToDate),
  };
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const kes = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export const formatKES = (n: number) => kes.format(Math.round(n));

export const formatDate = (d: Date) =>
  d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

/** +254 7XX XXX XXX — the format M-Pesa STK Push expects after normalising. */
export function normaliseMsisdn(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  return null;
}

export const prettyMsisdn = (msisdn: string) =>
  msisdn.replace(/^(254)(\d{3})(\d{3})(\d{3})$/, "+$1 $2 $3 $4");

/** Kenyan National ID: 7 or 8 digits. */
export const isValidNationalId = (v: string) => /^\d{7,8}$/.test(v.replace(/\s/g, ""));

/** IMEI check — Luhn over 15 digits. VTrust rejects anything that fails this. */
export function isValidImei(imei: string): boolean {
  const d = imei.replace(/\D/g, "");
  if (d.length !== 15) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let n = Number(d[i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}
