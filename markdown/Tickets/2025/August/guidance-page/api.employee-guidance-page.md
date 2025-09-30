

1. List all guidance by descending order
   [GET] `https://api.dev.worko.work/user/guidance-request?mentorId=31237dea-9041-701d-84fb-253bc2dc9f80&actionByUserType=EMP`
   ```json
   // Response body
   {
      "data": [
         // Same structure as admin guidance list
      ],
      "pagination": {
         "count": 1,
         "pageSize": 25,
         "sortOrder": "descending",
         "timesQueried": 1,
         "queriedCount": 0
      }
   }
   ```

2. Employee(mentor) re-schedule meeting
   [PATCH] `https://api.dev.worko.work/user/guidance-request/:id/MENTOR_ACTION`
   ```json
   // Request body
   {
      "newStatus": "MEETING_RESCHEDULE_REQUESTED_BY_MENTOR",
      "actionByUserId": "8103fd8a-10b1-701c-7675-d5f8e748cb3d",
      "actionByUserType": "EMP",
      "reScheduleRequestDate": "2025-09-25T09:02:14.763+00:00",
      "reScheduleRequestTime": "9:00 am"
   }
   ```
   ```json
   // Response body
   {
      "jobUrl": "https://dev-ui.worko.work/jobs/ASTROTALK/01K33GGM46JG0GEY1PPGVFV57F",
      "guidanceRequestDeadline": "2025-08-30T00:00:00.000Z",
      "paymentConfirmationPendingDetails": {
         "actionByUserType": "CAND",
         "actionDate": "2025-08-28T07:55:45.391+00:00",
         "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38"
      },
      "companyName": "NELLSYS",
      "status": "MEETING_RESCHEDULE_REQUESTED_BY_MENTOR",
      "createdAt": "2025-08-28T04:43:46.638Z",
      "guidanceRequestDescription": "I want interview preparation",
      "mentorAssignedRemarks": "string",
      "statusTracker": [
         {
               "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
               "newStatus": "PENDING",
               "actionDate": "2025-08-28T04:43:46.637+00:00",
               "actionByUserType": "CAND"
         },
         {
               "actionByUserId": "REDACTED",
               "newStatus": "MENTOR_ASSIGNED",
               "oldStatus": "PENDING",
               "actionDate": "2025-08-28T05:04:10.098+00:00",
               "actionByUserType": "ADMIN"
         },
         {
               "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
               "newStatus": "PAYMENT_CONFIRMATION_PENDING",
               "oldStatus": "MENTOR_ASSIGNED",
               "actionDate": "2025-08-28T07:55:45.391+00:00",
               "actionByUserType": "CAND"
         },
         {
               "actionByUserId": "REDACTED",
               "newStatus": "PAYMENT_CONFIRMATION_DONE",
               "oldStatus": "PAYMENT_CONFIRMATION_PENDING",
               "actionDate": "2025-08-28T08:00:44.706+00:00",
               "actionByUserType": "ADMIN"
         },
         {
               "actionByUserId": "REDACTED",
               "newStatus": "MEETING_CONFIRMED",
               "oldStatus": "PAYMENT_CONFIRMATION_DONE",
               "actionDate": "2025-08-28T08:02:56.030+00:00",
               "actionByUserType": "ADMIN"
         },
         {
               "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
               "newStatus": "MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE",
               "oldStatus": "MEETING_CONFIRMED",
               "actionDate": "2025-08-28T08:08:43.464+00:00",
               "actionByUserType": "CAND"
         },
         {
               "actionByUserId": "8103fd8a-10b1-701c-7675-d5f8e748cb3d",
               "newStatus": "MEETING_RESCHEDULE_REQUESTED_BY_MENTOR",
               "oldStatus": "MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE",
               "actionDate": "2025-08-28T08:12:41.214+00:00",
               "actionByUserType": "EMP"
         }
      ],
      "GSI1SK": "ID#01K3QFTBJARDW1YKT2K2NN91YN",
      "mentorDetails": {
         "name": "rohith appala emp",
         "userId": "8103fd8a-10b1-701c-7675-d5f8e748cb3d",
         "userEmail": "rohithappala777+employee33@gmail.com"
      },
      "paymentConfirmationDoneDetails": {
         "actionByUserId": "REDACTED",
         "actionByUserType": "ADMIN",
         "actionDate": "2025-08-28T08:00:44.706+00:00",
         "uniqueTransactionReference": "N123456712323456"
      },
      "GSI1PK": "GUIDANCE#RQST#",
      "createdByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
      "updatedByUserId": "8103fd8a-10b1-701c-7675-d5f8e748cb3d",
      "scheduleMeetingDetails": {
         "date": "2025-09-11T09:02:14.763Z",
         "duration": "2 hrs 30 mins",
         "meetingLink": "https://google.com",
         "time": "7:00 pm"
      },
      "updatedAt": "2025-08-28T08:12:41.217Z",
      "SK": "GUIDANCE#RQST#ID#01K3QFTBJARDW1YKT2K2NN91YN",
      "guidanceRequestType": "MOCK_INTERVIEW_PREPARATION",
      "PK": "USR#EML#divy.raushan26@gmail.com",
      "id": "01K3QFTBJARDW1YKT2K2NN91YN",
      "paymentRequestDetails": {
         "totalAmount": 5000,
         "guidanceFee": 4000,
         "linkForPayment": "string",
         "actionByUserId": "REDACTED",
         "actionByUserType": "ADMIN",
         "currency": "INR",
         "platformFee": 1000,
         "actionDate": "2025-08-28T05:04:10.098+00:00"
      },
      "rescheduleMeetingDetails": [
         {
               "date": "2025-09-27T09:02:14.763Z",
               "time": "10:00 am",
               "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
               "actionByUserType": "CAND",
               "actionDate": "2025-08-28T08:08:43.464+00:00"
         },
         {
               "date": "2025-09-25T09:02:14.763Z",
               "time": "9:00 am",
               "actionByUserId": "8103fd8a-10b1-701c-7675-d5f8e748cb3d",
               "actionByUserType": "EMP",
               "actionDate": "2025-08-28T08:12:41.214+00:00"
         }
      ]
   }
   ```