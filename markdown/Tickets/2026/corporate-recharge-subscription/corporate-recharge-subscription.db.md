
# Corporate Recharge Subscription — DB Design

---

## Pricing Reference (hardcoded defaults, overridable by worko-admin via `corporateSubscriptionPricingConfig`)

| Entity     | Plan      | Price/entity/month | Cycle months | Total per entity per cycle |
|------------|-----------|--------------------|--------------|---------------------------|
| RECRUITER  | QUARTERLY | ₹2000              | 3            | ₹6000                     |
| RECRUITER  | ANNUALLY  | ₹1500              | 12           | ₹18000                    |
| EVALUATOR  | QUARTERLY | ₹666.6 (2000/3)    | 3            | ₹2000                     |
| EVALUATOR  | ANNUALLY  | ₹500               | 12           | ₹6000                     |

Free quota:
- RECRUITER → 1 free invite (corporate-admin gets 1 free slot before subscription required)
- EVALUATOR → 4 free sends (corporate-admin gets 4 free eval sends before subscription required)

---

## Enums

```ts
enum CorporateSubscriptionEntityTypeEnum {
  RECRUITER = "RECRUITER",
  EVALUATOR = "EVALUATOR",
}

enum CorporateSubscriptionPlanTypeEnum {
  QUARTERLY = "QUARTERLY",  // 3 months
  ANNUALLY  = "ANNUALLY",   // 12 months
}

enum CorporateSubscriptionStatusEnum {
  ACTIVE    = "ACTIVE",     // subscription running, auto-renew ON
  CANCELLED = "CANCELLED",  // auto-renew turned OFF; still usable until currentPeriodEnd
  EXPIRED   = "EXPIRED",    // currentPeriodEnd passed, no active plan
}

enum CorporateSubscriptionActionTypeEnum {
  FIRST_BUY    = "FIRST_BUY",    // very first subscription purchase
  ADD_ENTITY   = "ADD_ENTITY",   // add more recruiters/evaluators mid-cycle
  UPGRADE_PLAN = "UPGRADE_PLAN", // quarterly → annually mid-cycle
  RENEW_PLAN   = "RENEW_PLAN",   // renew at end of cycle (last 15 days or on expiry)
  CANCEL_RENEW = "CANCEL_RENEW", // turn off auto-debit
  AUTO_DEBIT   = "AUTO_DEBIT",   // razorpay webhook: cycle rolled over automatically
}

enum CorporateSubscriptionTxnStatusEnum {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED  = "FAILED",
}
```

---

## Firestore Collections

### 1. `corporateSubscriptionPricingConfig`
> worko-admin can update pricing from admin dashboard. One document per entityType+planType.

**Document id:** `{entityType}#{planType}`
e.g. `RECRUITER#QUARTERLY`, `RECRUITER#ANNUALLY`, `EVALUATOR#QUARTERLY`, `EVALUATOR#ANNUALLY`

```ts
interface DbCorporateSubscriptionPricingConfigDto {
  id: string;                                      // "RECRUITER#QUARTERLY"
  entityType: CorporateSubscriptionEntityTypeEnum;
  planType: CorporateSubscriptionPlanTypeEnum;

  /**
   * Price per entity per month (INR)
   * RECRUITER QUARTERLY → 2000
   * RECRUITER ANNUALLY  → 1500
   * EVALUATOR QUARTERLY → 666.6
   * EVALUATOR ANNUALLY  → 500
   */
  pricePerEntityPerMonth: number;

  /** 3 for QUARTERLY, 12 for ANNUALLY */
  durationMonths: number;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}
```

---

### 2. `corporateSubscriptions`
> One document per (corporateAdminId + entityType). Always at most ONE active subscription per entity type per corporate-admin.

**Document id:** `{corporateAdminId}#{entityType}`
e.g. `01JXXX#RECRUITER`, `01JXXX#EVALUATOR`

