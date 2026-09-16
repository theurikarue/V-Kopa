import type { Customer, Device, HPProduct } from "./types";

/**
 * Demo fixtures. Kenya pilot, Nairobi CBD branch.
 * Prices are indicative vivo Kenya RRP in KES, inclusive of 16% VAT.
 */

export const MERCHANT = {
  storeName: "vivo Experience Store — Moi Avenue",
  storeCode: "KE-NRB-014",
  agentName: "Wanjiru Kamau",
  agentRole: "Store Manager",
  region: "Nairobi",
  licence: "HP Licence Cap 507 · Reg. No. HP/2026/0417",
  timezone: "EAT (UTC+3)",
};

export const MPESA_CONFIG = {
  shortcode: "4071923",
  type: "Paybill" as const,
  accountName: "VIVO HP KENYA LTD",
  accountRefPrefix: "HP",
  stkTimeoutSeconds: 60,
  /** Safaricom per-transaction ceiling for a single customer-to-business push. */
  maxPerTransaction: 250_000,
  maxPerDay: 500_000,
  callbackUrl: "https://hp.vivo-ea.co.ke/api/mpesa/c2b/confirm",
  settlementCutoff: "23:30 EAT",
  chargeBearer: "merchant" as const,
};

export const VTRUST_CONFIG = {
  tenantId: "vivo-ea-ke-prod",
  mode: "event" as const,
  webhook: "https://hp.vivo-ea.co.ke/api/vtrust/events",
  heartbeatMinutes: 240,
  /** Grace window after a missed instalment before the lock command fires. */
  lockDelayHours: 24,
  retryPolicy: "exponential, 5 attempts over 6h",
};

export const DEVICES: Device[] = [
  {
    sku: "VIVO-Y03-464",
    model: "vivo Y03",
    storage: "4GB + 64GB",
    colour: "Vibrant Green",
    cashPrice: 11_999,
    imageHint: "entry",
    stockAtBranch: 42,
    vtrustReady: true,
  },
  {
    sku: "VIVO-Y19S-6128",
    model: "vivo Y19s",
    storage: "6GB + 128GB",
    colour: "Glossy Black",
    cashPrice: 17_499,
    imageHint: "entry",
    stockAtBranch: 27,
    vtrustReady: true,
  },
  {
    sku: "VIVO-Y29-8256",
    model: "vivo Y29 5G",
    storage: "8GB + 256GB",
    colour: "Titanium Silver",
    cashPrice: 27_999,
    imageHint: "mid",
    stockAtBranch: 15,
    vtrustReady: true,
  },
  {
    sku: "VIVO-V40L-8256",
    model: "vivo V40 Lite",
    storage: "8GB + 256GB",
    colour: "Mint Green",
    cashPrice: 39_999,
    imageHint: "mid",
    stockAtBranch: 9,
    vtrustReady: true,
  },
  {
    sku: "VIVO-V50-12256",
    model: "vivo V50",
    storage: "12GB + 256GB",
    colour: "Starry Blue",
    cashPrice: 69_999,
    imageHint: "flagship",
    stockAtBranch: 4,
    vtrustReady: true,
  },
  {
    sku: "VIVO-X200FE-12512",
    model: "vivo X200 FE",
    storage: "12GB + 512GB",
    colour: "Luxe Grey",
    cashPrice: 94_999,
    imageHint: "flagship",
    stockAtBranch: 2,
    vtrustReady: false,
  },
];

export const HP_PRODUCTS: HPProduct[] = [
  {
    id: "hp-daily-90",
    name: "Lipa Kidogo Kidogo",
    description: "Pay a small amount every day. Built for boda riders and market traders.",
    frequency: "daily",
    tenorDays: 90,
    minDepositRatio: 0.2,
    monthlyServiceRate: 6.5,
    processingFee: 500,
    gracePeriodDays: 3,
    maxTicketSize: 45_000,
    popular: true,
  },
  {
    id: "hp-weekly-26w",
    name: "Wiki kwa Wiki",
    description: "One payment a week for six months. Lowest weekly outlay on mid-range devices.",
    frequency: "weekly",
    tenorDays: 182,
    minDepositRatio: 0.25,
    monthlyServiceRate: 5.5,
    processingFee: 750,
    gracePeriodDays: 7,
    maxTicketSize: 80_000,
  },
  {
    id: "hp-daily-45",
    name: "Haraka 45",
    description: "Short 45-day contract. Cheapest total cost, highest daily instalment.",
    frequency: "daily",
    tenorDays: 45,
    minDepositRatio: 0.3,
    monthlyServiceRate: 4.5,
    processingFee: 350,
    gracePeriodDays: 2,
    maxTicketSize: 30_000,
  },
  {
    id: "hp-weekly-52w",
    name: "Flagship Plan",
    description: "Twelve months, weekly. For salaried customers buying V- and X-series.",
    frequency: "weekly",
    tenorDays: 364,
    minDepositRatio: 0.35,
    monthlyServiceRate: 4.9,
    processingFee: 1_500,
    gracePeriodDays: 14,
    maxTicketSize: 150_000,
  },
];

