

1. Revoking invite
   [PATCH] `https://api.dev.worko.work/corporate-invite/:id/delete`
   ```json
   // Request body
   {
      "reasonForRevokingInvite": "...."
   }
   ```


2. Creating invite in `Admin` dashboard
   [POST] `https://api.dev.worko.work/corporate-invite/`
   ```json
   // Request body
   {
      // ..old properties..

      // New Property in payload
      "phoneNumberDetails": {
         "countryCode": 91, 
         "phoneNumber": 9666308100,
      },
      "pricingPlan": "JOB_BOARD" | "HIRING_PARTNER" | "CO_PILOT",
      "cvDuplicacyAccess": true,

      // ..old properties.
   }
   ```

3. Creating corporate user which was invited by a `Worko Admin`
   [POST] `https://api.dev.worko.work/corporate-user/`
   ```json
   // Request body
   {
      // ..old properties..

      // New Property in payload
      "phoneNumberDetails": {
         "countryCode": 91, 
         "phoneNumber": 9666308100,
      },

      // ..old properties.
   }
   ```

4. Creating invite in `Corporate` dashboard
   [POST] `https://api.dev.worko.work/corporate-invite/`
   ```json
   // Request body
   {
      // ..old properties..

      // New Property in payload
      "phoneNumberDetails": {
         "countryCode": 91, 
         "phoneNumber": 9666308100,
      }

      // ..old properties.
   }
   ```

5. Creating corporate user which was invited by a `Corporate Admin`
   [POST] `https://api.dev.worko.work/corporate-user/`
   ```json
   // Request body
   {
      // ..old properties..

      // New Property in payload
      "phoneNumberDetails": {
         "countryCode": 91, 
         "phoneNumber": 9666308100,
      }

      // ..old properties.
   }
   ```

6. Resend invite
   [PATCH] `https://api.dev.worko.work/corporate-invite/:id`
   ```json
   // Request body
   {
      "inviteStatus": "AWAITING"
   }
   ```

7. Update cv Duplicacy Access
   [PATCH] `https://api.dev.worko.work/corporate-invite/:id`
   ```json
   // Request body
   {
      "cvDuplicacyAccess": false
   }
   ```

