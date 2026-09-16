# vivo Hire Purchase — Merchant portal

Prototype for the Kenya pilot. Store staff use this to write hire purchase
contracts, chase arrears, and see what the branch is owed. No backend: every
screen runs off `lib/mock-data.ts` and local component state.

## Getting it running

```bash
npm install
npx shadcn@latest add button input label badge select slider checkbox
npm run dev
```

Sign in with any Kenyan number and a 4-digit PIN. The OTP is `204815` and it
is printed on the screen — this is a demo build.

## Route map

```
app/
├─ (auth)/
│  ├─ layout.tsx            split screen, brand panel on the right
│  ├─ login/page.tsx        phone + staff PIN
│  └─ verify/page.tsx       6-digit OTP, paste-aware, 30s resend
└─ (merchant)/
   ├─ layout.tsx            wraps everything in MerchantShell
   ├─ dashboard/page.tsx    branch metrics, arrears queue, VTrust estate
   ├─ origination/page.tsx  ← the five-step contract flow
   ├─ customers/page.tsx    search, filter, table on desktop / cards on mobile
   ├─ products/page.tsx     HP products priced against a reference handset
   └─ reports/page.tsx      collections, ageing, dealer settlement

components/
├─ shell/merchant-shell.tsx sidebar, branch context, PageHeader, mobile nav
└─ origination/
   ├─ origination-flow.tsx  step machine + per-step validation gates
   ├─ contract-rail.tsx     sticky live pricing panel
   ├─ step-device.tsx       device picker, IMEI capture, VTrust readiness
   ├─ step-customer.tsx     KYC, guarantor, documents, IPRS + negative list
   ├─ step-terms.tsx        product, deposit, frequency, tenor, grace, affordability
   ├─ step-review.tsx       read-back, deposit method, three consents
   └─ step-activate.tsx     STK Push sequence → VTrust enrolment → success

lib/
├─ hp.ts                    schedule engine, Cap 507 threshold, KE validators
├─ types.ts                 Device, HPProduct, Customer, OriginationDraft
└─ mock-data.ts             devices, products, customers, M-Pesa & VTrust config
```

## Design decisions worth defending on Friday

**The contract rail is the centrepiece.** It sits beside every step from device
selection to signature and recomputes as terms move. A Kenyan customer at the
counter asks two questions — *how much today* and *how much a day* — so those
two figures are the largest thing on screen and everything else is quiet around
them. Turn the laptop toward the customer during the demo; that is the intended
use.

**Cap 507's two-thirds rule is a first-class UI state, not fine print.** Once
the hirer has paid two-thirds of the HP price, the owner cannot repossess
without a court order, so the platform must refuse to issue the lock command
rather than trusting collections to remember. It gets its own colour (violet,
`--statute`) because "protected by law" is neither a success nor an error for
the merchant, it appears in the rail with a progress bar and an instalment
number, it is one of the three consents the merchant reads aloud, and it shows
on the dashboard as a population count. Anyone assessing legal risk will look
for this.

**Colour is load-bearing.** M-Pesa green appears only where money has actually
arrived. Amber is arrears and lock warnings. vivo blue is for actions and the
current step. Nothing is coloured decoratively.

**Daily and weekly, never monthly.** Every tenor control, every label, and the
affordability calculation work in days and weeks, because a boda rider's
cashflow does. Monthly framing would quietly misrepresent the product.

**Motion appears once.** The STK Push wait state pulses, because the merchant
genuinely needs to know Safaricom's callback is still pending. Nothing else
animates on load. `prefers-reduced-motion` is respected globally.

## The two-thirds engine

`buildSchedule()` in `lib/hp.ts` is the single source of pricing truth — the
rail, the review step and the activation receipt all read from it, so they
cannot drift apart. Instalments round up to the nearest 10 KES because
merchants collect cash, not cents.

```
deposit           = cashPrice × depositRatio
financed          = cashPrice − deposit
serviceCharge     = financed × (monthlyRate/100) × (tenorDays/30)   flat
hpPrice           = cashPrice + serviceCharge + processingFee
instalment        = ceil((hpPrice − deposit) / instalmentCount) → nearest 10
lockProtection    = hpPrice × 2/3            ← Cap 507 s.15
```

Change the flat service charge to reducing balance in one place if credit asks.

## Mock data grounding

Kenyan National IDs (7–8 digits), `+254` MSISDNs normalised for STK Push, IMEIs
validated with Luhn, KES formatted via `Intl.NumberFormat("en-KE")` with tabular
figures so nothing jumps as it recalculates. Paybill `4071923`, Safaricom's
250k per-transaction ceiling, a 23:30 EAT settlement cut-off, and VTrust running
in event mode with a 4-hour heartbeat and a 24-hour arrears grace before the
lock fires.

## Boundaries with the Backoffice and USSD builds

Three things belong to Tito's surfaces, and this portal deliberately does not
do them:

- **Pricing authority.** Merchants read HP products; only Backoffice writes
  them. `products/page.tsx` has no edit affordance on purpose.
- **Lock commands.** The merchant sees lock *state*. Issuing or lifting a lock
  is a Backoffice action against the VTrust webhook.
- **Self-service repayment.** Customers repay via USSD or Paybill directly. The
  merchant never touches an instalment after the deposit.

If `lib/hp.ts` and `lib/types.ts` are lifted into a shared package, all three
interfaces price identically and the two-thirds rule is enforced once rather
than three times. Worth agreeing before either of you builds further.

## Known gaps

No persistence, so a refresh clears the draft. Document capture toggles a flag
instead of opening a camera. The IPRS and negative-list checks are timers —
IDs ending in 7 come back flagged, which is how to demo the escalation path.
Print and export buttons are inert.
