import type { Frequency } from "./hp";

export interface Device {
  sku: string;
  model: string;
  storage: string;
  colour: string;
  cashPrice: number;
  imageHint: string;
  stockAtBranch: number;
  /** Whether VTrust factory lock is pre-provisioned on this SKU. */
  vtrustReady: boolean;
}

export interface HPProduct {
  id: string;
  name: string;
  description: string;
  frequency: Frequency;
  tenorDays: number;
  minDepositRatio: number;
  monthlyServiceRate: number;
  processingFee: number;
  gracePeriodDays: number;
  /** Set by credit policy; merchants cannot go below it. */
  maxTicketSize: number;
  popular?: boolean;
}

export type VTrustState =
  | "unenrolled"
  | "enrolled"
  | "active"
  | "locked"
  | "lock_blocked"
  | "released";

export interface Customer {
  id: string;
  fullName: string;
  nationalId: string;
  msisdn: string;
  county: string;
  since: string;
  contracts: number;
  outstanding: number;
  status: "current" | "arrears" | "settled" | "written_off";
  daysPastDue: number;
  vtrust: VTrustState;
  riskBand: "A" | "B" | "C" | "D";
}

export interface KycDraft {
  fullName: string;
  nationalId: string;
  msisdn: string;
  altMsisdn: string;
  dateOfBirth: string;
  gender: "" | "female" | "male";
  county: string;
  physicalAddress: string;
  employmentType: "" | "salaried" | "self_employed" | "casual" | "student";
  monthlyIncome: string;
  guarantorName: string;
  guarantorMsisdn: string;
  guarantorRelationship: string;
  idFrontCaptured: boolean;
  idBackCaptured: boolean;
  selfieCaptured: boolean;
}

export interface OriginationDraft {
  device: Device | null;
  imei: string;
  product: HPProduct | null;
  depositRatio: number;
  tenorDays: number;
  frequency: Frequency;
  gracePeriodDays: number;
  depositMethod: "mpesa_stk" | "mpesa_paybill" | "cash";
  kyc: KycDraft;
}
