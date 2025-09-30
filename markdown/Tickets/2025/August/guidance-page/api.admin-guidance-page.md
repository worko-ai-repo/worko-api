
1. List all guidance by descending order
   [GET] `https://api.dev.worko.work/user/guidance-request?actionByUserType=ADMIN`
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

2. Search mentor(`employee email`) by email
   [GET] `https://api.dev.worko.work/admin/user/?userType=EMP&pageSize=25&searchText=rohithappala777+employee33@gmail.com`
   ```json
   // Response
   {
      "data": [
         {
            "GSI1PK": "USR#",
            "GSI1SK": "ID#8103fd8a-10b1-701c-7675-d5f8e748cb3d",
            "GSI2PK": "USR#",
            "GSI2SK": "2025-08-28T04:52:18.142Z",
            "PK": "USR#EML#rohithappala777+employee33@gmail.com",
            "YOE": 0,
            "about": "Im a backend web developer with nodejs, express skills",
            "acceptedTermsAndConditions": true,
            "companyName": "NELLSYS",
            "companySK": "01JWAQF1G96E0SE9XHXSFGHNWW",
            "country": "IND",
            "createdAt": "2025-08-28T04:52:18.142Z",
            "email": "rohithappala777+employee33@gmail.com",
            "emailList": {
               "primary": "rohithappala777+employee33@gmail.com"
            },
            "expiryDate": "2025-09-27T04:52:18.186Z",
            "id": "8103fd8a-10b1-701c-7675-d5f8e748cb3d",
            "isEmailVerified": true,
            "isNumberVerified": false,
            "isSubscribed": true,
            "isWhatsappNotificationEnabled": true,
            "lastAccessedDash": "EMP",
            "location": "Hyderabad",
            "name": "rohith appala emp",
            "number": "+919666308100",
            "referralCount": 1,
            "updatedAt": "2025-08-28T04:54:27.439Z",
            "userId": "8103fd8a-10b1-701c-7675-d5f8e748cb3d",
            "userType": ["EMP"],
            "SK": "ID#8103fd8a-10b1-701c-7675-d5f8e748cb3d",
            "cvAwsS3SignedUrl": null,
            "profileImageAwsS3SignedUrl": null
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

3. Schedule meeting or mentor assigned status
   [PATCH] `https://api.dev.worko.work/user/guidance-request/01K3QFTBJARDW1YKT2K2NN91YN/WORKO_ADMIN_ACTION`
   ```json
   // Request body
   {
      "newStatus": "MENTOR_ASSIGNED",
      "mentorDetails": {
         "userId": "8103fd8a-10b1-701c-7675-d5f8e748cb3d", // `id` attribute of employee
         "userEmail": "rohithappala777+employee33@gmail.com",
         "name":"rohith appala emp"
      },
      "scheduleMeetingDetails": {
         "date": "2025-09-11T09:02:14.763+00:00",
         "time": "7:00 pm",
         "duration": "2 hrs 30 mins"
      }, 
      "mentorAssignedRemarks": "string", // optional
      "currency": "INR",
      "totalAmount": 5000,
      "linkForPayment": "string",
      "actionByUserId": "REDACTED",
      "actionByUserType": "ADMIN"
   }
   ```
   ```json
   // Response body
   {
      "jobUrl": "https://dev-ui.worko.work/jobs/ASTROTALK/01K33GGM46JG0GEY1PPGVFV57F",
      "guidanceRequestDeadline": "2025-08-30T00:00:00.000Z",
      "companyName": "NELLSYS",
      "status": "MENTOR_ASSIGNED",
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
      "updatedByUserId": "REDACTED",
      "scheduleMeetingDetails": {
         "date": "2025-09-11T09:02:14.763Z",
         "duration": "2 hrs 30 mins",
         "time": "7:00 pm"
      },
      "updatedAt": "2025-08-28T05:04:10.174Z",
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

4. Reject the guidance request
   [PATCH] `https://api.dev.worko.work/user/guidance-request/:id/WORKO_ADMIN_ACTION`
   ```json
   // Request body
   {
      "newStatus": "REJECTED",
      "actionByUserId": "REDACTED",
      "actionByUserType": "ADMIN",
      "rejectionReason": "You are not eligible for guidance.",
   }
   ```
   ```json
   // Response body
   {
      "jobUrl": "https://dev-ui.worko.work/jobs/GROWW/01K2MJGE92VCAT2YN7MJABHGR9",
      "guidanceRequestDeadline": "2025-08-31T00:00:00.000Z",
      "companyName": "WORKO",
      "status": "REJECTED",
      "createdAt": "2025-08-28T08:22:27.067Z",
      "guidanceRequestDescription": "resume guide",
      "statusTracker": [
         {
               "actionByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
               "newStatus": "PENDING",
               "actionDate": "2025-08-28T08:22:27.066+00:00",
               "actionByUserType": "CAND"
         },
         {
               "actionByUserId": "REDACTED",
               "newStatus": "REJECTED",
               "oldStatus": "PENDING",
               "actionDate": "2025-08-28T08:27:07.213+00:00",
               "actionByUserType": "ADMIN"
         }
      ],
      "GSI1SK": "ID#01K3QWARFRXPV3Y6FBB2G0JFTQ",
      "GSI1PK": "GUIDANCE#RQST#",
      "createdByUserId": "e1134dca-6071-70ff-2941-54fcce656f38",
      "updatedByUserId": "REDACTED",
      "updatedAt": "2025-08-28T08:27:07.216Z",
      "SK": "GUIDANCE#RQST#ID#01K3QWARFRXPV3Y6FBB2G0JFTQ",
      "guidanceRequestType": "RESUME_REVIEW",
      "rejectedByDetails": {
         "reason": "You are not eligible for guidance.",
         "actionByUserId": "REDACTED",
         "actionByUserType": "ADMIN",
         "actionDate": "2025-08-28T08:27:07.213+00:00"
      },
      "PK": "USR#EML#divy.raushan26@gmail.com",
      "id": "01K3QWARFRXPV3Y6FBB2G0JFTQ"
   }
   ```

