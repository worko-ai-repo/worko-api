
# Scenario:
   1. lets say If a user with "shaukat@neobrim.com" is first invited to the "Corporate" dashboard, then the account will be created with "corporate-admin" or "corporate-recruiter" groups with user entered password
   2. After two days if this user with "shaukat@neobrim.com" is invited to the "Evaluator" dashboard, then we need to handle in such a way that, he should just enter "otp"

# High level flow
1. First Try signup
   1. If `evaluator` email exists in cognito
      1. Cognito will throw error by saying this email already exists
   2. If `evaluator` email exists in cognito