```ts
interface DbCorporateSubscriptionDto {
  id: string;          // "{corporateAdminId}#{entityType}"
  createdAt: string;   // ISO
  updatedAt: string;   // ISO

  // ── Owner ──────────────────────────────────────────────────────────────
  /** @reference id of CorporateUser.model.ts (corporate-admin only) */
  corporateAdminId: string;
  corporateAdminEmail: string;
  companyId: string;

  entityType: CorporateSubscriptionEntityTypeEnum;

  // ── Plan ───────────────────────────────────────────────────────────────
  planType: CorporateSubscriptionPlanTypeEnum;
  status: CorporateSubscriptionStatusEnum;

  /**
   * Total entity slots purchased for the CURRENT cycle.
   * e.g. started with 2 recruiters, added 3 mid-cycle → totalEntityCount = 5
   */
  totalEntityCount: number;

  /**
   * Slots consumed (invite sent / eval sent) in the CURRENT cycle.
   * Reset to 0 on every new cycle (auto-debit / renew).
   */
  usedEntityCount: number;

  /**
   * remainingEntityCount = totalEntityCount - usedEntityCount
   * Stored for fast reads; always kept in sync.
   */
  remainingEntityCount: number;

  // ── Cycle dates ────────────────────────────────────────────────────────
  currentPeriodStart: string;   // ISO — e.g. "2026-01-01"
  currentPeriodEnd: string;     // ISO — e.g. "2026-03-31" (quarterly) | "2026-12-31" (annually)

  /**
   * nextBillingDate = currentPeriodEnd + 1 day
   * null when status = CANCELLED or EXPIRED
   */
  nextBillingDate: string | null; // ISO

  // ── Razorpay ───────────────────────────────────────────────────────────
  /**
   * Razorpay subscription id — used to cancel/update on Razorpay side.
   * @see https://razorpay.com/docs/api/payments/subscriptions/
   */
  razorpaySubscriptionId: string | null;

  /** Razorpay plan id linked to the current subscription */
  razorpayPlanId: string | null;

  // ── Pricing snapshot for current cycle ────────────────────────────────
  pricePerEntityPerMonth: number;
  durationMonths: number;

  // ── Auto-renew ─────────────────────────────────────────────────────────
  /**
   * true  → Razorpay auto-debits on nextBillingDate
   * false → subscription expires on currentPeriodEnd (status = CANCELLED)
   */
  isAutoRenewEnabled: boolean;

  // ── Free quota ─────────────────────────────────────────────────────────
  /**
   * RECRUITER: freeQuotaTotal = 1
   * EVALUATOR: freeQuotaTotal = 4
   * Once freeQuotaUsed >= freeQuotaTotal, subscription is required.
   */
  freeQuotaTotal: number;
  freeQuotaUsed: number;
}
```

---

### 3. `corporateSubscriptionTransactions`
> One document per payment event. Used for transaction history listing.

**Document id:** `ulid()`

```ts
interface DbCorporateSubscriptionTransactionDto {
  id: string;        // ulid()
  createdAt: string; // ISO
  updatedAt: string; // ISO

  /** @reference id of DbCorporateSubscriptionDto */
  corporateSubscriptionId: string;

  /** @reference id of CorporateUser.model.ts (corporate-admin) */
  corporateAdminId: string;
  corporateAdminEmail: string;
  companyId: string;

  entityType: CorporateSubscriptionEntityTypeEnum;
  actionType: CorporateSubscriptionActionTypeEnum;
  planType: CorporateSubscriptionPlanTypeEnum;

  /**
   * Entity slots involved in this transaction.
   * ADD_ENTITY       → only newly added count (e.g. 3)
   * FIRST_BUY/RENEW  → total count for the cycle (e.g. 8)
   * AUTO_DEBIT       → total count for the new cycle
   */
  entityCount: number;

  // ── Amount breakdown ───────────────────────────────────────────────────
  grossAmount: number;       // before credit adjustment
  creditAdjustment: number;  // unused period credit deducted (upgrade scenario); 0 otherwise
  couponDiscountAmount: number; // worko-admin coupon discount; 0 otherwise
  finalAmount: number;       // grossAmount - creditAdjustment - couponDiscountAmount

  // ── Cycle this transaction covers ──────────────────────────────────────
  periodStart: string; // ISO
  periodEnd: string;   // ISO

  // ── Payment ────────────────────────────────────────────────────────────
  status: CorporateSubscriptionTxnStatusEnum;

  /**
   * Razorpay order id (one-time payment via Orders API)
   * OR Razorpay subscription charge id (auto-debit via Subscriptions API)
   */
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;

  // ── Coupon ─────────────────────────────────────────────────────────────
  couponCode: string | null;

  // ── Pricing snapshot ───────────────────────────────────────────────────
  pricePerEntityPerMonth: number;
  durationMonths: number;
}
```

