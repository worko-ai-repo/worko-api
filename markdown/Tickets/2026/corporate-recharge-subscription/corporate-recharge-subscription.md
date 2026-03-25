
```sh
# Corporate admin: rohith.appala+byjus@worko.ai
https://dev.worko.work/v1/corporate/recruiterRecharge
```

# Requirement Notes Shared by Raj
1. corp-admin will come and select how many recruiter member is required and for how many months and we will add credit card auto deduct will happen every 3/6/12 months as per selection, whenever corp invites anyone deduction will happen and we will show how many invites left
2. every 3/6/12 months deduction will happen automatically and if not then we will not let corp-recruiter do anything
3. if corp-admin wants to add more then we will give option to him and that will get append to existing so when
4. if we will give option to invite more then how the cycle will run
5. will we give option to re-fund
6. if corp bought 5 invites and he already has 5 invited he can remove one and add other as well
7. 2 recruiter free for every corporate-admin users including himself later in future if corp has taken ats then we will give 2 recruiter free if corp has only taken job board then nothing free





# Corporate Recruiter Subscription by `corporate-admin` Requirement Flow
We have `corporate-users` for a particular company in `worko` website
1. The `corporat-users` who have `corporat-admin` account we will show the `subscription` page in the `ui`
2. The `corporat-users` will invite `corporate-recruiters` freely as of now on `prod worko website` and as of now only few active corporate users are present on prod
3. Now we want to build a subscription page for `corporate-admin` which will contain `Recruiter Recharge`
   1. under this `Recruiter Recharge` we have below
      1. Number of Recruiters
      2. Select Duration: `3 Months` or `6 Months` or `12 Months`
      3. Total Amount
   2. let's say i have selected `2` in `Number of Recruiters` and Select Duration: `3 Months` then the Total Amount is `9000` like for `1` recruiter it will be `1500rs/month` 
4. We have wallet card withe below:
   1. Total purchased -> amount spent in lifetime
   2. Pending -> available remaining recruiters count can be used
   3. Used -> recruiters count used already
   4. Total spent -> like count of pending+used recruiters
5. Recruiter Credit transaction history
   1. when corporate-admin paid for `2 recruiters` for `3 months` plan then it will added in the list
   2. when corporate-admin paid for `2 recruiters` for `6 months` plan then it will added in the list


# Corporate Evaluator Subscription by `corporate-admin`, `corporate-recruiter` Requirement Flow
@todo: discuss about `corporate-recruiter` also can send job application to an evaluator
We have `corporate-users` for a particular company in `worko` website
1. The `corporat-users` who have `corporat-admin` account we will show the `subscription` page in the `ui`
2. The `corporat-admin/recruiter` will send job application to an `evaluator` freely as of now on `prod worko website` and as of now only few active corporate users are present on prod
3. Now we want to build a subscription page for `corporate-admin/recruiter` which will contain `Subscription Recharge`
   1. under this `Evaluator Recharge` we have below
      1. Number of Recruiters
      2. Select Duration: `3 Months` or `6 Months` or `12 Months`
      3. Total Amount
   2. let's say i have selected `2` in `Number of Recruiters` and Select Duration: `3 Months` then the Total Amount is `600` like for `1` recruiter it will be `100rs/month` 
4. We have wallet card withe below:
   1. Total purchased -> amount spent in lifetime
   2. Pending -> available remaining evaluator count can be used
   3. Used -> evaluator count used already
   4. Total spent -> like count of pending+used evaluator
5. Evaluator Credit transaction history
   1. when corporate-admin paid for `2 evaluator` for `3 months` plan then it will added in the list
   2. when corporate-admin paid for `2 evaluator` for `6 months` plan then it will added in the list
