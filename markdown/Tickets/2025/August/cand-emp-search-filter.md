
# Issue
```sh
In `UserDetailModel` the user type is stored as array of strings i.e, userType: string[]; 
for example userType: ["EMP", "CAND"] or for another user it maybe userType: ["CAND"] 

and we have a candidate listing page and employee listing page in `admin dashboard` 
so we definitely use `userType` filter and we are using as below:

# For candidate
let query: Query<DbUserDetailDto> = UserDetailModel.query("GSI2PK")
                                                   .eq("USR#")
                                                   .sort("descending")
                                                   .where("userType")
                                                   .contains("CAND")

# For candidate
let query: Query<DbUserDetailDto> = UserDetailModel.query("GSI2PK")
                                                   .eq("USR#")
                                                   .sort("descending")
                                                   .where("userType")
                                                   .contains("EMP")

so this where condition is mustly used and now its around 6000 data in dynamodb its fine, 
but if the data increases to `20,000+` then it won't work

so to satisfy search filters, fromdate and to date filters and this usertype filter 

refer `UserDetail.dao.ts` and `UserDetail.model.ts` 

let's say 
1. `rohithappala123@gmail.com` signedup as `CAND` and the `userType` will be stored as ["CAND"] i.e userType=["CAND"]

2. `rohithappala456@gmail.com` signedup as `EMP` and the `userType` will be stored as ["EMP"] i.e userType=["EMP"]

3. `rohithappala789@gmail.com` signedup as `EMP` and the `userType` will be stored as ["EMP"] i.e userType=["EMP"] and if he switch to employee dashboard then `rohithappala789@gmail.com` userType will be ["EMP","CAND"] 
i.e. userType=["EMP","CAND"]
```
```ts
// Current Composite keys and Indexes
partitianKey: string = "USR#EML#{primaryEmail}"; 
sortKeys = {
   SK_ID: "ID#{userId}",
};
GSI1PK: string = "USR#";
GSI1SK: string = "ID#{userId}";
GSI2PK: string = "USR#";
GSI2SK: string = "{createdAt}"; // "2025-06-11T16:15:36.0678Z"
```
```ts
// New Composite keys and Indexes
partitianKey: string = "USR#EML#{primaryEmail}"; 
sortKeys = {
   SK_ID: "ID#{userId}", 
};
GSI1PK: string = "USR#";
GSI1SK: string = "ID#{userId}"; 
GSI2PK: string = "USR#CAND#"; // Make It Optional
GSI2SK: string = "{createdAt}"; // "2025-06-11T16:15:36.0678Z" // Make It Optional
GSI3PK: string = "USR#EMP#"; // Make It Optional
GSI3SK: string = "{createdAt}"; // "2025-06-11T16:15:36.0678Z" // Make It Optional
```
```sh
With above new composite keys and indexes,
1. whenever the `rohithappala123@gmail.com` user signup as `candidate` then it will store as below:
   ```ts
   partitianKey: string = "USR#EML#rohithappala123@gmail.com"; 
   sortKeys = {
      SK_ID: "ID#{cognitoUserId}", 
   };
   GSI1PK: string = "USR#";
   GSI1SK: string = "ID#{cognitoUserId}"; 
   GSI2PK: string = "USR#CAND#"; 
   GSI2SK: string = "{createdAt}"; // "2025-06-11T16:15:36.0678Z" 
   ```
2. whenever the `rohithappala456@gmail.com` user signup as `employee` then it will store as below:
   ```ts
   partitianKey: string = "USR#EML#rohithappala456@gmail.com"; 
   sortKeys = {
      SK_ID: "ID#{cognitoUserId}", 
   };
   GSI1PK: string = "USR#";
   GSI1SK: string = "ID#{cognitoUserId}"; 
   GSI3PK: string = "USR#EMP#"; 
   GSI3SK: string = "{createdAt}"; // "2025-06-11T16:15:36.0678Z" 
   ```
3. whenever the `rohithappala789@gmail.com` user signup as `employee` then it will store as below:
   ```ts
   partitianKey: string = "USR#EML#rohithappala789@gmail.com"; 
   sortKeys = {
      SK_ID: "ID#{cognitoUserId}", 
   };
   GSI1PK: string = "USR#";
   GSI1SK: string = "ID#{cognitoUserId}"; 
   GSI3PK: string = "USR#EMP#"; 
   GSI3SK: string = "{createdAt}"; // "2025-06-11T16:15:36.0678Z" 
   ```
   1. whenever the `rohithappala789@gmail.com` user switchs to `candidate` then it will update as below:
      ```ts
      partitianKey: string = "USR#EML#rohithappala789@gmail.com"; 
      sortKeys = {
         SK_ID: "ID#{cognitoUserId}", 
      };
      GSI1PK: string = "USR#";
      GSI1SK: string = "ID#{cognitoUserId}"; 
      GSI2PK: string = "USR#CAND#"; 
      GSI2SK: string = "{createdAt}"; // "2025-06-11T16:15:36.0678Z" 
      GSI3PK: string = "USR#EMP#"; 
      GSI3SK: string = "{createdAt}"; // "2025-06-11T16:15:36.0678Z" 
      ```
```