---

### 4. `corporateEntitySubscriptionWallets`
> One document per (corporateAdminId + entityType). Tracks lifetime totals + current available count for fast dashboard reads.

**Document id:** `{corporateAdminId}#{entityType}`

```ts
interface DbCorporateEntitySubscriptionWalletDto {
  id: string;        // "{corporateAdminId}#{entityType}"
  createdAt: string; // ISO
  updatedAt: string; // ISO

  /** @reference id of CorporateUser.model.ts */
  corporateAdminId: string;
  corporateAdminEmail: string;

  entityType: CorporateSubscriptionEntityTypeEnum;

  // ── RECRUITER fields (entityType = RECRUITER) ──────────────────────────
  /**
   * Current cycle remaining recruiter slots.
   * Mirrors DbCorporateSubscriptionDto.remainingEntityCount for RECRUITER.
   */
  totalAvailableEntityCount: number;

  /** Lifetime total recruiter invites sent across all cycles */
  totalUsedEntityCount: number;

  // ── Common ─────────────────────────────────────────────────────────────
  /** Lifetime total amount paid (INR) across all successful transactions */
  totalAmountPaid: number;
}
```

---

### 5. `corporateSubscriptionPendingDeactivations`
> Scheduled deactivations when corp-admin cancels auto-renew OR renews with fewer entity slots.
> Processed by AWS EventBridge scheduler on `deactivateOn` date.

**Document id:** `ulid()`

```ts
interface DbCorporateSubscriptionPendingDeactivationDto {
  id: string;        // ulid()
  createdAt: string; // ISO
  updatedAt: string; // ISO

  /** @reference id of DbCorporateSubscriptionDto */
  corporateSubscriptionId: string;

  corporateAdminId: string;
  companyId: string;

  entityType: CorporateSubscriptionEntityTypeEnum;

  /**
   * Date deactivation should be applied = currentPeriodEnd of the subscription.
   * e.g. "2026-03-31"
   */
  deactivateOn: string; // ISO

  /**
   * RECRUITER → list of CorporateUserInvite.id to set isDeleted=true
   * EVALUATOR → list of EvaluatorDetail.id to set isReadOnly=true
   */
  entityIdsToDeactivate: string[];

  isProcessed: boolean;

  /** @reference AWS EventBridge schedule name/id */
  awsScheduleId: string | null;
}
```

---

## Collection Summary

| Firestore Collection                         | Document id pattern              | DB       |
|----------------------------------------------|----------------------------------|----------|
| `corporateSubscriptionPricingConfig`         | `{entityType}#{planType}`        | Firestore |
| `corporateSubscriptions`                     | `{corporateAdminId}#{entityType}`| Firestore |
| `corporateSubscriptionTransactions`          | `ulid()`                         | Firestore |
| `corporateEntitySubscriptionWallets`         | `{corporateAdminId}#{entityType}`| Firestore |
| `corporateSubscriptionPendingDeactivations`  | `ulid()`                         | Firestore |

Existing DynamoDB tables touched (no schema change, only field updates):

| DynamoDB Table / Model       | Field touched                          | When                                      |
|------------------------------|----------------------------------------|-------------------------------------------|
| `CorporateUserInvite`        | `isDeleted = true`                     | RECRUITER deactivation on period end      |
| `CorporateUser`              | `isDeleted = true`                     | RECRUITER login block on period end       |
| `EvaluatorDetail`            | `isReadOnly = true` *(new field)*      | EVALUATOR subscription expired/cancelled  |
| `RequestEvaluation`          | read only — no write                   | Subscription check before eval send       |
| `UserJobApplication`         | read only — no write                   | Subscription check before eval send       |

---

## Fields Updated Per Action

### `corporateSubscriptions` document

