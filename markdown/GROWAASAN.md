# WhatsApp Message Flow using Growaasan API

## Flow Overview:
1. **Trigger**: User action (e.g., signup, referral request).
2. **Send Message**: Use Growaasan API to send a WhatsApp message to Meta, which forwards it to the user on WhatsApp.
   - **Example**: When a user signs up, a welcome message is sent to their WhatsApp.

## Growaasan API Integration Details

### Growaasan API Docs link:
https://workoai-my.sharepoint.com/:x:/g/personal/arup_worko_ai/EW7jsvVVndpGgaple3dJmkQBYGn-IUEydGZxWMtBjt5Afw?e=WvDuDE

### Growaasan API file:
- Location: `Growaasan.library.ts`

### Growaasan Template Names file:
- Location: `GrowaasanTemplate.enum.ts`

### Meta Dashboard Sync:
1. Create templates in the Meta dashboard.
2. Go to the Growaasan platform and click the **Sync Template** button.
   - This will automatically sync the templates from Meta to the Growaasan platform.

## Meta Login Credentials:
- **Username**: `jeetesh87@gmail.com`
- **Password**: `Syzyge@1961`

## Growaasan Website Login:
- **Phone number**: [9910103548](https://growaasan.com/whatsapp-template)

## Meta Dashboard Environments:
- **Account**: Worko.AI  
   **ID**: 461597530360541  
   **Owned By**: Worko  
   - Separate accounts for `prod`, `dev`, and `local` environments need to be created in the next phase.

---

## Environment for `local`,`dev`,`prod`:
# NOTE: `AS of now for prod,dev,local we are using same environment variables, in near future we will use seperate environments`
```sh
APP_GROWAASAN_CLOUD_API_BASE_URL="https://api.growaasan.com/api" # End point Url of Send Template Message API 
APP_GROWAASAN_CLOUD_API_CLIENT_ID="102270" # Unique Id provided by Gro-waasan team for the client (Mandatory)
APP_GROWAASAN_CLOUD_API_AUTHENTICATION_KEY="REDACTED" # Authentication Key provided by growaasan team (Mandatory)
APP_GROWAASAN_CLOUD_API_FROM_PHONE_NUMBER_COUNTRY_CODE="91"
APP_GROWAASAN_CLOUD_API_FROM_PHONE_NUMBER="9811929282"
```

# Growaasan Responses:
1. when I provide wrong client id(in .env) [WITHOUT_BREAKING_APPLICATION]
   ```ts
   { 
      status: 0, 
      message: 'Business not registered' 
   }
   ```
   
2. when I provide wrong auth key(in .env) [WITHOUT_BREAKING_APPLICATION]
   ```ts
   { 
      status: 0, 
      message: 'Authentication failed!'
   }
   ```
   
3. when I provide wrong `communicationType` in query parameter like I have set to `0` instead of `2`(GrowaasanCloudApi.library.ts): [WITHOUT_BREAKING_APPLICATION]
   ```ts
   {
      status: 0,
      message: 'Your SMS Credit is low Please recharge SMS to send any campaign.'
   }
   ```

4. when I provide `varCount` i.e does not match with the count present in the growaasan template placeholder: [WITHOUT_BREAKING_APPLICATION]
  ```ts
  {
   status: 0,
   message: 'Variable value and variable count could not match'
   }
  ```

5. when I provide wrong base url of growaasan below response shown in postman: [BREAKING_APPLICATION]
   ```json
   {
      "errorCode": 500,
      "errorMsg": "Request failed with status code 404",
      "timeStamp": "2024-10-17T08:08:11.205Z"
   }
   ```

6. when I provide wrong `waTemplateName` in query parameter like I have set the template name which was not in growaasan(GrowaasanCloudApi.library.ts) and message was not sent [WITHOUT_BREAKING_APPLICATION]
  ```ts
   {
      status: 1,
      message: 'Message sent successfully',
      whatsapp_uniqueid: '{"status":"failed","message":"template name (broadband_marketing_user) does not exist in en","whatsapp_uniqueid":0}'
   }
  ```

7. when I provide `waTemplateLang` in query parameter like I have set the `waTemplateLang` to `german` and (GrowaasanCloudApi.library.ts) and message was not sent [WITHOUT_BREAKING_APPLICATION]
   ```ts
   {
   status: 1,
   message: 'Message sent successfully',
   whatsapp_uniqueid: '{"status":"failed","message":"template name (signup_candidate) does not exist in spanish","whatsapp_uniqueid":0}'
   }
   ```

8. when placeholder count mismatch in the meta dashboard and in backend code below error message will occur and message was not sent [WITHOUT_BREAKING_APPLICATION], and below is in dynamodb's json which was copied from aws dynamodb:
```json
   { 
      "growaasanException" : { "BOOL" : true }, 
      "whatasappUniqueId" : { "S" : "{\"status\":\"failed\",\"message\":\"body: number of localizable_params (4) does not match the expected number of params (3)\",\"whatsapp_uniqueid\":0}" }, 
      "message" : { "S" : "Message sent successfully" }, 
      "status" : { "N" : "1" } 
   }
```

```sh
## Growaasan API Integration Code Implemented in the Following Files

1. User.service.ts
   sendGrowaasanWelcomeWhatsappMessageToCand [signup_candidate] 
   sendGrowaasanWelcomeWhatsappMessageToEmp [signup_emp] 

2. UserReferralEmp.service.ts -> UserReferal.service.ts
   sendGrowaasanWhatsappMsgToCandWhenReferralRequestAccepted [referral_request_accepted_candidate] 
   sendGrowaasanWhatsappMsgToCandWhenReferralRequestCompleted [referral_request_completed_candidate] 

3. UserReferal.service.ts -> UserReferralEmp.service.ts
   sendGrowaasanWhatsappMsgtoEmployeesOnReferralCreation [new_referral_request_employee] 

4. UserReferralEmp.service.ts
   sendGrowaasanWhatsappMsgToEmpAboutPendingAcceptedReferralRequest [referral_request_pending_employee] 
      1. In `app-scheduler.ts` file, find `handler` function then find `REFERRAL_DONE_STATUS_REMINDER`, and navigate to       `reviewReferralDoneStatusReminder` Function 

5. UserSupport.service.ts
   sendGrowaasanWhatsappMessageToCandAboutEmpReferralQuery [referee_raise_dispute_candidate] 
   sendGrowaasanWhatsappMessageToEmpAboutCandReferralQuery [candidate_raise_dispute_employee] 

6. UserExperience.service.ts
   sendGrowaasanWhatsappMsgToEmpAboutPendingWorkEmailVerification [emp_pending_work_email_verification] 
      1. In `app-scheduler.ts` file, find `handler` function then find `EMP_WORK_EMAIL_VERIFICATION_REMINDER`, and navigate to `reviewWhatsAppWorkEmailVerificationReminder` Function 
```

```sh
## Pending Growaasan Functionality Implementations

1. UserReferral.service.ts [MAY_BE_NEED_TO_IMPLEMENT_IN_CHAT_BACKEND]
   `sendGrowaasanWhatsappMsgToCandOnNewEmpMsgFromCand`
   `sendGrowaasanWhatsappMsgToCandAboutPendingChatMsgCountByEmp`

2. UserReferralEmp.service.ts
   sendGrowaasanWhatsappMsgToEmpAboutPendingAwaitingReferralRequestCount [pending_request_count_employee]
   sendGrowaasanWhatsappMsgToEmpAboutPendingAcceptedReferralRequestCount [accepted_request_count_employee]
   sendGrowaasanWhatsappMsgToEmpAboutPendingChatMsgCountByCand [MAY_BE_NEED_TO_IMPLEMENT_IN_CHAT_BACKEND]
   sendGrowaasanWhatsappMsgToEmpOnNewChatMsgFromCand [MAY_BE_NEED_TO_IMPLEMENT_IN_CHAT_BACKEND]
```
