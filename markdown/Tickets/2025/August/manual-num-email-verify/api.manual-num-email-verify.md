
1. Update phone number as verified
   [PATCH] `https://api.dev.worko.work/user/:email/details`
   ```json
   // Request body
   {
      "isNumberVerified": true
   }
   ```

2. Update employee current work experience email as verified
   [PATCH] `https://api.dev.worko.work/user/:email/experience`
   ```json
   // Request body
   {
      "isEmailVerified": true
   }
   ```

3. Update email as verified in cognito, dynamodb
   [PATCH] `https://api.dev.worko.work/user/:email/details`
   ```json
   // Request body
   {
      "isEmailVerified": true
   }
   ```