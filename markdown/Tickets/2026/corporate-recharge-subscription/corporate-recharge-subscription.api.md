# Corporate Recharge Subscription — API Documentation

**Base URL:** `/v1/corporate/subscription`
**Auth:** Bearer token (corporate-admin JWT) unless noted otherwise.

---

## Enums

```ts
CorporateSubscriptionEntityTypeEnum = "RECRUITER" | "EVALUATOR"
CorporateSubscriptionPlanTypeEnum   = "QUARTERLY" | "ANNUALLY"
CorporateSubscriptionStatusEnum     = "ACTIVE" | "CANCELLED" | "EXPIRED"
CorporateSubscriptionActionTypeEnum = "FIRST_BUY" | "ADD_ENTITY" | "UPGRADE_PLAN" | "RENEW_PLAN" | "CANCEL_RENEW" | "AUTO_DEBIT"
CorporateSubscriptionTxnStatusEnum  = "PENDING" | "SUCCESS" | "FAILED"
```

---

## 1. Get Subscription Dashboard

Returns the active subscription + wallet summary for a given entity type.

```
GET /v1/corporate/subscription/dashboard?entityType=RECRUITER
```

**Query Params**

| Param        | Type                                    | Required |
|--------------|-----------------------------------------|----------|
| `entityType` | `CorporateSubscriptionEntityTypeEnum`   | Yes      |

**Response 200**

```json
{
  "subscription": {
    "id": "01JXXX#RECRUITER",
    "entityType": "RECRUITER",
    "planType": "QUARTERLY",
    "status": "ACTIVE",
    "totalEntityCount": 5,
    "usedEntityCount": 2,
    "remainingEntityCount": 3,
    "currentPeriodStart": "2026-01-01",
    "currentPeriodEnd": "2026-03-31",
    "nextBillingDate": "2026-04-01",
    "pricePerEntityPerMonth": 2000,
    "durationMonths": 3,
    "isAutoRenewEnabled": true,
    "freeQuotaTotal": 1,
    "freeQuotaUsed": 1,
    "razorpaySubscriptionId": "sub_xxx",
    "razorpayPlanId": "plan_xxx"
  },
  "wallet": {
    "totalAvailableRecruiterCount": 3,
    "totalUsedRecruiterCount": 2,
    "totalAmountPaid": 30000
  },
  "showRenewButton": false
}
```

> `showRenewButton = true` when `currentPeriodEnd - today <= 15 days` OR `status = EXPIRED`.

**Response 200 (no subscription yet)**

```json
{
  "subscription": null,
  "wallet": null,
  "showRenewButton": false
}
```

---

## 2. Get Pricing Config

Returns current pricing for all entity+plan combinations. Used to render pricing UI.

```
GET /v1/corporate/subscription/pricing
```

**Response 200**

```json
[
  { "id": "RECRUITER#QUARTERLY", "entityType": "RECRUITER", "planType": "QUARTERLY", "pricePerEntityPerMonth": 2000, "durationMonths": 3 },
  { "id": "RECRUITER#ANNUALLY",  "entityType": "RECRUITER", "planType": "ANNUALLY",  "pricePerEntityPerMonth": 1500, "durationMonths": 12 },
  { "id": "EVALUATOR#QUARTERLY", "entityType": "EVALUATOR", "planType": "QUARTERLY", "pricePerEntityPerMonth": 666.6, "durationMonths": 3 },
  { "id": "EVALUATOR#ANNUALLY",  "entityType": "EVALUATOR", "planType": "ANNUALLY",  "pricePerEntityPerMonth": 500,  "durationMonths": 12 }
]
```

---

## 3. Calculate Quote

Preview the amount before any payment action. No DB write.

```
POST /v1/corporate/subscription/quote
```

**Request Body**

```json
{
  "entityType": "RECRUITER",
  "actionType": "FIRST_BUY",
  "planType": "QUARTERLY",
  "entityCount": 2,
  "couponCode": null
}
```

