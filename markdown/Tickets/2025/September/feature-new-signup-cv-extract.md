
# Production checklist
1. `.env.prod` populate to `.env`
2. npm install
3. Create `worko-resume-signup-skills-parser-prod` lambda function in `prod` by checking with shaukat


1. Partial Cv extract trigger
   Lambda name:- `worko-resume-signup-skills-parser`
   ```json
   // Payload
   {
      "s3ResumeId": "01JW1CW2XX2N4THW5376VDX6EB.pdf ",
      "userId": ""
   }
   ```

   [POST]  `https://api.dev.worko.work/user/parseCv`
   ```json
   // Request Body
   {
      "s3ResumeId": "01JW1CW2XX2N4THW5376VDX6EB.pdf"
   }
   ```
   ```json
   // Response 
   {
      "coreSkills": [
         {
            "skillName": "string", // store it in `lowercase`
            
            // If years is not present then it will be stored as 0 and frontend should not show this years of experience for this skill
            "years": 1, // number
         }
      ],

      // If YOE is not present then it will be stored as 0 and frontend will show it as 0 and user can increase it
      "YOE": 2,// number

      // If not present then store it as empty array, ex:- []
      "userPreferredDepartments": ["string"],
   }
   ```
2. Do not trigger `profile` percentage code
```sh
WARNING: Do not remove this commented code because we may
use this in near future

NOTE: In `2024` we used `angular` in frontend and in that we used to have
profile percentage for user(candidate, employee) but now we are not
using it, so we are commenting this code to stop calculating the profile percentage
for new users
```