export const COUNTIES = [
  "Nairobi", "Kiambu", "Nakuru", "Mombasa", "Kisumu", "Uasin Gishu",
  "Machakos", "Kajiado", "Meru", "Nyeri", "Kakamega", "Bungoma",
  "Kilifi", "Trans Nzoia", "Kericho", "Garissa",
];

export const RELATIONSHIPS = ["Spouse", "Parent", "Sibling", "Employer", "Chama member", "Friend"];

export const CUSTOMERS: Customer[] = [
  {
    id: "CUS-0041882", fullName: "Brian Otieno Ochieng", nationalId: "32448190",
    msisdn: "254712408551", county: "Nairobi", since: "2026-03-11", contracts: 2,
    outstanding: 8_420, status: "current", daysPastDue: 0, vtrust: "active", riskBand: "A",
  },
  {
    id: "CUS-0041903", fullName: "Faith Njeri Mwangi", nationalId: "29118745",
    msisdn: "254733902114", county: "Kiambu", since: "2026-01-27", contracts: 1,
    outstanding: 21_060, status: "arrears", daysPastDue: 4, vtrust: "locked", riskBand: "C",
  },
  {
    id: "CUS-0041917", fullName: "Abdi Hassan Noor", nationalId: "35720661",
    msisdn: "254721556038", county: "Garissa", since: "2026-05-02", contracts: 1,
    outstanding: 14_900, status: "current", daysPastDue: 0, vtrust: "active", riskBand: "B",
  },
  {
    id: "CUS-0041720", fullName: "Grace Akinyi Owuor", nationalId: "27904412",
    msisdn: "254701338207", county: "Kisumu", since: "2025-11-19", contracts: 3,
    outstanding: 6_310, status: "arrears", daysPastDue: 11, vtrust: "lock_blocked", riskBand: "B",
  },
  {
    id: "CUS-0041955", fullName: "Peter Kiprono Langat", nationalId: "31556203",
    msisdn: "254745019663", county: "Uasin Gishu", since: "2026-06-08", contracts: 1,
    outstanding: 0, status: "settled", daysPastDue: 0, vtrust: "released", riskBand: "A",
  },
  {
    id: "CUS-0041611", fullName: "Mercy Wairimu Kariuki", nationalId: "30188457",
    msisdn: "254798224170", county: "Nakuru", since: "2025-09-30", contracts: 2,
    outstanding: 33_780, status: "arrears", daysPastDue: 27, vtrust: "locked", riskBand: "D",
  },
  {
    id: "CUS-0041988", fullName: "Samuel Mutiso Musyoka", nationalId: "34092318",
    msisdn: "254716770492", county: "Machakos", since: "2026-07-14", contracts: 1,
    outstanding: 19_240, status: "current", daysPastDue: 0, vtrust: "active", riskBand: "B",
  },
];

/** Dashboard tiles. Figures are branch-level, month to date. */
export const BRANCH_METRICS = {
  contractsMtd: 148,
  contractsMtdDelta: 12.4,
  disbursedValueMtd: 3_284_500,
  disbursedValueDelta: 8.1,
  collectedTodayKes: 412_880,
  collectionRate: 0.917,
  activeContracts: 1_042,
  portfolioAtRisk: 0.063,
  arrearsContracts: 66,
  devicesLocked: 23,
  lockProtected: 187,
};

/** 14-day collection trend (KES) for the dashboard sparkline. */
export const COLLECTION_TREND = [
  318_400, 342_900, 289_100, 401_700, 388_250, 366_400, 194_800,
  427_600, 410_300, 398_900, 445_100, 432_700, 389_400, 412_880,
];

export const RECENT_ACTIVITY = [
  { id: "a1", at: "09:41", kind: "payment", text: "M-Pesa SGH4K21QX7 · KSh 620 from +254 712 408 551", tone: "positive" },
  { id: "a2", at: "09:12", kind: "lock", text: "Lock command blocked — CUS-0041720 past two-thirds threshold", tone: "protected" },
  { id: "a3", at: "08:57", kind: "contract", text: "Contract HP-2026-09-1183 activated · vivo Y19s", tone: "neutral" },
  { id: "a4", at: "08:30", kind: "lock", text: "Device locked after 24h arrears grace · CUS-0041611", tone: "warning" },
  { id: "a5", at: "08:02", kind: "payout", text: "Dealer commission settled · KSh 96,400 to Equity ****4471", tone: "neutral" },
] as const;

/** Sample IMEIs that pass the Luhn check, for demo scanning. */
export const DEMO_IMEIS = ["356938035643809", "490154203237518", "351756051523999"];
