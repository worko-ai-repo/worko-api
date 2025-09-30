
1. Create guidance request
   [POST] `https://api.dev.worko.work/user/guidance-request`
   ```json
   // Request body
   {
      "guidanceRequestType": "MOCK_INTERVIEW_PREPARATION",
      "guidanceRequestDeadline": "2025-08-30T00:00:00.000Z",
      "companyName": "Nellsys",
      "jobUrl": "https://dev-ui.worko.work/jobs/ASTROTALK/01K33GGM46JG0GEY1PPGVFV57F",
      "guidanceRequestDescription": "I want interview preparation"
   }
   ```
   ```json
   // Response
   {
      "guidanceRequestType": "MOCK_INTERVIEW_PREPARATION",
      "guidanceRequestDeadline": "2025-08-30T00:00:00.000Z",
      "companyName": "NELLSYS",
      "jobUrl": "https://dev-ui.worko.work/jobs/ASTROTALK/01K33GGM46JG0GEY1PPGVFV57F",
      "guidanceRequestDescription": "I want interview preparation",
      "id": "01K3QFTBJARDW1YKT2K2NN91YN",
      "PK": "USR#EML#divy.raushan26@gmail.com",
      "SK": "GUIDANCE#RQST#ID#01K3QFTBJARDW1YKT2K2NN91YN",
      "GSI1PK": "GUIDANCE#RQST#",
      "GSI1SK": "ID#01K3QFTBJARDW1YKT2K2NN91YN",
      "createdByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
      "status": "PENDING",
      "statusTracker": [
         {
               "newStatus": "PENDING",
               "actionDate": "2025-08-28T04:43:46.637+00:00",
               "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
               "actionByUserType": "CAND"
         }
      ],
      "createdAt": 1756356226638,
      "updatedAt": 1756356226638
   }
   ```

2. Get guidance requests by candidate email
   [GET] `https://api.dev.worko.work/user/guidance-request?email=divy.raushan26@gmail.com&actionByUserType=CAND`
   ```json
   // Response body
   {
      "data": [
         {
               "jobUrl": "https://dev-ui.worko.work/jobs/ASTROTALK/01K33GGM46JG0GEY1PPGVFV57F",
               "guidanceRequestDeadline": "2025-08-30T00:00:00.000Z",
               "companyName": "NELLSYS",
               "status": "MENTOR_ASSIGNED",
               "createdAt": "2025-08-28T04:43:46.638Z",
               "guidanceRequestDescription": "I want interview preparation",
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
                  }
               ],
               "GSI1PK": "GUIDANCE#RQST#",
               "createdByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
               "updatedAt": "2025-08-28T05:04:10.174Z",
               "SK": "GUIDANCE#RQST#ID#01K3QFTBJARDW1YKT2K2NN91YN",
               "guidanceRequestType": "MOCK_INTERVIEW_PREPARATION",
               "id": "01K3QFTBJARDW1YKT2K2NN91YN",
               "PK": "USR#EML#divy.raushan26@gmail.com",
               "mentorAssignedRemarks": "string",
               "mentorDetails": {
                  "name": "rohith appala emp",
                  "userId": "8103fd8a-10b1-701c-7675-d5f8e748cb3d",
                  "userEmail": "rohithappala777+employee33@gmail.com"
               },
               "updatedByUserId": "REDACTED",
               "scheduleMeetingDetails": {
                  "date": "2025-09-11T09:02:14.763Z",
                  "duration": "2 hrs 30 mins",
                  "time": "7:00 pm"
               },
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
               "GSI1SK": "ID#01K3QFTBJARDW1YKT2K2NN91YN"
         }
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

3. Get social profile links of mentor
   [GET] `https://api.dev.worko.work/user/rohithappala777+candidate3@gmail.com/socialprofile`
   ```json
   [
      {
         "PK": "USR#EML#rohithappala777+candidate3@gmail.com",
         "createdAt": "2025-08-22T12:57:25.238Z",
         "github": [
               "https://github.com/"
         ],
         "linkedin": [
               "https://www.linkedin.com/"
         ],
         "otherSocialPlatForms": {
               "codeChef": [
                  "https://www.codechef.com/login"
               ],
               "gitlab": [
                  "https://gitlab.com/accounts/login/"
               ],
               "hackerRank": [
                  "https://www.hackerrank.com/auth/login/decisions"
               ],
               "leetCode": [
                  "https://leetcode.com/accounts/login/"
               ]
         },
         "twitter": [
               "https://x.com/"
         ],
         "updatedAt": "2025-08-22T13:47:06.006Z",
         "SK": "SOCIAL#"
      }
   ]
   ```

4. Get mentor about details
   [GET] `https://api.dev.worko.work/user/rohithappala777+candidate3@gmail.com/details`
   ```json
   [
      {
         // ...
         "about": " knowledge of HTML, CSS, JavaScript, and the stack's core technologies. This provides a strong foundation for more advanced skills and roles. Let's see below: Web Development Basics: Knowledge of HTML, CSS, and JavaScript.",
         // ...
      }
   ]
   ```