| Field         | Type                                      | Required | Notes                                              |
|---------------|-------------------------------------------|----------|----------------------------------------------------|
| `entityType`  | `CorporateSubscriptionEntityTypeEnum`     | Yes      |                                                    |
| `actionType`  | `CorporateSubscriptionActionTypeEnum`     | Yes      | `FIRST_BUY`, `ADD_ENTITY`, `UPGRADE_PLAN`, `RENEW_PLAN` |
| `planType`    | `CorporateSubscriptionPlanTypeEnum`       | Yes      |                                                    |
| `entityCount` | `number`                                  | Yes      | For `ADD_ENTITY` → newly added count only          |
| `couponCode`  | `string \| null`                          | No       |                                                    |

**Response 200**

```json
{
  "grossAmount": 12000,
  "creditAdjustment": 0,
  "couponDiscountAmount": 0,
  "finalAmount": 12000,
  "pricePerEntityPerMonth": 2000,
  "durationMonths": 3,
  "periodStart": "2026-01-01",
  "periodEnd": "2026-03-31",
  "breakdown": "2 × ₹2000 × 3 months = ₹12000"
}
```

**Upgrade Plan example response**

```json
{
  "grossAmount": 165000,
  "creditAdjustment": 8000,
  "couponDiscountAmount": 0,
  "finalAmount": 157000,
  "pricePerEntityPerMonth": 1500,
  "durationMonths": 12,
  "periodStart": "2026-02-01",
  "periodEnd": "2026-12-31",
  "breakdown": "10 × ₹1500 × 11 months = ₹165000 − ₹8000 credit = ₹157000"
}
```

---

## 4. Create Razorpay Order

Creates a Razorpay order for one-time payment (FIRST_BUY, ADD_ENTITY, UPGRADE_PLAN, RENEW_PLAN).
Also creates a `PENDING` transaction doc in `corporateSubscriptionTransactions`.

```
POST /v1/corporate/subscription/order
```

**Request Body**

```json
{
  "entityType": "RECRUITER",
  "actionType": "FIRST_BUY",
  "planType": "QUARTERLY",
  "entityCount": 2,
  "couponCode": null
}
```

| Field         | Type                                      | Required |
|---------------|-------------------------------------------|----------|
| `entityType`  | `CorporateSubscriptionEntityTypeEnum`     | Yes      |
| `actionType`  | `CorporateSubscriptionActionTypeEnum`     | Yes      |
| `planType`    | `CorporateSubscriptionPlanTypeEnum`       | Yes      |
| `entityCount` | `number`                                  | Yes      |
| `couponCode`  | `string \| null`                          | No       |

**Response 200**

```json
{
  "razorpayOrderId": "order_xxx",
  "razorpayKeyId": "rzp_live_xxx",
  "transactionId": "01JYYY",
  "finalAmount": 12000,
  "currency": "INR"
}
```

**DB Actions**

- `corporateSubscriptionTransactions` → create doc with `status=PENDING`, `razorpayOrderId`, all amount fields, `periodStart`, `periodEnd`, `actionType`, `entityCount`.

---

## 5. Verify Payment & Activate Subscription

Called after Razorpay checkout success. Verifies signature, activates/updates subscription.

```
POST /v1/corporate/subscription/verify-payment
```

**Request Body**

```json
{
  "transactionId": "01JYYY",
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "sig_xxx"
}
```

**Response 200**

```json
{
  "success": true,
  "subscription": {
    "id": "01JXXX#RECRUITER",
    "status": "ACTIVE",
    "totalEntityCount": 2,
    "remainingEntityCount": 2,
    "currentPeriodStart": "2026-01-01",
    "currentPeriodEnd": "2026-03-31",
    "nextBillingDate": "2026-04-01",
    "razorpaySubscriptionId": "sub_xxx",
    "razorpayPlanId": "plan_xxx"
  }
}
```

**DB Actions by `actionType`**

### FIRST_BUY
- `corporateSubscriptions` → create doc: all fields, `usedEntityCount=0`, `status=ACTIVE`, `isAutoRenewEnabled=true`, `freeQuotaUsed` unchanged.
- `corporateEntitySubscriptionWallets` → create/upsert: `totalAvailable*=entityCount`, `totalAmountPaid+=finalAmount`.
- `corporateSubscriptionTransactions` → update: `status=SUCCESS`, `razorpayPaymentId`, `razorpaySignature`.
- Razorpay → create subscription plan + subscription for auto-debit.

