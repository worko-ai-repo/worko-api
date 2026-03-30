
```sh
# Corporate admin: rohith.appala+byjus@worko.ai
https://dev.worko.work/v1/corporate/recruiterRecharge
```

# Requirement Notes Shared By Jeetesh
   1. :dart: BILLING DASHBOARD (ENTRY POINT)
   This is where all actions start.
   Show clearly:

   Active Plan: Quarterly / Annual
   Recruiter Licenses: 4 purchased
   Active Recruiters: 4 / 4 used
   Next Billing Date
   Upgrade CTA


   CTA Buttons:

   :heavy_plus_sign: Add Recruiters
   :arrow_up_small: Upgrade Plan
   :repeat: Renew Plan
   :x: Cancel Auto-Renew


   2. :heavy_plus_sign: ADD RECRUITERS FLOW

   Step 1: Click “Add Recruiters”
   Show modal:

   Input: “Number of recruiters to add”
   Show:
   :point_right:

   Remaining duration
   Price per recruiter
   Total payable (auto-calculated)


   Example UI:
   Adding: 2 recruiters  
   Remaining time: 9 months  

   Cost breakdown:
   2 × ₹1500 × 9 = ₹27,000

   Step 2: CTA

   “Proceed to Payment”


   Step 3: Success

   Licenses updated
   Recruiters can now be added


   3. :arrow_up_small: UPGRADE PLAN FLOW

   Step 1: Click “Upgrade Plan”

   Step 2: Plan Selection Screen
   Show:

   Current plan
   New plan options (Quarterly / Annual)
   Option to change recruiter count


   Step 3: Pricing Breakdown (VERY IMPORTANT)
   Show clearly:
   Current Plan Credit: ₹10,800  
   New Plan Cost: ₹54,000  

   Final Payable: ₹43,200

   Step 4: CTA

   “Upgrade & Pay”


   Step 5: Confirmation Screen

   Plan updated
   New cycle dates shown


   4. :repeat: RENEWAL FLOW

   Trigger:

   7 days before expiry
   On expiry


   UI:

   “Your plan is expiring in X days”


   Step:
   User selects:

   Number of recruiters
   Plan type


   Pricing shown:
   4 recruiters × ₹1500 × 12 months = ₹72,000

   CTA:

   “Renew Plan”


   5. :arrow_down_small: DOWNGRADE FLOW (AT RENEWAL ONLY)

   Scenario:
   User reduces recruiters (e.g., 6 → 4)

   Step 1: Show warning
   “You currently have 6 recruiters but are selecting 4 licenses.”

   Step 2: Force action
   :point_right: Show list of recruiters
   User must:

   Select which 2 to deactivate


   Step 3: Confirmation
   “2 recruiters will lose access after renewal.”

   6. :busts_in_silhouette: ADD RECRUITER FLOW (WHEN LIMIT REACHED)

   Scenario:
   Active recruiters = licenses

   When admin tries to add:
   :x: Block action

   Show:
   “You’ve reached your recruiter limit.
    Upgrade your plan to add more recruiters.”

   CTA:

   “Upgrade Plan”


   7. :closed_lock_with_key: LOGIN BLOCK FLOW (INACTIVE USER)

   Scenario:
   User tries login but is inactive

   Show:
   “You only have 4 recruiter licenses and all are assigned.
    Please ask your admin to remove a recruiter.”



   8. :x: CANCELLATION FLOW

   Step 1: Click “Cancel Auto-Renew”

   Confirmation Screen:
   “Your subscription will remain active till [DATE].
    You will not be charged again.”

   CTA:

   Confirm Cancellation


   9. :warning: IMPORTANT WARNINGS (INLINE UI)

   9.1 While Upgrading
   “Your current plan has unused value which will be adjusted.”

   9.2 While Adding Recruiters
   “You are only paying for the remaining duration of your plan.”

   9.3 While Downgrading
   “Downgrade will apply at next billing cycle. No refunds.”



   10. :fire: EDGE CASE UX HANDLING

   Case 1: Payment Failure
   Show:
   “Payment failed. Your plan remains unchanged.”CTA:

   Retry Payment


   Case 2: More Recruiters Than Allowed (Post Renewal)
   Auto-action:

   Deactivate extra recruiters


   Show banner:
   “Some recruiters were deactivated due to license limit.”

   Case 3: Expired Plan
   Show full-screen block:
   “Your subscription has expired. Renew to continue.”CTA:

   Renew Plan


   Case 4: Admin Removes Recruiter
   Show success:
   “Recruiter removed. You can now add a new recruiter.”



   11. :dart: UX PRINCIPLES (VERY IMPORTANT)

   Always show:

   Cost breakdown (no hidden math)
   Remaining time
   Credit adjustment


   Always guide user to action:

   Upgrade → Add recruiters → Renew


   Avoid confusion:

   Never mix plans
   Never show complex calculations
   Always show final payable clearly