8. `Admin Dashboard`: Get all Registered Corporate Admins for all companies
   [GET] `https://api.dev.worko.work/corporate-user/?pageSize=25&sortOrder=descending&corporateUserType=corporate-admin`
   ```json
   // Response 
   {
      "data": [
         {
            "inviteId": "01JJ8Z9TPKT4ZSCMK8ZXKM9HMH",
            "companyId": "01J0JV686HN43Y4V0RFM8044H3",
            "lastName": "appala zero zero",
            "createdAt": "2025-01-23T07:01:22.340Z",
            "isDeleted": false,
            "email": "rohith.appala+00@worko.ai",
            "firstName": "rohith",
            "GSI1PK": "CORP#USR#REG#",
            "cognitoUserId": "f1d37dfa-7091-7052-4a71-ab01b434c791",
            "updatedAt": "2025-01-23T07:01:22.340Z",
            "SK": "CORP#USR#REG#rohith.appala+00@worko.ai#ID#7HTDYZMW4HE194MWDB06T39HWH",
            "corporateUserType": "corporate-admin",
            "id": "7HTDYZMW4HE194MWDB06T39HWH",
            "PK": "COMP#ID#01J0JV686HN43Y4V0RFM8044H3",
            "GSI1SK": "ID#7HTDYZMW4HE194MWDB06T39HWH",
            "companyDetails": {
               "linkedIn": "https://www.linkedin.com/company/toshiba-transmission-&-distribution-system",
               "industry": "Industry",
               "logoUrl": "",
               "createdAt": "2024-06-17T10:16:54.737Z",
               "GSI1SK": "ID#01J0JV686HN43Y4V0RFM8044H3",
               "logo": "",
               "carrierPage": "https://gooogle.com",
               "name": "WORKO.AI",
               "isVerified": false,
               "teamSize": 0,
               "GSI1PK": "COMP#INDS#Industry",
               "updatedAt": "2024-06-17T10:16:54.737Z",
               "SK": "ID#01J0JV686HN43Y4V0RFM8044H3",
               "PK": "COMP#",
               "id": "01J0JV686HN43Y4V0RFM8044H3"
            }
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

9. `Admin Dashboard Sub Listing`: Get all `Corporate invites` by attaching `registered corporate user details` for a particular `Company`
   [GET] `https://api.dev.worko.work/corporate-invite/?pageSize=25&companyId=01JWAQF1G96E0SE9XHXSFGHNWW&sortOrder=descending&includeCompanyDetails=false&includeRegisteredCorporateDetails=true`
   ```json
   {
      "data": [
         {
            "GSI1PK": "CORP#USR#INVT#",
            "GSI1SK": "ID#01K42EWK8TNEAC3FZ3YPNZF6B3",
            "PK": "COMP#ID#01JWAQF1G96E0SE9XHXSFGHNWW",
            "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
            "corporateUserType": "corporate-admin",
            "createdAt": "2025-09-01T10:59:10.245Z",
            "createdByUserId": "REDACTED",
            "email": "rohith.appala+flowtesttwo@worko.ai",
            "expiresAt": "2025-09-16T10:59:10.164Z",
            "firstName": "Rohith",
            "id": "01K42EWK8TNEAC3FZ3YPNZF6B3",
            "inviteStatus": "ACCEPTED",
            "isDeleted": false,
            "lastName": "Appala one jbk",
            "updatedAt": "2025-09-01T11:01:48.951Z",
            "SK": "CORP#USR#INVT#rohith.appala+flowtesttwo@worko.ai#ID#01K42EWK8TNEAC3FZ3YPNZF6B3",

            //  "corporateUserDetails" will be present only when "inviteStatus": "ACCEPTED" otherwise it will be not defined.
            "corporateUserDetails": {
               "inviteId": "01K42EWK8TNEAC3FZ3YPNZF6B3",
               "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
               "lastName": "Appala one jbk",
               "createdAt": "2025-09-01T11:01:48.556Z",
               "isDeleted": false,
               "email": "rohith.appala+flowtesttwo@worko.ai",
               "firstName": "Rohith",
               "GSI1PK": "CORP#USR#REG#",
               "cognitoUserId": "4113fd8a-8071-70c7-a616-78c276e1f2e9",
               "updatedAt": "2025-09-01T11:01:48.556Z",
               "SK": "CORP#USR#REG#rohith.appala+flowtesttwo@worko.ai#ID#212FYRN03HE33TC5KRR9VE3WQ9",
               "corporateUserType": "corporate-admin",
               "id": "212FYRN03HE33TC5KRR9VE3WQ9",
               "PK": "COMP#ID#01JWAQF1G96E0SE9XHXSFGHNWW",
               "GSI1SK": "ID#212FYRN03HE33TC5KRR9VE3WQ9"
            }
         },
         {
            "GSI1PK": "CORP#USR#INVT#",
            "GSI1SK": "ID#01JXKS5DNJ7JENZKQJCH1J8MXZ",
            "PK": "COMP#ID#01JWAQF1G96E0SE9XHXSFGHNWW",
            "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
            "corporateUserType": "corporate-recruiter",
            "createdAt": "2025-06-13T04:35:57.748Z",
            "createdByUserId": "REDACTED",
            "deletedByCorporateUserId": "5HGF6ZMR5HE3GP92Q640B4ERVK",
            "email": "rohith.appala+corprecruiter@worko.ai",
            "expiresAt": "2025-06-28T04:35:57.631Z",
            "firstName": "Rohith",
            "id": "01JXKS5DNJ7JENZKQJCH1J8MXZ",
            "inviteStatus": "DELETED",
            "isDeleted": true,
            "lastName": "Appala one",
            "updatedAt": "2025-06-27T05:55:44.654Z",
            "SK": "CORP#USR#INVT#rohith.appala+corprecruiter@worko.ai#ID#01JXKS5DNJ7JENZKQJCH1J8MXZ"
         }

      ],
      "pagination": {
         "count": 2,
         "pageSize": 25,
         "sortOrder": "descending",
         "timesQueried": 1,
         "queriedCount": 0
      }
   }
   ```