### ADD_ENTITY
- `corporateSubscriptions` → update: `totalEntityCount+=N`, `remainingEntityCount+=N`, `razorpaySubscriptionId`, `razorpayPlanId`, `pricePerEntityPerMonth`, `nextBillingDate`.
- `corporateEntitySubscriptionWallets` → update: `totalAvailable*+=N`, `totalAmountPaid+=finalAmount`.
- `corporateSubscriptionTransactions` → update: `status=SUCCESS`.
- Razorpay → update subscription with new plan (new total entity count × price × duration).

### UPGRADE_PLAN
- `corporateSubscriptions` → update: `planType`, `totalEntityCount`, `remainingEntityCount`, `currentPeriodStart=today`, `currentPeriodEnd=new end`, `nextBillingDate`, `razorpaySubscriptionId`, `razorpayPlanId`, `pricePerEntityPerMonth`, `durationMonths`.
- `corporateEntitySubscriptionWallets` → update: `totalAvailable*=new remainingEntityCount`, `totalAmountPaid+=finalAmount`.
- `corporateSubscriptionTransactions` → update: `status=SUCCESS`.
- Razorpay → cancel old subscription, create new subscription plan + subscription.

### RENEW_PLAN
- `corporateSubscriptions` → update: `planType`, `totalEntityCount`, `usedEntityCount=0`, `remainingEntityCount=totalEntityCount`, `currentPeriodStart`, `currentPeriodEnd`, `nextBillingDate`, `razorpaySubscriptionId`, `razorpayPlanId`, `pricePerEntityPerMonth`, `durationMonths`, `status=ACTIVE`, `isAutoRenewEnabled=true`.
- `corporateEntitySubscriptionWallets` → update: `totalAvailable*=totalEntityCount`, `totalAmountPaid+=finalAmount`.
- `corporateSubscriptionTransactions` → update: `status=SUCCESS`.
- Razorpay → cancel old subscription, create new subscription plan + subscription.
- If downgrade: process `corporateSubscriptionPendingDeactivations` (see §10).

---

## 6. Cancel Auto-Renew

Turns off auto-debit. Subscription stays active until `currentPeriodEnd`.

```
POST /v1/corporate/subscription/cancel-renew
```

**Request Body**

```json
{
  "entityType": "RECRUITER"
}
```

**Response 200**

```json
{
  "success": true,
  "message": "Auto-renew cancelled. Subscription active until 2026-03-31.",
  "currentPeriodEnd": "2026-03-31"
}
```

**DB Actions**

- `corporateSubscriptions` → update: `isAutoRenewEnabled=false`, `status=CANCELLED`, `nextBillingDate=null`.
- `corporateSubscriptionTransactions` → create doc: `actionType=CANCEL_RENEW`, `status=SUCCESS`, `finalAmount=0`.
- `corporateSubscriptionPendingDeactivations` → create doc for ALL active recruiter invites / evaluator logins with `deactivateOn=currentPeriodEnd`, `isProcessed=false`.
- AWS EventBridge → schedule job on `deactivateOn` date.
- Razorpay → cancel subscription.

---

## 7. Get Transaction History

```
GET /v1/corporate/subscription/transactions?entityType=RECRUITER&page=1&limit=10
```

**Query Params**

| Param        | Type                                  | Required |
|--------------|---------------------------------------|----------|
| `entityType` | `CorporateSubscriptionEntityTypeEnum` | Yes      |
| `page`       | `number`                              | No (default 1) |
| `limit`      | `number`                              | No (default 10) |

**Response 200**