# Corporate Recruiter Subscription by `corporate-admin` Flow
We have `corporate-users`(Refer `CorporateUser.model.ts`) for a particular `company` in `worko` job platform website
1. The `corporat-users` who have `corporat-admin` account we will show the `subscription` page in the `ui`
2. The `corporat-admin` will invite `corporate-recruiters` freely as of now on `prod worko website` and as of now only few active corporate users are present on prod
3. for a `company` only one `corporate-admin` will present and this `corporate-admin` will be invited by `worko-admin`
4. Only `corporat-admin` can invite another `corporate-recruiter`, so we will give `1` free `corporate-recruiter` invite to the `corporate-admin`
5. Subsrciption Page for `corporate-admin`:
   1. Quarterly(3 months): for `quarterly` plan 2000rs/recruiter
      1. `First time buying subscription`
         At very first time lets's say a `corporate-admin` will choose `Quarterly` plan, let's say with `2` recruiters count from `Jan 1st 2026 to March 31st 2026` i.e `2000 x 2 x 3 = 12000`, so `12000rs` will be shown to `corporate-admin` to pay and once he pay, every 3 months it should auto debit the amount from `corporate-admin` bank account(only credit cards are allowed) from razorpay(
            refer `razorpayPayment.library.ts`(https://razorpay.com/docs/api/payments/subscriptions/#plans)
            ) like april 1st 2026 with 12000rs and next ..so on untill `corporate-admin` cancels the auto-debit
      2. Let's say this `corporate-admin` has `2` recruiters from `Jan 1st 2026 to March 31st 2026`
         1. `rohith@amazon.com` as `corporate-admin` will invite(refer `CorporateUserInvite.model.ts`) a `raj@amazon.com` as `corporate-recruiter` then we should deduct one recruiter count from `rohith@amazon.com` in `subscription` and `rohith@amazon.com` as `corporate-admin` will left with `1` which can able to invite another recruiter till `March 31st 2026`
            1. If this `raj@amazon.com` register(refer CorporateUser.model.ts for registered details) and login then we should check whether `rohith@amazon.com` subscription auto debiting every month or not and allow `raj@amazon.com` to login accordingly,
               1. allowed login for active `rohith@amazon.com` subscription
               2. not allow login for in-active `rohith@amazon.com` subscription
         2. `rohith@amazon.com` as `corporate-admin` will invite(refer `CorporateUserInvite.model.ts`) a `ashutosh@amazon.com` as `corporate-recruiter` then we should deduct one recruiter count from `rohith@amazon.com` in `subscription` and `rohith@amazon.com` as `corporate-admin` will left with `0` which can't invite another recruiter till `March 31st 2026`
         3. `rohith@amazon.com` as `corporate-admin` will invite(refer `CorporateUserInvite.model.ts`) a `sarvesh@amazon.com` as `corporate-recruiter` then we will check `rohith@amazon.com` in `subscription` and `rohith@amazon.com` as `corporate-admin` was left with `0` which can't invite another recruiter till `March 31st 2026` and we throw the same error in the ui and `corporat-admin` may choose below two ways
            1. Add Recruiters
               1. Let's say on `Feb 1st, 2026` the `rohith@amazon.com` as `corporate-admin` given `3` recruiter count in add recruiters button input then calculate like below:
                  1. 3 recruiter × 2000rs(because quarterly) × 2(two months left) = 12000rs
                     1. so `12000rs` should be shown in the ui and `rohith@amazon.com` as `corporate-admin` will pay it and for this payment we may use (https://razorpay.com/docs/api/payments/subscriptions/#plans) subscription api or `razorpay order api`
                     2. now we need to update the subscription so that every three months it should debit with `2+3=5` recruiters amount for this `quarterly subscription` of `rohith@amazon.com` as `corporate-admin` like below:
                        1. Auto debit amount from April 1st 2026: 5 recruiter × 2000rs(because quarterly) × 3 = 30000rs
                        2. Auto debit amount from July 1st 2026: 5 recruiter × 2000rs(because quarterly) × 3 = 30000rs
                        .
                        . so..on
            2. Upgrade Plan
            3. Cancel Auto-Renew 
            4. Renew Plan

   2. Anually(12 months)

# Corporate Evaluator Subscription by `corporate-admin` Flow
We have `corporate-users` for a particular company in `worko` website
1. The `corporat-users` who have `corporat-admin` account we will show the `subscription` page in the `ui`
2. The `corporat-admin/recruiter` will send job application to an `evaluator` freely as of now on `prod worko website` and as of now only few active corporate users are present on prod




# Add Recruiter and Upgrade Plan flow
   1. Add Recruiter Flow
      Jan 1st 2026 to Jan 1st 2027:72k:- 
         12 month plan - 4 rec x 1500 x 12 = 72k
            after 3 months 4 are used
               he left with 9 months with 0 recruiters
                  2 rec × ₹1500 × 9 = 27k
      Jan 1st 2027 to Jan1st 2028: 6x12x1500=108000
      
   2. Upgrade Plan
      Jan 1st 2026 to March 31st 2026 bought 2 rec x 1500 x 3 = 9000
         on Feb 1st 2026 and selected 12 month with 6 rec x 1500 x 12 = 108000
            11 months remaining amount should pay: 108000 - (2 rec x 3000) = 102000
               update subscription that will ready to debit on march 31st 2026 with 9000 to jan 1st 2027 with 108000
      Jan 1st 2027: 6 x 1500 x 12 = 108000
