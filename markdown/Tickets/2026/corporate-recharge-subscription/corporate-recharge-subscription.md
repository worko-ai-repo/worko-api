
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

   `worko-admin` can update the plan amount
   when `worko-admin` add-recruiter then use `coupon` code and send for corporate
   don't block evaluator login, just give evaluator Read only access if `corporate-admin` sub expires

# Corporate Recruiter Subscription by `corporate-admin` Flow
We have `corporate-users`(Refer `CorporateUser.model.ts`) for a particular `company` in `worko` job platform website
1. The `corporat-users` who have `corporat-admin` account we will show the `subscription` page in the `ui`
2. The `corporat-admin` will invite `corporate-recruiters` freely as of now on `prod worko website` and as of now only few active corporate users are present on prod
3. for a `company` only one `corporate-admin` will present and this `corporate-admin` will be invited by `worko-admin`
4. Only `corporat-admin` can invite another `corporate-recruiter`, so we will give `1` free `corporate-recruiter` invite to the `corporate-admin`
5. Subsrciption Page for `corporate-admin`:
   1. Quarterly(3 months): for `quarterly` plan 2000rs/month
      1. `First time buying subscription`
         At very first time lets's say a `corporate-admin` will choose `Quarterly` plan, let's say with `2` recruiters count from `Jan 1st 2026 to March 31st 2026` i.e `2000/month x 2 rec x 3 months = 12000`, so `12000rs` will be shown to `corporate-admin` to pay and once he pay, every 3 months it should auto debit the amount from `corporate-admin` bank account(prefer credit cards and whatever ways we have, we should allow) from razorpay(
            refer `razorpayPayment.library.ts`(https://razorpay.com/docs/api/payments/subscriptions/#plans)
            ) like april 1st 2026 with 12000rs and next ..so on untill `corporate-admin` cancels the auto-debit
         1. send notify by razorpay
      2. Let's say this `corporate-admin` has `2` recruiters from `Jan 1st 2026 to March 31st 2026`
         1. `rohith@amazon.com` as `corporate-admin` will invite(refer `CorporateUserInvite.model.ts`) a `raj@amazon.com` as `corporate-recruiter` then we should deduct one recruiter count from `rohith@amazon.com` in `subscription` and `rohith@amazon.com` as `corporate-admin` will left with `1` which can able to invite another recruiter till `March 31st 2026`
            1. If this `raj@amazon.com` register(refer CorporateUser.model.ts for registered details) and login then we should check whether `rohith@amazon.com` subscription auto debiting every month or not and allow `raj@amazon.com` to login accordingly,
               1. allowed login for active `rohith@amazon.com` subscription
               2. not allow login for in-active `rohith@amazon.com` subscription -> email to corp-admin if its expired
         2. `rohith@amazon.com` as `corporate-admin` will invite(refer `CorporateUserInvite.model.ts`) a `ashutosh@amazon.com` as `corporate-recruiter` then we should deduct one recruiter count from `rohith@amazon.com` in `subscription` and `rohith@amazon.com` as `corporate-admin` will left with `0` which can't invite another recruiter till `March 31st 2026`
         3. `rohith@amazon.com` as `corporate-admin` will invite(refer `CorporateUserInvite.model.ts`) a `sarvesh@amazon.com` as `corporate-recruiter` then we will check `rohith@amazon.com` in `subscription` and `rohith@amazon.com` as `corporate-admin` was left with `0` which can't invite another recruiter till `March 31st 2026` and we throw the same error in the ui and `corporat-admin` may choose any one of below ways `Add Recruiters` or `Upgrade Plan` or `Cancel Auto-Renew`:-
            1. If `rohith@amazon.com` as `corporate-admin` chooses `Add Recruiters` button
               1. Let's say on `Feb 1st, 2026` the `rohith@amazon.com` as `corporate-admin` given `3` recruiter count in add recruiters button input then calculate like below:
                  1. 3 recruiter × 2000rs/month(because quarterly) × 2(two months left) = 12000rs
                     1. so `12000rs` should be shown in the ui and `rohith@amazon.com` as `corporate-admin` will pay it and for this payment we may use (https://razorpay.com/docs/api/payments/subscriptions/#plans) subscription api or `razorpay order api`
                     2. now we need to update the subscription so that every three months it should debit with `2+3=5` recruiters amount for this `quarterly subscription` of `rohith@amazon.com` as `corporate-admin` like below:
                        1. Auto debit amount from April 1st 2026: 5 recruiter × 2000rs/month(because quarterly) × 3 = 30000rs
                        2. Auto debit amount from July 1st 2026: 5 recruiter × 2000rs/month(because quarterly) × 3 = 30000rs
                        .
                        . so..on
            2. If `rohith@amazon.com` as `corporate-admin` chooses `Upgrade Plan`
               1. Let's say on `Feb 1st, 2026` the `rohith@amazon.com` as `corporate-admin` clicks upgrade to `Anually(12 months)` plan and for `12` month plan `1500rs/month`, so it should calculate like below:
                  1. we have two scenarios:-
                     1. Let's say `rohith@amazon.com` as `corporate-admin` chooses `12month plan` with 8 recruiters:-
                        1. 10 rec x 1500/month x 12 = 180000 -> annual amount for 10 recruiters
                        2. 2 rec x 1500/month x 3 = 9000 -> 3 months amount paid for 2 recruiters
                        3. 180000 - 9000 = 171000rs - should paid by `corporate-admin`
                        3. so we will update the subscription to deduct from `April 1st 2026` to `Jan 1st 2027`and every year it will deduct `10 rec x 12 x 1500/month`= 180000
                     2. Let's say `rohith@amazon.com` as `corporate-admin` chooses `12month plan` with 1 recruiter whereas `2` rec count was bought in `3` months plan:
                        1. we will show a warning message saying you are selecting less `recruiter` in this plan 
                           1. `Jan 1st 2026 to March 31st 2026` he bought 5 recs
                              1. now on `feb 1st 2026` he is trying `3` recs:
                                 1. 3 x 1500 x 12 = 54000
                                       54k -> 3 rec for 12 month need to pay
                                       22500 -> 3 month amount already paid for 5 rec
                                       2x3x1500=9k -> excess amount for 2 rec
                                       final price = 54k + 9k - 22.5k = 40500
                           2. 3 x 1500 x 12 = 54000

            3. If `rohith@amazon.com` as `corporate-admin` chooses `Renew Plan`
               1. Trigger: 15 days(every 7 days email) before expiry: like from `March 15th 2026 to March 31st 2026` or On expiry: March 31st 2026
               2. two recruiter count scenarios in this:
                  1. Let's say on March 27th 2026 the user selects `renew plan` i.e `12 month plan` with 8 recruiters
                     1. we should show below amount:
                        1. `8 rec x 1500rs/month x 12(months) = 144000rs
                           1. so `144000rs` auto debit every month like below:
                              1. April 1st 2027
                              2. April 1st 2028 ... so on
                     2. the old `3` month plan will be cancelled internally
                  2. Let's say on March 27th 2026 the user selects `renew plan` i.e `12 month plan` with 1 recruiters and give option to disable one recuiter to not login 
                     1. After removing `1` recruiter we should show below amount to pay:
                        1. `1 rec x 12 x 1500/month = 18000`
            4. If `rohith@amazon.com` as `corporate-admin` chooses `Cancel Auto-Renew` 
               1. then auto debit should off like from `april 1st 2026` the payment should be off
               2. all the `corporate-recruiters` who are being invited should be `turn off` on `april 1st 2026` if no active subscription is present with aligned recruiters count and when they `login/register` it should throw error by saying `inactive` subscription.(your acct has been deactivated for corp-rec)

   2. Anually(12 months)
      1. `First time buying subscription`
         At very first time lets's say a `corporate-admin` will choose `Anually` plan, let's say with `8` recruiters count from `Jan 1st 2026 to Jan 1st 2027` i.e `1500/month x 8 rec x 12 months = 144000`, so `144000rs` will be shown to `corporate-admin` to pay and once he pay, every 12 months it should auto debit the amount from `corporate-admin` bank account(all possible cards or payments allowed) from razorpay(
            refer `razorpayPayment.library.ts`(https://razorpay.com/docs/api/payments/subscriptions/#plans)
            ) like jan 1st 2027 with 144000rs and next ..so on untill `corporate-admin` cancels the auto-debit
      2. If all the `8` recs are used for invite then if `9`th invite tried by `corporate-admin` then below scenarios may happen
         1. If `rohith@amazon.com` as `corporate-admin` chooses `Add Recruiters` button
            1. Let's say on `Feb 1st, 2026` the `rohith@amazon.com` as `corporate-admin` given `3` recruiter count in add recruiters button input then calculate like below:
               1. 3 recruiter × 1500rs(because anually) × 11(eleven months left) = 49500rs
                  1. so `49500rs` should be shown in the ui and `rohith@amazon.com` as `corporate-admin` will pay it and for this payment we may use (https://razorpay.com/docs/api/payments/subscriptions/#plans) subscription api or `razorpay order api` need to think
                  2. now we need to update the subscription so that every 12 months it should debit with `8(previous)+3=11` recruiters amount for this `anual subscription` of `rohith@amazon.com` as `corporate-admin` like below:
                     1. Auto debit amount from April 1st 2026: 11 recruiter × 1500rs(because anual) × 12 = 198000rs
                     2. Auto debit amount from July 1st 2026: 11 recruiter × 1500rs(because anual) × 12 = 198000rs
                     .
                     . so..on
            2. If `rohith@amazon.com` as `corporate-admin` chooses `Cancel Auto-Renew` 
               1. then auto debit should off like from `jan 1st 2027` the payment should be off
               2. all the `corporate-recruiters` who are being invited should be `turn off` on `jan 1st 2027` if no active subscription is present with aligned recruiters count and when they `login/register` it should throw error by saying `inactive` subscription.

# Corporate Evaluator Subscription by `corporate-admin` Flow
We have `corporate-users` for a particular company in `worko` website
1. The `corporat-users` who have `corporat-admin` account we will show the `subscription` page in the `ui`
2. The `corporat-admin/recruiter` will send job application to an `evaluator` freely as of now on `prod worko website` and as of now only few active corporate users are present on prod
3. corporate-recruiter also can send job application to an evaluator
let's say we have `corporate-admin` at amazon company have active evaluator subscription and this `corporate-admin` have 2 recruiters under him
so these 2 corporat-recruiters at amazon company can only send job applications to the evaluator only when the `corporate-admin` have the active evaluator count subscriptions 
4. Only `corporat-admin/recruiter` can send job application to `evaluator`, so we will give `4` free `evaluator` sending to the `corporate-admin`
5. Subsrciption Page for `corporate-admin`:
   1. Quarterly(3 months): for `quarterly` plan 2000rs/quarter
      1. `First time buying subscription`
         At very first time lets's say a `corporate-admin` will choose `Quarterly` plan, let's say with `2` evaluators count from `Jan 1st 2026 to March 31st 2026` i.e `2000(Quarterly) x 2 evals = 4000`, so `4000rs` will be shown to `corporate-admin` to pay and once he pay, every 3 months it should auto debit the amount from `corporate-admin` bank account for this evaluator subscription(only credit cards are allowed) from razorpay(
            refer `razorpayPayment.library.ts`(https://razorpay.com/docs/api/payments/subscriptions/#plans)
            ) like april 1st 2026 with 4000rs and next ..so on untill `corporate-admin` cancels the auto-debit
       2. Let's say this `corporate-admin` has `2` evaluators from `Jan 1st 2026 to March 31st 2026`
         1. `rohith@amazon.com` as `corporate-admin` will send for evaluation(`RequestEvaluation.model.ts`) to `amul@amazon.com` as evaluator from job application(`UserJobApplication.model.ts`) listing page and then we should deduct one evaluator count from `rohith@amazon.com` in `evaluator subscription` and `rohith@amazon.com` as `corporate-admin` will left with `1` which `corporate-admin` and his corporate-recruiters can able to send for evaluation till `March 31st 2026`
            1. If this `amul@amazon.com` register(refer EvaluatorDetail.model.ts for registered details) and login then we should check whether `rohith@amazon.com` subscription auto debiting every month or not and allow `amul@amazon.com` to login accordingly,
               1. allowed login for active `rohith@amazon.com` subscription
               2. not allow login for in-active `rohith@amazon.com` subscription
         2. `raj@amazon.com` as `corporate-recruiter` will send for evaluation(refer `RequestEvaluation.model.ts`) then we should deduct one evaluator count from `rohith@amazon.com` in `subscription` and `rohith@amazon.com` as `corporate-admin` will left with `0` which can't send for evaluation till `March 31st 2026`
         3. `rohith@amazon.com` as `corporate-admin` or `raj@amazon.com` as `corporate-recruiter` send for evaluation then we will check `rohith@amazon.com` in `subscription` and `rohith@amazon.com` as `corporate-admin` was left with `0` which can't send for evaluation till `March 31st 2026` and we throw the same error in the ui and `corporat-admin` may choose any one of below ways `Add Evaluators` or `Upgrade Plan` or `Cancel Auto-Renew`:-
            1. If `rohith@amazon.com` as `corporate-admin` chooses `Add Evaluators` button
               1. Let's say on `Feb 1st, 2026` the `rohith@amazon.com` as `corporate-admin` given `3` evaluator count in add evaluators button input then calculate like below:
                  1. 3 evaluator × 666.6/month(because quarterly) × 2(two months left) = 4000rs
                     1. so `4000rs` should be shown in the ui and `rohith@amazon.com` as `corporate-admin` will pay it and for this payment we may use (https://razorpay.com/docs/api/payments/subscriptions/#plans) subscription api or `razorpay order api`
                     2. now we need to update the evaluator subscription so that every three months it should debit with `2+3=5` evaluators amount for this `quarterly subscription` of `rohith@amazon.com` as `corporate-admin` like below:
                        1. Auto debit amount from April 1st 2026: 5 evaluator × 2000rs/3months = 10k
                        2. Auto debit amount from July 1st 2026: 5 evaluator × 2000rs/3months = 10k
                        .
                        . so..on
            2. If `rohith@amazon.com` as `corporate-admin` chooses `Upgrade Plan`
               1. Let's say on `Feb 1st, 2026` the `rohith@amazon.com` as `corporate-admin` clicks upgrade to `Anually(12 months)` plan and for `12` month plan `500rs/evaluator`, so it should calculate like below:
                  1. we have two scenarios:-
                     1. Let's say `rohith@amazon.com` as `corporate-admin` chooses `12month plan` with 8 evaluators:-
                        1. 8 evals x 500 x 12 = 48k -> `12` month plan with `8` evals 
                           1. i.e 48k - (2 remaining months x 2 evaluators × 500/month) = 46000
                        2. so we will update the subscription to deduct from `April 1st 2026` to `Jan 1st 2027`and every year it will deduct `48k`
                     2. Let's say `rohith@amazon.com` as `corporate-admin` chooses `12month plan` with 1 evaluator whereas `2` evals count was bought in `3` months plan:
                        1. we will show a warning message saying you are selecting less `evaluator` in this plan 
                        and give option to disable one evaluator to not login 
            3. If `rohith@amazon.com` as `corporate-admin` chooses `Renew Plan`
               1. Trigger: 7 days before expiry: like from `March 25th 2026 to March 31st 2026` or On expiry: March 31st 2026
               2. two evaluator count scenarios in this:
                  1. Let's say on March 27th 2026 the user selects `renew plan` i.e `12 month plan` with 8 evaluators
                     1. we should show below amount:
                        1. `8 eval x 500rs/month x 12(months) = 48000
                           1. so `48000rs` auto debit every month like below:
                              1. April 1st 2027
                              2. April 1st 2028 ... so on
                     2. the old `3` month plan will be cancelled internally
                  2. Let's say on March 27th 2026 the user selects `renew plan` i.e `12 month plan` with 1 evaluator and give option to disable one evaluator to not login 
                     1. After removing `1` evaluator we should show below amount to pay:
                        1. `1 evaluator x 12 x 500/month = 6000`
            4. If `rohith@amazon.com` as `corporate-admin` chooses `Cancel Auto-Renew` 
               1. then auto debit should off like from `april 1st 2026` the payment should be off
               2. all the `evaluators logins` who are being invited should be `turn off` on `april 1st 2026` if no active subscription is present with aligned evaluatos subscription count and when evaluator `login/register` it should throw error by saying `inactive` subscription.

   2. Anually(12 months) -> 6000rs/annum
      1. `First time buying subscription`
         At very first time lets's say a `corporate-admin` will choose `Anually` plan, let's say with `8` evaluators count from `Jan 1st 2026 to Jan 1st 2027` i.e `500/month x 8 eval x 12 months = 48k`, so `48k` will be shown to `corporate-admin` to pay and once he pay, every 12 months it should auto debit the amount from `corporate-admin` bank account(only credit cards are allowed) from razorpay(
            refer `razorpayPayment.library.ts`(https://razorpay.com/docs/api/payments/subscriptions/#plans)
            ) like jan 1st 2027 with 48k and next ..so on untill `corporate-admin` cancels the auto-debit
      2 If all the `8` evals are used for send for evaluations then if `9`th invite tried by `corporate-admin/recruiter` then below scenarios may happen
         1. If `rohith@amazon.com` as `corporate-admin` chooses `Add Evaluators` button
            1. Let's say on `Feb 1st, 2026` the `rohith@amazon.com` as `corporate-admin` given `3` evaluator count in add evaluators button input then calculate like below:
               1. 3 evaluators × 500rs(because anually) × 11(eleven months left) = 16500
                  1. so `16500` should be shown in the ui and `rohith@amazon.com` as `corporate-admin` will pay it and for this payment we may use (https://razorpay.com/docs/api/payments/subscriptions/#plans) subscription api or `razorpay order api` need to think
                  2. now we need to update the subscription so that every 12 months it should debit with `8(previous)+3=11` evluators amount for this `anual subscription` of `rohith@amazon.com` as `corporate-admin` like below:
                     1. Auto debit amount from April 1st 2026: 11 evaluator × 500rs(because anual) × 12
                     2. Auto debit amount from July 1st 2026: 11 evaluator × 500rs(because anual) × 12
                     .
                     . so..on
            2. If `rohith@amazon.com` as `corporate-admin` chooses `Cancel Auto-Renew` 
               1. then auto debit should off like from `jan 1st 2027` the payment should be off
               2. all the `evlautors` who are being loggedin should be `turn off` on `jan 1st 2027` if no active subscription is present with aligned evaluators count and when they `login/register` it should throw error by saying `inactive` subscription.

