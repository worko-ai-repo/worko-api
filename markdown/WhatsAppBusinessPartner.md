# WhatsApp Message Flow using WhatsAppBusinessPartner API

## Flow Overview:

1. **Trigger**: User action (e.g., signup, referral request).
2. **Send Message**: Use WhatsAppBusinessPartner API to send a WhatsApp message to Meta, which forwards it to the user on WhatsApp.
   - **Example**: When a user signs up, a welcome message is sent to their WhatsApp.

## WhatsAppBusinessPartner API Integration Details

### WhatsAppBusinessPartner API Docs link:
(https://workoai-my.sharepoint.com/:x:/g/personal/arup_worko_ai/EW7jsvVVndpGgaple3dJmkQBYGn-IUEydGZxWMtBjt5Afw?e=WvDuDE)

### WhatsAppBusinessPartner API file:
- Location: `WhatsAppBusinessPartner.library.ts`

### WhatsAppBusinessPartner Template Names file:
- Location: `WhatsAppBusinessPartnerTemplate.enum.ts`

## Meta Login Credentials:
- **Username**: `jeetesh87@gmail.com`
- **Password**: `Syzyge@1961`

```sh
(https://business.facebook.com/latest/settings/whatsapp_account?business_id=771967581410913&selected_asset_id=497617343443104&selected_asset_type=whatsapp-business-account)
Worko
ID: 497617343443104
Owned by: Worko
```

```sh
# Account Setup Details
Website: `https://console.wbbox.in/`
User ID: `Worko_tech3104Wapp`
Password: `Worko_tech3104Wapp`
WABA Number: `9811929282`
Phone number ID: `496822040188825`
API Key: `REDACTED`
```

# WhatsAppBusinessPartner Responses:

1. Success Response

```json
    {
        "contacts": [
        {
            "input": "9196663081xx",
            "wa_id": "9196663081xx"
        }
        ],
        "messages": [
        {
            "id": "wamid.HBgMOTE5NjY2MzA4MTAwFQIAERgSNzcyRTlEN0E2MkU1QjIxMzdFAA==",
            "message_status": "accepted"
        }
        ],
        "messaging_product": "whatsapp"
    }
```

2. When `WHATSAPP BUSINESS PARTNER CLOUD API BASE URL` given wrong, The message was not send but given below response:

```json
{
  "contacts": [
    {
      "input": "919666308100",
      "wa_id": "919666308100"
    }
  ],
  "messages": [
    {
      "id": "wamid.HBgMOTE5NjY2MzA4MTAwFQIAERgSMUVFRkU5OTkzNUIwNEE3OTZGAA==",
      "message_status": "accepted"
    }
  ],
  "messaging_product": "whatsapp"
}
```

3. When I Give WHATSAPP BUSINESS PARTNER CLOUD API KEY then the entire application will break because it will go to `Catch` block
   and throw error and the sample error details are below:
   -> Note: If the error comes to `catch` block and if after catching the error, if we don't return and handle it properly from `catch` block properly then the request action will be failed for the end user

```json
// Error detail which are catch in the `catch` block and returned like `error.response.data`
// Refer: `catch` block in `WhatsAppBusinessPartnerCloudApi.library.ts` file
{
  "code": 100,
  "message": "Invalid apikey",
  "status": "failed"
}
```

```ts
// basic failure resoponse details
{
    status: 401,
    statusText: 'Unauthorized',
}
```

```js
// deep response details in `Catch` block
 {
  error: AxiosError: Request failed with status code 401
      at settle (webpack://worko-api/./node_modules/axios/dist/node/axios.cjs?:1983:12)
      at IncomingMessage.handleStreamEnd (webpack://worko-api/./node_modules/axios/dist/node/axios.cjs?:3085:11)
      at IncomingMessage.emit (node:events:531:35)
      at IncomingMessage.emit (node:domain:488:12)
      at endReadableNT (node:internal/streams/readable:1696:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:82:21)
      at Axios.request (webpack://worko-api/./node_modules/axios/dist/node/axios.cjs?:4224:41)
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
      at async WhatsAppBusinessPartnerCloudApiLibrary.sendTemplateMessage (webpack://worko-api/./dist/src/libraries/WhatsAppBusinessPartnerCloudApi.library.js?:53:30)
      at async WhatsAppBusinessPartnerLibrary.sendWhatsAppBusinessPartnerWhatsappMessage (webpack://worko-api/./dist/src/libraries/WhatsAppBusinessPartner.library.js?:49:60)
      at async UserService.setupUserResources (webpack://worko-api/./dist/src/services/User.service.js?:73:13)
      at async UserService.createNewUser (webpack://worko-api/./dist/src/services/User.service.js?:36:9)
      at async createCandidate (webpack://worko-api/./dist/src/controllers/User.controller.js?:142:29) {
    code: 'ERR_BAD_REQUEST',
    config: {
      transitional: [Object],
      adapter: [Array],
      transformRequest: [Array],
      transformResponse: [Array],
      timeout: 0,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      maxContentLength: -1,
      maxBodyLength: -1,
      env: [Object],
      validateStatus: [Function: validateStatus],
      headers: [Object [AxiosHeaders]],
      method: 'post',
      url: 'https://partnersv1.pinbot.ai/v3/496822040188825/messages',
      data: '{"messaging_product":"whatsapp","recipient_type":"individual","to":"919666308100","type":"template","template":{"name":"signup_candidate","language":{"code":"en"},"components":[{"type":"body","parameters":[{"type":"text","text":"Alotone"}]}]}}'
    },
    request: ClientRequest {
      _events: [Object: null prototype],
      _eventsCount: 7,
      _maxListeners: undefined,
      outputData: [],
      outputSize: 0,
      writable: true,
      destroyed: true,
      _last: false,
      chunkedEncoding: false,
      shouldKeepAlive: true,
      maxRequestsOnConnectionReached: false,
      _defaultKeepAlive: true,
      useChunkedEncodingByDefault: true,
      sendDate: false,
      _removedConnection: false,
      _removedContLen: false,
      _removedTE: false,
      strictContentLength: false,
      _contentLength: '243',
      _hasBody: true,
      _trailer: '',
      finished: true,
      _headerSent: true,
      _closed: true,
      socket: [TLSSocket],
      _header: 'POST /v3/496822040188825/messages HTTP/1.1\r\n' +
        'Accept: application/json, text/plain, */*\r\n' +
        'Content-Type: application/json\r\n' +
        'apikey: 12854292-d4ae-11ef-bb5a\r\n' +
        'User-Agent: axios/1.7.2\r\n' +
        'Content-Length: 243\r\n' +
        'Accept-Encoding: gzip, compress, deflate, br\r\n' +
        'Host: partnersv1.pinbot.ai\r\n' +
        'Connection: keep-alive\r\n' +
        '\r\n',
      _keepAliveTimeout: 0,
      _onPendingData: [Function: nop],
      agent: [Agent],
      socketPath: undefined,
      method: 'POST',
      maxHeaderSize: undefined,
      insecureHTTPParser: undefined,
      joinDuplicateHeaders: undefined,
      path: '/v3/496822040188825/messages',
      _ended: true,
      res: [IncomingMessage],
      aborted: false,
      timeoutCb: null,
      upgradeOrConnect: false,
      parser: null,
      maxHeadersCount: null,
      reusedSocket: false,
      host: 'partnersv1.pinbot.ai',
      protocol: 'https:',
      _redirectable: [Writable],
      [Symbol(shapeMode)]: false,
      [Symbol(kCapture)]: false,
      [Symbol(kBytesWritten)]: 0,
      [Symbol(kNeedDrain)]: false,
      [Symbol(corked)]: 0,
      [Symbol(kOutHeaders)]: [Object: null prototype],
      [Symbol(errored)]: null,
      [Symbol(kHighWaterMark)]: 16384,
      [Symbol(kRejectNonStandardBodyWrites)]: false,
      [Symbol(kUniqueHeaders)]: null
    },
    response: {
      status: 401,
      statusText: 'Unauthorized',
      headers: [Object [AxiosHeaders]],
      config: [Object],
      request: [ClientRequest],
      data: [Object]
    }
  }
}
```

4. When WHATSAPP BUSINESS PARTNER CLOUD API FROM PHONE NUMBER ID was wrong

```json
{
    "code":100,
    "message":"Authentication Failed",
    "status":"failed"
}
```

5. When I give the payload details wrong:
   1. when I give `messaging_product` value wrong like `SOME_CHATTING_APP`
   ```json
   // its not even making any post request call
   ```
   2. when I give the phone number that doesn't have whatsapp account
   ```json
       {
       "contacts": [{ "input": "91xxxxxxxxxx", "wa_id": "91xxxxxxxxxx" }],
       "messages": [
           {
           "id": "wamid.HBgNOTE3MjUxMDI3ODg4ORUCABEYEjI3REY4N0RDQzk4RDM1QzZGMAA=",
           "message_status": "accepted"
           }
       ],
       "messaging_product": "whatsapp"
   }
   ```
   3. when I give the phone number without `91` country code
   ```json
   {
   "contacts": [{ "input": "9666308100", "wa_id": "919666308100" }],
   "messages": [
       {
       "id": "wamid.HBgMOTE5NjY2MzA4MTAwFQIAERgSOEVBQTZGNjVGQUUzNjkwRjhBAA==",
       "message_status": "accepted"
       }
   ],
   "messaging_product": "whatsapp"
   }
   ```
   4. when I give wrong template name:
   ```json
   {
       "error": {
           "code": 132001,
           "error_data": {
           "details": "template name (wrong_template_name) does not exist in en",
           "messaging_product": "whatsapp"
           },
           "fbtrace_id": "AxH0AAUnIbxpIlp_GawvYrX",
           "message": "(#132001) Template name does not exist in the translation",
           "type": "OAuthException"
       }
   }
   ```
   5. when I give wrong template language:
   ```json
   {
   "error": {
       "code": 132001,
       "error_data": {
       "details": "template name (signup_candidate) does not exist in en_US",
       "messaging_product": "whatsapp"
       },
       "fbtrace_id": "A9_B2L5ROotC-hvJHoFZMqT",
       "message": "(#132001) Template name does not exist in the translation",
       "type": "OAuthException"
    }
   }
   ```
   6. If I pass an extra placeholders
   ```json
   {
    "error": {
        "code": 132000,
        "error_data": {
        "details": "body: number of localizable_params (2) does not match the expected number of params (1)",
        "messaging_product": "whatsapp"
        },
        "fbtrace_id": "AdhIu2fkSysmN4XmDFLxmx3",
        "message": "(#132000) Number of parameters does not match the expected number of params",
        "type": "OAuthException"
    }
   }
   ```

```sh
## WhatsAppBusinessPartner API Integration Code Implemented in the Following Files

1. User.service.ts
   1. CAND_SIGNUP_CANDIDATE [signup_candidate]
   2. EMP_SIGNUP_EMP [signup_emp]

2. UserReferralEmp.service.ts 
    1. CAND_REFERRAL_REQUEST_ACCEPTED_CANDIDATE [referral_request_accepted_candidate]
      1. `this.scheduleReferralDoneStatusReminder` in `UserReferralEmp.service.ts`
    2. CAND_REFERRAL_REQUEST_COMPLETED_CANDIDATE [referral_request_completed_candidate]

3. UserReferal.service.ts -> UserReferralEmp.service.ts
   1. EMP_NEW_REFERRAL_REQUEST_EMPLOYEE [new_referral_request_employee]

4. UserReferralEmp.service.ts
    1. EMP_REFERRAL_REQUEST_PENDING_EMPLOYEE [referral_request_pending_employee]
      1. In `app-scheduler.ts` file, find `handler` function then find `REFERRAL_DONE_STATUS_REMINDER`, and navigate to       `reviewReferralDoneStatusReminder` Function

5. UserSupport.service.ts
   1. CAND_REFEREE_RAISE_DISPUTE_CANDIDATE [referee_raise_dispute_candidate]
   2. EMP_CANDIDATE_RAISE_DISPUTE_EMPLOYEE [candidate_raise_dispute_employee]

6. UserExperience.service.ts
   1. EMP_PENDING_WORK_EMAIL_VERIFICATION [emp_pending_work_email_verification]
      1. In `app-scheduler.ts` file, find `handler` function then find `EMP_WORK_EMAIL_VERIFICATION_REMINDER`, and navigate to `reviewWhatsAppWorkEmailVerificationReminder` Function
```

1. Example Send Message To Send Whatsapp Template Message

# Request Url: `https://partnersv1.pinbot.ai/v3/496822040188825/messages`

# Request Method: `POST`

# Request Headers:

apikey: `REDACTED`
Content-Type: `application/json`

# Request Payload:

```json
{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "919666308100", // To Phone Number
    "type": "template",
    "template": {
        "name": "referee_raise_dispute_candidate", // Template Name
        "language": {
            "code": "en"
        },
        "components": [
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text": "Rohith" // First placeholder
                    },
                    {
                        "type": "text",
                        "text": "Jeetesh" // Second placeholder
                    },
                    {
                        "type": "text",
                        "text": "Referral" // Third placeholder
                    },
                    {
                        "type": "text",
                        "text": "text-string" // Fourth placeholder
                    }
                ]
            }
        ]
    }
}
```

```sh
# Example Curl to send Whatsapp Message
curl --location 'https://partnersv1.pinbot.ai/v3/496822040188825/messages' \
--header 'apikey: REDACTED' \
--header 'Content-Type: application/json' \
--data '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "919666308100",
    "type": "template",
    "template": {
        "name": "referee_raise_dispute_candidate",
        "language": {
            "code": "en"
        },
        "components": [
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text": "Rohith"
                    },
                    {
                        "type": "text",
                        "text": "Jeetesh"
                    },
                    {
                        "type": "text",
                        "text": "Referral"
                    },
                    {
                        "type": "text",
                        "text": "text-string"
                    }
                ]
            }
        ]
    }
}'
```