```json
{
  "transactions": [
    {
      "id": "01JYYY",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "actionType": "FIRST_BUY",
      "planType": "QUARTERLY",
      "entityType": "RECRUITER",
      "entityCount": 2,
      "grossAmount": 12000,
      "creditAdjustment": 0,
      "couponDiscountAmount": 0,
      "finalAmount": 12000,
      "periodStart": "2026-01-01",
      "periodEnd": "2026-03-31",
      "status": "SUCCESS",
      "razorpayOrderId": "order_xxx",
      "razorpayPaymentId": "pay_xxx",
      "couponCode": null,
      "pricePerEntityPerMonth": 2000,
      "durationMonths": 3
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

## 8. Get Wallet

```
GET /v1/corporate/subscription/wallet?entityType=RECRUITER
```

**Query Params**

| Param        | Type                                  | Required |
|--------------|---------------------------------------|----------|
| `entityType` | `CorporateSubscriptionEntityTypeEnum` | Yes      |

**Response 200 — RECRUITER**

```json
{
  "entityType": "RECRUITER",
  "totalAvailableRecruiterCount": 3,
  "totalUsedRecruiterCount": 2,
  "totalAmountPaid": 30000
}
```

**Response 200 — EVALUATOR**

```json
{
  "entityType": "EVALUATOR",
  "totalAvailableEvaluatorCount": 6,
  "totalUsedEvaluatorCount": 4,
  "totalAmountPaid": 8000
}
```

---

## 9. Get Active Recruiters / Evaluators (for Downgrade Selection)

Returns the list of currently active invited recruiters or evaluators so corp-admin can select which to deactivate during downgrade at renewal.

```
GET /v1/corporate/subscription/active-entities?entityType=RECRUITER
```

**Query Params**

| Param        | Type                                  | Required |
|--------------|---------------------------------------|----------|
| `entityType` | `CorporateSubscriptionEntityTypeEnum` | Yes      |

**Response 200 — RECRUITER**

```json
{
  "entityType": "RECRUITER",
  "entities": [
    { "id": "invite_01", "name": "Raj Kumar", "email": "raj@amazon.com", "isActive": true },
    { "id": "invite_02", "name": "Ashutosh S", "email": "ashutosh@amazon.com", "isActive": true }
  ]
}
```

**Response 200 — EVALUATOR**

```json
{
  "entityType": "EVALUATOR",
  "entities": [
    { "id": "eval_01", "name": "Amul Sharma", "email": "amul@amazon.com", "isReadOnly": false }
  ]
}
```

---

## 10. Submit Downgrade Deactivation List

Called before RENEW_PLAN payment when new `entityCount < current active count`. Stores which entities to deactivate at period end.

```
POST /v1/corporate/subscription/downgrade-deactivation
```

**Request Body**

```json
{
  "entityType": "RECRUITER",
  "entityIdsToDeactivate": ["invite_01", "invite_02"],
  "deactivateOn": "2026-03-31"
}
```

| Field                   | Type                                  | Required |
|-------------------------|---------------------------------------|----------|
| `entityType`            | `CorporateSubscriptionEntityTypeEnum` | Yes      |
| `entityIdsToDeactivate` | `string[]`                            | Yes      |
| `deactivateOn`          | `string` (ISO date)                   | Yes      |

**Response 200**

```json
{
  "success": true,
  "pendingDeactivationId": "01JZZZ"
}
```

**DB Actions**

- `corporateSubscriptionPendingDeactivations` → create doc: `subscriptionId`, `entityIdsToDeactivate`, `deactivateOn`, `isProcessed=false`, `awsScheduleId=null`.
- AWS EventBridge → schedule job on `deactivateOn`.

---

## 11. Razorpay Webhook (Auto-Debit)

Called by Razorpay when a subscription cycle auto-debits successfully.

```
POST /v1/corporate/subscription/webhook/razorpay
```

**Headers**

| Header                    | Value                        |
|---------------------------|------------------------------|
| `x-razorpay-signature`    | HMAC-SHA256 of payload       |

**Razorpay Event:** `subscription.charged`

**Request Body (Razorpay payload)**

```json
{
  "event": "subscription.charged",
  "payload": {
    "subscription": { "entity": { "id": "sub_xxx", "plan_id": "plan_xxx" } },
    "payment": { "entity": { "id": "pay_xxx", "amount": 3000000 } }
  }
}
```

**Response 200**

```json
{ "success": true }
```

**DB Actions**

- Lookup `corporateSubscriptions` by `razorpaySubscriptionId`.
- `corporateSubscriptions` → update: `usedEntityCount=0`, `remainingEntityCount=totalEntityCount`, `currentPeriodStart`, `currentPeriodEnd`, `nextBillingDate`.
- `corporateEntitySubscriptionWallets` → update: `totalAvailable*=totalEntityCount`, `totalAmountPaid+=finalAmount`.
- `corporateSubscriptionTransactions` → create doc: `actionType=AUTO_DEBIT`, `status=SUCCESS`, `razorpayPaymentId`, all amount fields.

---

## 12. Worko-Admin: Update Pricing Config

```
PUT /v1/admin/subscription/pricing
```

**Auth:** worko-admin JWT

**Request Body**

```json
{
  "entityType": "RECRUITER",
  "planType": "QUARTERLY",
  "pricePerEntityPerMonth": 2200,
  "durationMonths": 3
}
```

**Response 200**

```json
{
  "success": true,
  "id": "RECRUITER#QUARTERLY",
  "pricePerEntityPerMonth": 2200,
  "durationMonths": 3,
  "updatedAt": "2026-02-01T00:00:00.000Z"
}
```

**DB Actions**

- `corporateSubscriptionPricingConfig` → upsert doc `{entityType}#{planType}`: `pricePerEntityPerMonth`, `durationMonths`, `updatedAt`.

