


# Preferences:
   1. Roles Iam Looking for
   2. Industry preference
   3. Department
   4. Location


1. UserPreference.dao.ts
```ts
modelName = "UserPreference";
partitianKey = "USR#EML#{primaryEmail}"; 
sortKeys = { SK_ID: "PREF#" };
```
