
# Guidance statuses:
1. PENDING 
2. REJECTED 
3. MENTOR_ASSIGNED
4. CANCELLED
5. PAYMENT_CONFIRMATION_PENDING
6. PAYMENT_CONFIRMATION_DONE
7. MEETING_CONFIRMED
8. MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE
9. MEETING_RESCHEDULE_REQUESTED_BY_MENTOR
10. MEETING_RESCHEDULE_CONFIRMED
11. PROJECT_COMPLETED

# Todo
1. status update order validations
2. email notifications

# Entire Guidance Feature Flow:
   ## Candidate dashboard
   1. Candidate will request for guidance for the first time with below input details:
      1. Guidance type 
      2. By When you need the Guidance
      3. Company Name 
      4. Job url
      5. Provide the detailed description of the required guidance
         1. After candidate successfully request guidance the guidance `status` will be `PENDING`(alias `In process` in ui) 
            1. Whenever guidance `status` is `PENDING` then no action buttons should shown under `Mentor details` and `Accept & pay` columns

   ## Admin dashboard
   1. Whenever guidance `status` is `PENDING`(alias `In process` in ui) then for `worko-admin` we should show 
   `Update status` under action column with below list:
      1. Schedule meeting:
         1. Whenever `worko-admin` selects Schedule meeting then a popup with below input details will be opened:
            1. Choose mentor:
               1. Enter the name of the `employee` in `worko website` by search by email
            2. Choose date & time
               1. Date
               2. Time
               3. Duration
            3. Payment amount(in INR):
               1. Let's say `worko-admin` submitted `5000rs` then 
                  1. `20%` is the `platform fee` 
                  ```ts
                  Math.round(scheduleData.paymentAmount * 0.2)
                  ```
                  2. remaining `80%` is the `Guidance fees`
                  ```ts
                  Math.round(scheduleData.paymentAmount * 0.8)
                  ```
            4. Link for payment
            5. Remarks -> optional
            6. Submit:
               1. When `Submit` button clicked:
                  1. The guidance `status` will change from `PENDING` to `MENTOR_ASSIGNED`(alias `Mentor assigned` in ui) and email will be send to `candidate`
      2. Reject:
         1. Whenever `worko-admin` selects `Reject` status then a `popup` will open and `admin` need to enter `rejection reason` and after submitting rejection reason the guidance request will update the guidance status from `PENDING` to `REJECTED`(alias `Rejected` in ui)
   
   ## Candidate dashboard
   1. Whenever guidance `status` is `MENTOR_ASSIGNED`(alias `Mentor assigned` in ui) then below button will be visible under `Mentor details` column:
      1. `See details` button:
         1. When `See details` button is clicked then a popup will be open with below details:
            1. Mentor name -> `employee name`
            2. Mentor details -> `employee's "about" description` and `linkedin` id from social profile
            3. Meeting time:
               1. Date
               2. Time
               3. Duration
            4. Charge -> full amount will show
            5. `Accept & pay` button:
               1. Whenever `Accept & pay` button is clicked then candidate will make payment by navigating to other tab and once the candidate comes to `worko candidate` dash immediately we need to show 
               `is payment done` popup with `Yes` or `No` button
                  1. If `Yes` button is clicked then: 
                     1. Update the guidance status from `MENTOR_ASSIGNED` to `PAYMENT_CONFIRMATION_PENDING`(alias `Payment confirmation pending`)
                  2. If `No` button is clicked then:
                     1. Don't update anything
            6. `Request cancel` button:
               1. Whenever the `Request cancel` button is clicked then a `popup` will open and `candidate` will submit the `reason for cancellation` and then update the guidance `status` from `MENTOR_ASSIGNED` to `CANCELLED` 
   
   ## Admin dashboard
   1. Whenever the `status` is `PAYMENT_CONFIRMATION_PENDING`(alias `Payment confirmation pending`) then for `worko-admin` we should show 
   `Update status` under action column with below list:
      1. Payment Confirmation Done:
         1. `UTR No` input
         2. `Submit` button:
            1. The guidance `status` will change from `PAYMENT_CONFIRMATION_PENDING` to `PAYMENT_CONFIRMATION_DONE`(alias with Title case)

   2. Whenever the `status` is `PAYMENT_CONFIRMATION_DONE` then `worko-admin` will provide meeting link and click `Meeting Confirm` button and then `status` will be updated from `PAYMENT_CONFIRMATION_DONE` to `MEETING_CONFIRMED`

   ## Candidate dashboard
   1. Whenever the `status` is `MEETING_CONFIRMED` then we will show `request reschedule` button in popup of `See details` button
      1. If `request reschedule` button is clicked:
         1. Re-requested date and time
         2. Reason for re-request(`Required`)
         3. `Submit` button:  
            1. After submission the `status` will be changed from `MEETING_CONFIRMED` to `MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE`(alias `Meeting reschedule requested`)

   ## Employee dashboard
   1. Whenever the `status` is `MEETING_CONFIRMED` then we will show `request reschedule` button in popup of `See details` button
      1. If `request reschedule` button is clicked:
         1. Re-requested date and time
         2. Reason for re-request(`Required`)
         3. `Submit` button:  
            1. After submission the `status` will be changed from `MEETING_CONFIRMED` to `MEETING_RESCHEDULE_REQUESTED_BY_MENTOR`(alias `Meeting reschedule requested`)

   ## Admin dashboard
   1. Whenever the `status` is `MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE` or `MEETING_RESCHEDULE_REQUESTED_BY_MENTOR` then `worko-admin` will submit the `Meeting Reschedule Confirmed` and the `status` will be update it to `MEETING_RESCHEDULE_CONFIRMED` 

   2. `worko-admin` will update the `status` to `PROJECT_COMPLETED`