---

## 13. Worko-Admin: Add Entity with Coupon (on behalf of corporate-admin)

```
POST /v1/admin/subscription/add-entity
```

**Auth:** worko-admin JWT

**Request Body**

```json
{
  "corporateAdminId": "01JXXX",
  "entityType": "RECRUITER",
  "planType": "QUARTERLY",
  "entityCount": 3,
  "couponCode": "WORKO50"
}
```

**Response 200**

```json
{
  "success": true,
  "transactionId": "01JYYY",
  "finalAmount": 6000,
  "couponDiscountAmount": 6000
}
```

**DB Actions** — same as §5 ADD_ENTITY flow, with `couponDiscountAmount` applied.

---

## 14. Check Subscription Before Invite / Eval Send (Internal)

Used internally before sending a recruiter invite or evaluator send. Not a public-facing endpoint.

```
POST /v1/corporate/subscription/check
```

**Request Body**

```json
{
  "entityType": "RECRUITER"
}
```

**Response 200 — allowed (free quota)**

```json
{
  "allowed": true,
  "reason": "FREE_QUOTA",
  "remainingFreeQuota": 0
}
```

**Response 200 — allowed (subscription)**

```json
{
  "allowed": true,
  "reason": "SUBSCRIPTION",
  "remainingEntityCount": 2
}
```

**Response 200 — blocked**

```json
{
  "allowed": false,
  "reason": "LIMIT_REACHED",
  "message": "You've reached your recruiter limit. Upgrade your plan to add more recruiters."
}
```

**DB Actions (when allowed)**

- If `freeQuotaUsed < freeQuotaTotal`:
  - `corporateSubscriptions` → update: `freeQuotaUsed+=1`.
- Else:
  - `corporateSubscriptions` → update: `usedEntityCount+=1`, `remainingEntityCount-=1`.
  - `corporateEntitySubscriptionWallets` → update: `totalAvailable*-=1`, `totalUsed*+=1`.

---

## 15. Recruiter Login Check (Internal)

Called on every corporate-recruiter login.

```
POST /v1/corporate/subscription/recruiter-login-check
```

**Request Body**

```json
{
  "corporateAdminId": "01JXXX",
  "recruiterId": "01JRRR"
}
```

**Response 200 — allowed**

```json
{ "allowed": true }
```

**Response 200 — blocked**

```json
{
  "allowed": false,
  "reason": "SUBSCRIPTION_EXPIRED",
  "message": "Your account has been deactivated. Please contact your admin."
}
```

**DB Actions (when blocked)**

- Send email to `corporateAdminEmail` notifying subscription expired.

---

## 16. Evaluator Login Check (Internal)

Called on every evaluator login.

```
POST /v1/corporate/subscription/evaluator-login-check
```

**Request Body**

```json
{
  "corporateAdminId": "01JXXX",
  "evaluatorDetailId": "01JEEE"
}
```

**Response 200 — active**

```json
{ "allowed": true, "isReadOnly": false }
```

**Response 200 — read-only**

```json
{
  "allowed": true,
  "isReadOnly": true,
  "message": "Subscription expired. You have read-only access."
}
```

**DB Actions (when expired)**

