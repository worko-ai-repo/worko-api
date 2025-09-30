
1. Create user preference
   [POST] `https://api.dev.worko.work/user/preference/`
   ```json
   // Request body
   {
      "email": "rohithappala777+candidate3@gmail.com",
      "userPreferredDepartments": ["backend", "Ai", "DL"],
      "userPreferredIndustries": ["IT"],
      "userPreferredlocations": ["Hyderabad", "chennai", "Mumbai"],
      "userPreferredRoles": ["Nodejs developer", "Backend web developer"]
   }
   ```
   ```json
   // Response
   {
      "userPreferredDepartments": [
         "backend",
         "ai",
         "dl"
      ],
      "createdByUserId": "REDACTED",
      "updatedByUserId": "REDACTED",
      "updatedAt": "2025-08-22T06:04:00.043Z",
      "userPreferredRoles": [
         "nodejs developer",
         "backend web developer"
      ],
      "SK": "PREF#",
      "createdAt": "2025-08-22T05:54:38.010Z",
      "userPreferredIndustries": [
         "it"
      ],
      "PK": "USR#EML#rohithappala777+candidate3@gmail.com",
      "email": "rohithappala777+candidate3@gmail.com",
      "id": "01K385FS9Q0Z5M3F56BN9K4ST9",
      "userPreferredlocations": [
         "hyderabad",
         "chennai",
         "mumbai"
      ]
   }
   ```

2. Get user preference details by email
   [GET] `https://api.dev.worko.work/user/:email/preference`
   ```json
   // Response
   {
      "userPreferredDepartments": [
         "backend",
         "ai",
         "dl"
      ],
      "createdByUserId": "REDACTED",
      "updatedByUserId": "REDACTED",
      "updatedAt": "2025-08-22T06:04:00.043Z",
      "userPreferredRoles": [
         "nodejs developer",
         "backend web developer"
      ],
      "createdAt": "2025-08-22T05:54:38.010Z",
      "userPreferredIndustries": [
         "it"
      ],
      "SK": "PREF#",
      "PK": "USR#EML#rohithappala777+candidate3@gmail.com",
      "email": "rohithappala777+candidate3@gmail.com",
      "id": "01K385FS9Q0Z5M3F56BN9K4ST9",
      "userPreferredlocations": [
         "hyderabad",
         "chennai",
         "mumbai"
      ]
   }
   ```
