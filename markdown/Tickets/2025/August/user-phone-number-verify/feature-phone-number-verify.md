
# Tech stack: 
React, AWS services, Nodejs serverless with ts in backend

# Requirement:
User will login/signup with email using cognito and provide his phone number and we are not verifying this phone number just storing in dynamodb and we are showing `verify` button in the `react ui` when he clicks on that we need to send otp with my customized sms template and once it is verified we need to make `isNumberVerified` to `true` in dynamodb 

# Aws services
1. AWS SNS
```ts
/**
 * Using the Amazon SNS SMS sandbox
 * @see https://docs.aws.amazon.com/sns/latest/dg/sns-sms-sandbox.html
 * 
 * Moving out of the Amazon SNS SMS sandbox
 * @see https://docs.aws.amazon.com/sns/latest/dg/sns-sms-sandbox-moving-to-production.html
 */
```

# Api Flow:
1. Candidate clicks Verify button in React after he loggedin to ui
2. React calls my Node.js API
3. Node.js API interacts with Amazon SNS
   ```ts
   /**
    * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-sns/
    */
   ```
4. SMS sent to candidate
5. candidate enters OTP in React
6. React calls Node.js API to verify OTP

# Todo:
1. Create Phone number send sms logs like we are storing send email logs to email
   ```ts
   /**
    * @example "EmailLog" entity
    */
   ```
2. Check how to handle creating templates for this sns message sending on aws
   ```ts
   /**
    * @example "EmailTemplate" entity
    */
   ```
3. Check the otp generation logic like whether it is correct or wrong
4. Check how to handle and implement expiry of the recieved otp

# SMS Template:
```sh
{otp} is the OTP to verify your mobile on Worko
```
```sh
Welcome aboard! Your verification code is {otp}. We're excited to help you find your next opportunity!
```