5. Cancel request 
   [PATCH] `https://api.dev.worko.work/user/guidance-request/:id/CANDIDATE_ACTION`
   ```json
   // Request body
   {
      "newStatus": "CANCELLED",
      "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
      "actionByUserType": "CAND",
      "cancelReason": "I thought this guidance is free."
   }
   ```
   ```json
   {
      "jobUrl": "https://dev-ui.worko.work/jobs/GROWW/01K2MEJ4SA30X30RK3EYZGXR92",
      "guidanceRequestDeadline": "2025-08-31T00:00:00.000Z",
      "companyName": "WORKO",
      "status": "CANCELLED",
      "createdAt": "2025-08-28T08:30:20.123Z",
      "guidanceRequestDescription": "help me with assignments",
      "mentorAssignedRemarks": "string",
      "statusTracker": [
         {
               "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
               "newStatus": "PENDING",
               "actionDate": "2025-08-28T08:30:20.123+00:00",
               "actionByUserType": "CAND"
         },
         {
               "actionByUserId": "REDACTED",
               "newStatus": "MENTOR_ASSIGNED",
               "oldStatus": "PENDING",
               "actionDate": "2025-08-28T08:31:05.986+00:00",
               "actionByUserType": "ADMIN"
         },
         {
               "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
               "newStatus": "CANCELLED",
               "oldStatus": "MENTOR_ASSIGNED",
               "actionDate": "2025-08-28T08:32:54.468+00:00",
               "actionByUserType": "CAND"
         }
      ],
      "GSI1SK": "ID#01K3QWS6ETASN74H3PBQ26QWCB",
      "mentorDetails": {
         "name": "rohith appala emp",
         "userId": "8103fd8a-10b1-701c-7675-d5f8e748cb3d",
         "userEmail": "rohithappala777+employee33@gmail.com"
      },
      "GSI1PK": "GUIDANCE#RQST#",
      "createdByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
      "updatedByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
      "scheduleMeetingDetails": {
         "date": "2025-09-11T09:02:14.763Z",
         "duration": "2 hrs 30 mins",
         "time": "7:00 pm"
      },
      "updatedAt": "2025-08-28T08:32:54.483Z",
      "SK": "GUIDANCE#RQST#ID#01K3QWS6ETASN74H3PBQ26QWCB",
      "cancelledByDetails": {
         "reason": "I thought this guidance is free.",
         "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
         "actionByUserType": "CAND",
         "actionDate": "2025-08-28T08:32:54.468+00:00"
      },
      "guidanceRequestType": "HELP_WITH_ASSIGNMENT",
      "PK": "USR#EML#divy.raushan26@gmail.com",
      "id": "01K3QWS6ETASN74H3PBQ26QWCB",
      "paymentRequestDetails": {
         "totalAmount": 5000,
         "guidanceFee": 4000,
         "linkForPayment": "string",
         "actionByUserId": "REDACTED",
         "actionByUserType": "ADMIN",
         "currency": "INR",
         "platformFee": 1000,
         "actionDate": "2025-08-28T08:31:05.986+00:00"
      }
   }
   ```

6. Payment done by candidate
   [PATCH] `https://api.dev.worko.work/user/guidance-request/:id/CANDIDATE_ACTION`
   ```json
   // Request body
   {
      "newStatus": "PAYMENT_CONFIRMATION_PENDING",
      "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
      "actionByUserType": "CAND"
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
      "status": "PAYMENT_CONFIRMATION_PENDING",
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
         }
      ],
      "GSI1SK": "ID#01K3QFTBJARDW1YKT2K2NN91YN",
      "mentorDetails": {
         "name": "rohith appala emp",
         "userId": "8103fd8a-10b1-701c-7675-d5f8e748cb3d",
         "userEmail": "rohithappala777+employee33@gmail.com"
      },
      "GSI1PK": "GUIDANCE#RQST#",
      "createdByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
      "updatedByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
      "scheduleMeetingDetails": {
         "date": "2025-09-11T09:02:14.763Z",
         "duration": "2 hrs 30 mins",
         "time": "7:00 pm"
      },
      "updatedAt": "2025-08-28T07:55:45.474Z",
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
      }
   }
   ```
   
7. Candidate re-schedule meeting request
   [PATCH] `https://api.dev.worko.work/user/guidance-request/:id/CANDIDATE_ACTION`
   ```json
   // Request body
   {
      "newStatus": "MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE",
      "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
      "actionByUserType": "CAND",
      "reScheduleRequestDate": "2025-09-27T09:02:14.763+00:00",
      "reScheduleRequestTime": "10:00 am"
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
      "status": "MEETING_RESCHEDULE_REQUESTED_BY_CANDIDATE",
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
      "updatedByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
      "scheduleMeetingDetails": {
         "date": "2025-09-11T09:02:14.763Z",
         "duration": "2 hrs 30 mins",
         "meetingLink": "https://google.com",
         "time": "7:00 pm"
      },
      "updatedAt": "2025-08-28T08:08:43.476Z",
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
         }
      ]
   }
   ```