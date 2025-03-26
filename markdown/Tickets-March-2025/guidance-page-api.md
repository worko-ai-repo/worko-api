```sh
feature/rohith-guidance-page-1
```

```sh
1. subject should be follower by guidance request
2. white check mark  2nd line update
3. your request details need to update
4. onwards, enter candidate phone number
```

1. Guidance page api

```ts
/**
 * @see https://dev-ui.worko.work/guidance
 */
```

2. Frontend inputs
   1. `Guidance Type`
      1. `What you need guidance for`
      2. `Interview hand holding`
      3. `Mock Interview / Preparation`
      4. `Help with assignment`
      5. `Career Guidance`
      6. `Resume Review`
      7. `Other`
   2. `Date`
   3. `Company Name`
   4. `Profile you are interviewing for`
   5. `Provide the detailed description of the required guidance`
3. Email Template
```sh
From : hello@worko.ai
To: Candidate e-mail & Guidance@worko.ai
```
```sh
Subject: Your Guidance Request is Being Processed
Dear {{userName}},
Thank you for submitting your guidance request on Worko. Our team is reviewing your details to match you with the best mentor who can help you succeed.
Here’s what happens next:
 :white_check_mark: Our team will call you to understand your needs in detail.
 :white_check_mark: We’ll find a mentor who has successfully navigated {{companyName}}’s hiring process. (In case of Resume review / Others/ Career guidance , it will be " We'will find a mentor who has successfully navigated in their career & can help you.)
 :white_check_mark: Once matched, we’ll coordinate and confirm your session on or before {{dateOfGuidanceRequest}}.
Your Request Details:
 :small_blue_diamond: Guidance Type: {{guidanceRequestType}}
 :small_blue_diamond: Company Name: {{companyName}}
 :small_blue_diamond: Job URL: {{jobUrl}}
We’ll be in touch soon! If you have any urgent queries, feel free to reply to this email.
Onwards & Upwards,
 Team Worko
```
4. should a user able to request guidance again with same details
   `jobUrl` or `guidanceType` should be different
5. only loggedIn user can able to request guidance.
6. api design
[POST] https://api.dev.worko.work/user/guidance-request
```ts
// Request Payload:
{
  /**
   * guidanceRequestType
   */
  guidanceRequestType: UserGuidanceRequestTypeEnum;

  /**
   * guidanceDeadlineDate
   *
   * @description By when you need the guidance
   * @example `2025-01-27T11:26:06.458Z` 
   */
  guidanceRequestDeadline: string;

  /**
   * companyName
   *
   * @description Any company name is allowed
   */
  companyName: string;

  /**
   * jobUrl
   *
   * @description Any job url allowed
   */
  jobUrl: string;

  /**
   * guidanceRequestDescription
   */
  guidanceRequestDescription: string;
}
```
```json
// Response Payload:
{
  "id": "01JPMK6FQJ6M8F1M9FWKS707D0",
  "PK": "USR#EML#rohithappala777+candidate3@gmail.com",
  "SK": "GUIDANCE#RQST#ID#01JPMK6FQJ6M8F1M9FWKS707D0",
  "GSI1PK": "GUIDANCE#RQST#",
  "GSI1SK": "ID#01JPMK6FQJ6M8F1M9FWKS707D0",
  "createdByUserId": "REDACTED",
  "guidanceRequestType": "WHAT_YOU_NEED_GUIDANCE_FOR",
  "guidanceRequestDeadline": "2025-01-27T11:26:06.458Z",
  "companyName": "TECH CORP",
  "jobUrl": "https://example.com/job-listing",
  "guidanceRequestDescription": "I need guidance on choosing a career path in software development.",
  "createdAt": 1742300462845,
  "updatedAt": 1742300462845
}
```

