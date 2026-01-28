
# baseUrl: `https://api.dev.worko.work`


1. Create referral sourcetype email activation
   [POST] `/referral-sourcetype-activation/`
   ```json
   // Request payload
   {
      "referralSourceTypeEmail": "pankaj@amazon.com"
   }
   ```
   ```json
   // Response
   {
      "createdByCorporateUserId": "01AE6WMG21E35D3AA6FAXJD8WC",
      "createdByCorporateUserEmail": "rohith.appala+byjus@worko.ai",
      "companyId": "01HZM7MDK1QZCCV7ZD41VGBAVD",
      "referralSourceTypeEmail": "pankaj@amazon.com",
      "systemReferralSourceTypeEmail": "01HZM7MDK1QZCCV7ZD41VGBAVD@referral.worko.work",
      "id": "01KEVM9KD5T2WNPZH5034WDQ86",
      "createdAt": "2026-01-13T12:11:38.227+00:00",
      "updatedAt": "2026-01-13T12:11:38.227+00:00"
   }
   ```



2. 
 `POST` /corporate-user/request-otp/referral-sourcetype
```json
// Request payload
{
  /**
   * @description
   *  1. This email will be submitted by "corporate-admin"
   * @example "pankaj@amazon.com"
   */
  "referralSourceTypeEmail": "string"
}
```
```json
// Response
{
    "id": "..."
}
```








3. 
`POST` `/corporate-user/verify-otp/referral-sourcetype`
```json
// Request payload
{
  /**
   * @description
   *  1. This email will be submitted by "corporate-admin"
   * @example "pankaj@amazon.com"
   */
  referralSourceTypeEmail: string;
  otp: string;
}
```
```json
// Response
{
   verificationStatus: true
}
```


4. 
`GET` `/referral-sourcetype-activation/company/:companyId/email/:referralSourceTypeEmail`
```json
// Response
   {
      "createdByCorporateUserId": "01AE6WMG21E35D3AA6FAXJD8WC",
      "createdByCorporateUserEmail": "rohith.appala+byjus@worko.ai",
      "companyId": "01HZM7MDK1QZCCV7ZD41VGBAVD",
      "referralSourceTypeEmail": "pankaj@amazon.com",
      "systemReferralSourceTypeEmail": "01HZM7MDK1QZCCV7ZD41VGBAVD@referral.worko.work",
      "id": "01KEVM9KD5T2WNPZH5034WDQ86",
      "createdAt": "2026-01-13T12:11:38.227+00:00",
      "updatedAt": "2026-01-13T12:11:38.227+00:00"
   }
```