10. `Corporate Dashboard`: Get all `Corporate invites` by attaching `registered corporate user details` for a particular `Company`
   [GET] `https://api.dev.worko.work/corporate-invite/?pageSize=25&companyId=01JWAQF1G96E0SE9XHXSFGHNWW&sortOrder=descending&includeCompanyDetails=false&includeRegisteredCorporateDetails=true`
   ```json
   {
      "data": [
         {
            "GSI1PK": "CORP#USR#INVT#",
            "GSI1SK": "ID#01K42EWK8TNEAC3FZ3YPNZF6B3",
            "PK": "COMP#ID#01JWAQF1G96E0SE9XHXSFGHNWW",
            "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
            "corporateUserType": "corporate-admin",
            "createdAt": "2025-09-01T10:59:10.245Z",
            "createdByUserId": "REDACTED",
            "email": "rohith.appala+flowtesttwo@worko.ai",
            "expiresAt": "2025-09-16T10:59:10.164Z",
            "firstName": "Rohith",
            "id": "01K42EWK8TNEAC3FZ3YPNZF6B3",
            "inviteStatus": "ACCEPTED",
            "isDeleted": false,
            "lastName": "Appala one jbk",
            "updatedAt": "2025-09-01T11:01:48.951Z",
            "SK": "CORP#USR#INVT#rohith.appala+flowtesttwo@worko.ai#ID#01K42EWK8TNEAC3FZ3YPNZF6B3",

            //  "corporateUserDetails" will be present only when "inviteStatus": "ACCEPTED" otherwise it will be not defined.
            "corporateUserDetails": {
               "inviteId": "01K42EWK8TNEAC3FZ3YPNZF6B3",
               "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
               "lastName": "Appala one jbk",
               "createdAt": "2025-09-01T11:01:48.556Z",
               "isDeleted": false,
               "email": "rohith.appala+flowtesttwo@worko.ai",
               "firstName": "Rohith",
               "GSI1PK": "CORP#USR#REG#",
               "cognitoUserId": "4113fd8a-8071-70c7-a616-78c276e1f2e9",
               "updatedAt": "2025-09-01T11:01:48.556Z",
               "SK": "CORP#USR#REG#rohith.appala+flowtesttwo@worko.ai#ID#212FYRN03HE33TC5KRR9VE3WQ9",
               "corporateUserType": "corporate-admin",
               "id": "212FYRN03HE33TC5KRR9VE3WQ9",
               "PK": "COMP#ID#01JWAQF1G96E0SE9XHXSFGHNWW",
               "GSI1SK": "ID#212FYRN03HE33TC5KRR9VE3WQ9"
            }
         },
         {
            "GSI1PK": "CORP#USR#INVT#",
            "GSI1SK": "ID#01JXKS5DNJ7JENZKQJCH1J8MXZ",
            "PK": "COMP#ID#01JWAQF1G96E0SE9XHXSFGHNWW",
            "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
            "corporateUserType": "corporate-recruiter",
            "createdAt": "2025-06-13T04:35:57.748Z",
            "createdByUserId": "REDACTED",
            "deletedByCorporateUserId": "5HGF6ZMR5HE3GP92Q640B4ERVK",
            "email": "rohith.appala+corprecruiter@worko.ai",
            "expiresAt": "2025-06-28T04:35:57.631Z",
            "firstName": "Rohith",
            "id": "01JXKS5DNJ7JENZKQJCH1J8MXZ",
            "inviteStatus": "DELETED",
            "isDeleted": true,
            "lastName": "Appala one",
            "updatedAt": "2025-06-27T05:55:44.654Z",
            "SK": "CORP#USR#INVT#rohith.appala+corprecruiter@worko.ai#ID#01JXKS5DNJ7JENZKQJCH1J8MXZ"
         }

      ],
      "pagination": {
         "count": 2,
         "pageSize": 25,
         "sortOrder": "descending",
         "timesQueried": 1,
         "queriedCount": 0
      }
   }
   ```