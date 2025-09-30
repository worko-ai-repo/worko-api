
1. 
   [PUT] https://api.dev.worko.work/user/:id/details
   ```json
   {
      // ....
      "gender":  "MALE"  |  "FEMALE"  |  "OTHER"
      "responsibilities": [
         {
            "companyId": "string",
            "companyName": "string",
            "date": {
               "startDate": "2025-03-20T16:02:34.277Z",
               "endDate": "..."
            },
            "description": "...."
         }
      ]
      // ...
   }
   ```

2. create social profile 
   [POST] https://api.dev.worko.work/user/:userEmail/socialprofile
   ```json
   {
      "twitter": ["https://x.com/"],
      "github": ["https://github.com/"],
      "linkedin": ["https://www.linkedin.com/"],
      "otherSocialPlatForms": {
         "hackerRank": ["https://www.hackerrank.com/auth/login/decisions"],
         "codeChef": ["https://www.codechef.com/login"],
         "leetCode": ["https://leetcode.com/accounts/login/"]
      }
      }
   ```

3. update social profile
   [POST] https://api.dev.worko.work/user/:userEmail/socialprofile
   ```json
   {
      "PK": "USR#EML#rohithappala777+candidate3@gmail.com",
      "SK": "SOCIAL#",
      "twitter": ["https://x.com/"],
      "github": ["https://github.com/"],
      "linkedin": ["https://www.linkedin.com/"],
      "otherSocialPlatForms": {
         "brocode": ["https://www.hackerrank.com/auth/login/decisions"],
         "hackerRank": ["https://www.hackerrank.com/auth/login/decisions"],
         "codeChef": ["https://www.codechef.com/login"],
         "leetCode": ["https://leetcode.com/accounts/login/"]
      }
      }
   ```

4. create/update candidate experiences:
   [PUT] https://api.dev.worko.work/user/:id/details
   ```json
   {
      // ....
      "multipleCandidateExperience": [
         {
            "companyId": "string", // optional
            "companyName": "string",
            "designation": "string",
            "department": "string",
         }
      ]
      // ...
   }
   ```

5. Update cv
   [PATCH] `https://api.dev.worko.work/user/rohithappala777+verifynumdebug1@gmail.com/cv`
   ```json
   { 
      "resume": "01K58NDHR8K0DG9E4328VJAJD2.pdf",
      "userCvFileName": "RohithAppala.pdf"
   }
   ```