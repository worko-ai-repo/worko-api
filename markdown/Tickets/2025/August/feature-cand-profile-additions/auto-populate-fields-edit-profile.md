
# User Detail:
   ```sh
   PK:- "USR#EML#{primaryEmail}"
   SK:- "ID#{userId}"
   ```
   1. 
   ```ts
   "isCandidateFresher": boolean,
   "multipleCandidateExperience": [
      {
         companyId?: string;
         companyName: string;
         designation: string;
         department: string;
         YOE?: number;
         startDate: string;
         endDate?: string;
      }
   ] // if you store "multipleCandidateExperience" array then make "isCandidateFresher" as false
   ```
   2. "about"?: string
   3. 
   ```json
   "responsibilities": [
      
      {
         "companyName": "string" | undefined,
         "date"?: {
            "startDate": "string", // "2025-03-20T16:02:34.277Z"
            "endDate"?: "string",
         },
         "description": "string",
      }
   ]
   ```
   4. "isCvExtracted": true | false; 

# User Skill:
   ```sh
   PK:- "USR#EML#{primaryEmail}"
   SK: "SKILL#"
   ```
   1. core skills
      ```ts
      "coreSkills": {
         skillName: string;
         years: number;
         timestamps?: {
            createdAt: string;
            updatedAt: string;
         };
      }[]
      ```
   2. soft skills
   ```ts
     softSkills?: {
      skillName: string;
      timestamps?: {
         createdAt: string;
      };
     }[];
   ```
   3. technical skills
   ```ts
   technicalSkills?: {
      skillName: string;
      years: number;
      timestamps?: {
         createdAt: string;
         updatedAt: string;
      };
   }[]
   ```


# Social skills
  ```sh
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKey = "SOCIAL#";
  ```
  1. 
  ```json
  otherSocialPlatForms: {
   "intagram": "https://instagram.com"
  }
  ```

# User Preference
  ```sh
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKey = "PREF#";
  ```
  1. 
  ```json 
  {

   /*
      import { ulid } from "ulidx";
      id= ulid()
   */
   "PK": "USR#EML#{primaryEmail}",
   "SK": "PREF#",
   "createdAt":"",// ISO Date string
   "updatedAt": "",// ISO Date string
   "id": "...",// 
   "userPreferredDepartments": ["depone", "deptwo"],
   "email": "string@gmail.com", // registered user email
   "userPreferredIndustries": ["indone"], // optional
   "userPreferredlocations": ["locone"],// optional
   "userPreferredRoles": ["roleone"],// optional
  }
  ```