| Action        | Fields updated                                                                                                                                                                  |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| FIRST_BUY     | All fields set fresh. `usedEntityCount=0`, `freeQuotaUsed` unchanged, `status=ACTIVE`, `isAutoRenewEnabled=true`                                                               |
| ADD_ENTITY    | `totalEntityCount +=N`, `remainingEntityCount +=N`, `razorpaySubscriptionId` (updated plan), `razorpayPlanId`, `pricePerEntityPerMonth`, `nextBillingDate`                      |
| UPGRADE_PLAN  | `planType`, `totalEntityCount`, `remainingEntityCount`, `currentPeriodStart=today`, `currentPeriodEnd=new end`, `nextBillingDate`, `razorpaySubscriptionId`, `razorpayPlanId`, `pricePerEntityPerMonth`, `durationMonths` |
| RENEW_PLAN    | `planType`, `totalEntityCount`, `usedEntityCount=0`, `remainingEntityCount=totalEntityCount`, `currentPeriodStart`, `currentPeriodEnd`, `nextBillingDate`, `razorpaySubscriptionId`, `razorpayPlanId`, `pricePerEntityPerMonth`, `durationMonths`, `status=ACTIVE`, `isAutoRenewEnabled=true` |
| CANCEL_RENEW  | `isAutoRenewEnabled=false`, `status=CANCELLED`, `nextBillingDate=null`                                                                                                          |
| AUTO_DEBIT    | `usedEntityCount=0`, `remainingEntityCount=totalEntityCount`, `currentPeriodStart`, `currentPeriodEnd`, `nextBillingDate`                                                       |

### `corporateEntitySubscriptionWallets` document

| Action           | Fields updated                                                                                      |
|------------------|-----------------------------------------------------------------------------------------------------|
| FIRST_BUY        | `totalAvailable* = totalEntityCount`, `totalAmountPaid += finalAmount`                              |
| ADD_ENTITY       | `totalAvailable* += N`, `totalAmountPaid += finalAmount`                                            |
| UPGRADE_PLAN     | `totalAvailable* = new remainingEntityCount`, `totalAmountPaid += finalAmount`                      |
| RENEW_PLAN       | `totalAvailable* = new totalEntityCount`, `totalAmountPaid += finalAmount`                          |
| AUTO_DEBIT       | `totalAvailable* = totalEntityCount` (reset for new cycle), `totalAmountPaid += finalAmount`        |
| invite/eval-send | `totalAvailable* -= 1`, `totalUsed* += 1`                                                           |

---

## Key Business Rules (DB enforcement)

1. **Free quota check before subscription check:**
   - RECRUITER: if `freeQuotaUsed < freeQuotaTotal (1)` → allow invite, increment `freeQuotaUsed`, no subscription needed.
   - EVALUATOR: if `freeQuotaUsed < freeQuotaTotal (4)` → allow eval send, increment `freeQuotaUsed`, no subscription needed.

2. **Subscription required when:** `freeQuotaUsed >= freeQuotaTotal` AND `remainingEntityCount == 0`.

3. **Recruiter login check:** On every corporate-recruiter login, fetch `corporateSubscriptions` doc for their `corporateAdminId#RECRUITER`. If `status = EXPIRED` → block login, send email to corp-admin.

4. **Evaluator login check:** On every evaluator login, fetch `corporateSubscriptions` doc for their linked `corporateAdminId#EVALUATOR`. If `status = EXPIRED` → set `isReadOnly=true` (do NOT block login, give read-only access).

5. **Renew Plan button visibility:** Show only when `currentPeriodEnd - today <= 15 days` OR `status = EXPIRED`.

6. **Downgrade at renewal:** If new `entityCount < current active invites/evals count` → force corp-admin to select which ones to deactivate before payment. Store selected ids in `corporateSubscriptionPendingDeactivations` with `deactivateOn = new currentPeriodEnd`.

7. **Cancel auto-renew:** Creates a `corporateSubscriptionPendingDeactivations` doc for ALL active recruiter invites / evaluator logins with `deactivateOn = currentPeriodEnd`.

8. **Upgrade mid-cycle credit formula:**
   - `creditAdjustment = existingEntityCount × unusedMonths × oldPricePerEntityPerMonth`
   - `grossAmount = (existingEntityCount + newEntityCount) × remainingMonthsInNewPlan × newPricePerEntityPerMonth`
   - `finalAmount = grossAmount - creditAdjustment`

9. **Add entity mid-cycle formula:**
   - `finalAmount = newEntityCount × pricePerEntityPerMonth × remainingMonthsInCycle`
   - Next auto-debit = `(existingEntityCount + newEntityCount) × pricePerEntityPerMonth × durationMonths`