5. Payment confirmation done
   [PATCH] `https://api.dev.worko.work/user/guidance-request/:id/WORKO_ADMIN_ACTION`
   ```json
   {
      "newStatus": "PAYMENT_CONFIRMATION_DONE",
      "actionByUserId": "REDACTED",
      "actionByUserType": "ADMIN",
      "uniqueTransactionReference": "N1234567***23456",
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
      "status": "PAYMENT_CONFIRMATION_DONE",
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
      "updatedByUserId": "REDACTED",
      "scheduleMeetingDetails": {
         "date": "2025-09-11T09:02:14.763Z",
         "duration": "2 hrs 30 mins",
         "time": "7:00 pm"
      },
      "updatedAt": "2025-08-28T08:00:44.728Z",
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

6. Meeting submission link
   [PATCH] `https://api.dev.worko.work/user/guidance-request/:id/WORKO_ADMIN_ACTION`
   ```json
   // Request body
   {
      "newStatus": "MEETING_CONFIRMED",
      "actionByUserId": "REDACTED",
      "actionByUserType": "ADMIN",
      "meetingLink": "https://google.com"
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
      "status": "MEETING_CONFIRMED",
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
      "updatedByUserId": "REDACTED",
      "scheduleMeetingDetails": {
         "date": "2025-09-11T09:02:14.763Z",
         "duration": "2 hrs 30 mins",
         "meetingLink": "https://google.com",
         "time": "7:00 pm"
      },
      "updatedAt": "2025-08-28T08:02:56.042Z",
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

7. Confirm rescheduled meeting
   [PATCH] `https://api.dev.worko.work/user/guidance-request/:id/WORKO_ADMIN_ACTION`
   ```json
   // Request body
   {
      "newStatus": "MEETING_RESCHEDULE_CONFIRMED",
      "actionByUserId": "REDACTED",
      "actionByUserType": "ADMIN",
      "scheduleMeetingDetails": {
         "date": "2025-09-27T09:02:14.763+00:00",
         "time": "9:30 am",
         "duration": "2 hrs 30 mins"
      }, 
      "meetingLink": "https://microsoft.com"
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
      "status": "MEETING_RESCHEDULE_CONFIRMED",
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
         },
         {
               "actionByUserId": "REDACTED",
               "newStatus": "MEETING_RESCHEDULE_CONFIRMED",
               "oldStatus": "MEETING_RESCHEDULE_REQUESTED_BY_MENTOR",
               "actionDate": "2025-08-28T08:23:19.022+00:00",
               "actionByUserType": "ADMIN"
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
      "updatedByUserId": "REDACTED",
      "scheduleMeetingDetails": {
         "date": "2025-09-27T09:02:14.763Z",
         "duration": "2 hrs 30 mins",
         "meetingLink": "https://microsoft.com",
         "time": "9:30 am"
      },
      "updatedAt": "2025-08-28T08:23:19.026Z",
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

8. Project completed
   [PATCH] `https://api.dev.worko.work/user/guidance-request/:id/WORKO_ADMIN_ACTION`
   ```json
   // Request body
   {
      "newStatus": "PROJECT_COMPLETED",
      "actionByUserId": "REDACTED",
      "actionByUserType": "ADMIN",
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
      "status": "PROJECT_COMPLETED",
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
         },
         {
               "actionByUserId": "REDACTED",
               "newStatus": "MEETING_RESCHEDULE_CONFIRMED",
               "oldStatus": "MEETING_RESCHEDULE_REQUESTED_BY_MENTOR",
               "actionDate": "2025-08-28T08:23:19.022+00:00",
               "actionByUserType": "ADMIN"
         },
         {
               "actionByUserId": "REDACTED",
               "newStatus": "PROJECT_COMPLETED",
               "oldStatus": "MEETING_RESCHEDULE_CONFIRMED",
               "actionDate": "2025-08-28T08:25:01.222+00:00",
               "actionByUserType": "ADMIN"
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
      "updatedByUserId": "REDACTED",
      "scheduleMeetingDetails": {
         "date": "2025-09-27T09:02:14.763Z",
         "duration": "2 hrs 30 mins",
         "meetingLink": "https://microsoft.com",
         "time": "9:30 am"
      },
      "updatedAt": "2025-08-28T08:25:01.225Z",
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