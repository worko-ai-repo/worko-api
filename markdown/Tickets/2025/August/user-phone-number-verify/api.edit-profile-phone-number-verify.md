
1. Send otp to user
   [GET] `https://api.dev.worko.work/user/:email/request-otp`
   ```json
   {
      "id": "01K366C6TMRMXVA126VBBHKA8T"
   }
   ```

2. Verify User otp
   [POST] `https://api.dev.worko.work/user/:email/verify-otp`
   ```json
   {
      "otp": "123456"
   }
   ````
   ```json
   {
      "verificationStatus": true,
   }
   ```