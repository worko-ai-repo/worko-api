
# Pending
1. Testing apis from frontend, mainly signup refresh token issue in frontend
2. 
```sh
1. We have an "Corporate" dashboard that uses username-password login.  
2. We have an "Evaluator" dashboard that usesu password-less otp login(frontend will generate random password and store it in cognito).  

# Scenario One:
   1. lets say If a user with "rohith@nellsys.com" is first invited to the "Evaluator" dashboard, then the account will be created as "evaluator" with some random password
   2. After two days if this user with "rohith@nellsys.com" is invited to the "Corporate" dashboard, then in backend we will check whether it has an account with "evaluator" group or not, if it has then we will store the "evaluatorCognitoUserId" in the invite record and if user try to signup, then he will enter "new password" but frontend will use "evaluatorCognitoUserId" check and just reset the password and post the flow is same

# Scenario Two:
   1. lets say If a user with "shaukat@neobrim.com" is first invited to the "Corporate" dashboard, then the account will be created with "corporate-admin" or "corporate-recruiter" groups with user entered password
   2. After two days if this user with "shaukat@neobrim.com" is invited to the "Evaluator" dashboard, then we need to handle in such a way that, he should just enter "otp"
```
3. retest scenarios
   1. refresh token while signup after populating the email to "evaluator" group
   2. wrong api calls
   3. beautify score details