- `EvaluatorDetail` (DynamoDB) → update: `isReadOnly=true`.

---

## Error Responses

All endpoints return errors in this shape:

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Descriptive error message"
}
```

| Status | Code                    | When                                                    |
|--------|-------------------------|---------------------------------------------------------|
| 400    | `BAD_REQUEST`           | Invalid payload, missing fields                         |
| 400    | `LIMIT_REACHED`         | No remaining entity slots and free quota exhausted      |
| 400    | `INVALID_COUPON`        | Coupon code not valid or expired                        |
| 400    | `DOWNGRADE_REQUIRED`    | Renewal entity count < active count, must deactivate first |
| 400    | `PAYMENT_FAILED`        | Razorpay payment verification failed                    |
| 403    | `FORBIDDEN`             | Not a corporate-admin                                   |
| 404    | `SUBSCRIPTION_NOT_FOUND`| No subscription doc found for this admin + entityType   |
| 409    | `ALREADY_ACTIVE`        | FIRST_BUY attempted when subscription already active    |

---

## Pricing Formula Reference

| Action       | Formula                                                                                                                                                   |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| FIRST_BUY    | `entityCount × pricePerEntityPerMonth × durationMonths`                                                                                                   |
| ADD_ENTITY   | `newEntityCount × pricePerEntityPerMonth × remainingMonthsInCycle`                                                                                        |
| UPGRADE_PLAN | `grossAmount = (existing + new) × newPrice × remainingMonthsInNewPlan` <br> `creditAdjustment = existing × unusedMonths × oldPrice` <br> `finalAmount = grossAmount − creditAdjustment` |
| RENEW_PLAN   | `entityCount × newPricePerEntityPerMonth × newDurationMonths`                                                                                             |
| AUTO_DEBIT   | `totalEntityCount × pricePerEntityPerMonth × durationMonths` (handled by Razorpay)                                                                        |

---

## DB Collections Touched Per Endpoint

| Endpoint                          | Firestore Collections Written                                                                 | DynamoDB Written                        |
|-----------------------------------|-----------------------------------------------------------------------------------------------|-----------------------------------------|
| `GET /dashboard`                  | read: `corporateSubscriptions`, `corporateEntitySubscriptionWallets`                          | —                                       |
| `GET /pricing`                    | read: `corporateSubscriptionPricingConfig`                                                    | —                                       |
| `POST /quote`                     | read: `corporateSubscriptions`, `corporateSubscriptionPricingConfig`                          | —                                       |
| `POST /order`                     | write: `corporateSubscriptionTransactions` (PENDING)                                          | —                                       |
| `POST /verify-payment`            | write: `corporateSubscriptions`, `corporateEntitySubscriptionWallets`, `corporateSubscriptionTransactions` | —                              |
| `POST /cancel-renew`              | write: `corporateSubscriptions`, `corporateSubscriptionTransactions`, `corporateSubscriptionPendingDeactivations` | —                          |
| `GET /transactions`               | read: `corporateSubscriptionTransactions`                                                     | —                                       |
| `GET /wallet`                     | read: `corporateEntitySubscriptionWallets`                                                    | —                                       |
| `GET /active-entities`            | read: —                                                                                       | read: `CorporateUserInvite` / `EvaluatorDetail` |
| `POST /downgrade-deactivation`    | write: `corporateSubscriptionPendingDeactivations`                                            | —                                       |
| `POST /webhook/razorpay`          | write: `corporateSubscriptions`, `corporateEntitySubscriptionWallets`, `corporateSubscriptionTransactions` | —                              |
| `PUT /admin/pricing`              | write: `corporateSubscriptionPricingConfig`                                                   | —                                       |
| `POST /admin/add-entity`          | write: `corporateSubscriptions`, `corporateEntitySubscriptionWallets`, `corporateSubscriptionTransactions` | —                              |
| `POST /check`                     | write: `corporateSubscriptions`, `corporateEntitySubscriptionWallets`                         | —                                       |
| `POST /recruiter-login-check`     | read: `corporateSubscriptions`                                                                | —                                       |
| `POST /evaluator-login-check`     | read: `corporateSubscriptions`                                                                | write: `EvaluatorDetail` (isReadOnly)   |
