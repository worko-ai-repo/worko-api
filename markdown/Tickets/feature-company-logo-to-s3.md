
# Prod checklist:
1. deploy `worko-auth`
2. In `worko-ui-comp-logo-dev` aws s3 bucket, update `Cross-origin resource sharing (CORS)`
```ts
// On `prod`

[
   {
      "AllowedHeaders": [
         "*"
      ],
      "AllowedMethods": [
         "GET",
         "PUT",
         "POST"
      ],
      "AllowedOrigins": [
         "https://worko.ai/"
      ],
      "ExposeHeaders": []
   }
]
```
```ts
// On `dev`

[
   {
      "AllowedHeaders": [
         "*"
      ],
      "AllowedMethods": [
         "GET",
         "PUT",
         "POST"
      ],
      "AllowedOrigins": [
         "http://localhost:4200",
         "https://dev-ui.worko.work/"
      ],
      "ExposeHeaders": []
   }
]
```

# Test cases:
1. create company api
   1. Authorization check with the account without admin access:
      # No-admin-account
         1. mali5049+e1@gmail.com/Test@123
   2. joi validation
2. upload company logo from `admin dashboard`
   1. Give wrong company id
   2. Joi validation
3. check whether the `logo` attribute updated correctly or not
4. check `s3` path for `company logo`
5. check old company listing logos
6. check `request company api`
7. Test the entire application flow because in `worko-api` repository:
   1. job application routes are deleted 
   2. company job routers are deleted

# High Level Api Flow:
   # Create Company Flow
   1. Admin submits company name and info to create company.
      1. Create company api
         Request URL:
            `https://api.dev.worko.work/company/`
         Request Method: `POST`
         Status Code: `200 OK`
         ```json
         // Request Payload:
         {
            "name": "Amazon", // required
            "industry": "string", // required
            "teamSize": 1000, // required
            "carrierPage": "string", // required
            "linkedIn": "string", // required
            "aboutCompany": "string", // optional
            "website": "string", // optional
         }
         ```
   2. Frontend calls generateSignedUrl(companyId) → gets upload URL.
      1. Company Logo Generate pre-signed url
         Request URL `https://api.dev.worko.work/file/gsu2u/COMPANY_LOGO`
         Request Method `POST`
         ```json
         // Request Payload
         {
            "companyLogoFileName": "neobrim-test-2.jpg",
            "companyLogoFileMimeType": "image/jpeg"
         }
         ```
         ```json
         // Response Payload
         {
            "userFileName": "neobrim-test-2.jpg",
            "cloudFileName": "01JVY6yVD9TXR67C69E872RAF6.jpg",
            "fileMimeType": "image/jpeg",
            "fileExtension": "jpg",
            "awsS3SignedUrl": "..."
         }
         ```
   3. Use `awsS3SignedUrl` to Upload company logo to `S3`
   4. Call updateCompanyLogo.
      1. Update the `companyLogoCloudFileName` for particular company
         Request URL:
            `https://api.dev.worko.work/company/:id/company-logo`
         Request Method: `PATCH`
         Status Code: `200 OK`
         Request Payload:
         ```json
         {"companyLogoCloudFileName":"01JVY6yVD9TXR67C69E872RAF6.jpg"}
         ```

   # Re-upload Logo Flow
      1. Call generateSignedUrl(companyId) again.
         1. Company Logo Generate pre-signed url
            Request URL `https://api.dev.worko.work/file/gsu2u/COMPANY_LOGO`
            Request Method `POST`
            ```json
            // Request Payload
            {
               "companyLogoFileName": "neobrim-test-2.jpg",
               "companyLogoFileMimeType": "image/jpeg"
            }
            ```
            ```json
            // Response Payload
            {
               "userFileName": "neobrim-test-2.jpg",
               "cloudFileName": "01JVY6yVD9TXR67C69E872RAF6.jpg",
               "fileMimeType": "image/jpeg",
               "fileExtension": "jpg",
               "awsS3SignedUrl": "..."
            }
            ```
      2. Use `awsS3SignedUrl` to Upload company logo to `S3`
      3. Call updateCompanyLogo again.
         1. Update the `companyLogoCloudFileName` for particular company
            Request URL:
               `https://api.dev.worko.work/company/:id/company-logo`
            Request Method: `PATCH`
            Status Code: `200 OK`
            Request Payload:
            ```json
            {"companyLogoCloudFileName":"01JVY6yVD9TXR67C69E872RAF6.jpg"}
            ```

   # Requested company logo upload flow:
      1. Update company details by id
         Request URL `https://api.dev.worko.work/company/:id/`
         Request Method `PUT`
         Status Code `200 OK`
         ```json
         // Request Payload
         {
            // don't pass below attributes in request payload:
              //  1. "logo", 2. "logoUrl"
              
            "name": "Nellsys",
            "website": "", // if provided give, if not give empty string
            "linkedIn": "https://www.linkedin.com/company/nellsys/",
            "carrierPage": "https://nellsys.com/",
            "industry": "Advertising & Marketing",
            "teamSize": 52,
            "aboutCompany": "", // if provided give, if not give empty string
            "isCompanyRequestPageFlag": true
         }
         ```
      2. Company Logo Generate pre-signed url
         Request URL `https://api.dev.worko.work/file/gsu2u/COMPANY_LOGO`
         Request Method `POST`
         ```json
         // Request Payload
         {
            "companyLogoFileName": "neobrim-test-2.jpg",
            "companyLogoFileMimeType": "image/jpeg"
         }
         ```
         ```json
         // Response Payload
         {
            "userFileName": "neobrim-test-2.jpg",
            "cloudFileName": "01JVY6yVD9TXR67C69E872RAF6.jpg",
            "fileMimeType": "image/jpeg",
            "fileExtension": "jpg",
            "awsS3SignedUrl": "..."
         }
         ```
      3. Use `awsS3SignedUrl` to Upload company logo to `S3`
      4. Call updateCompanyLogo again.
         1. Update the `companyLogoCloudFileName` for particular company
            Request URL:
               `https://api.dev.worko.work/company/:id/company-logo`
            Request Method: `PATCH`
            Status Code: `200 OK`
            Request Payload:
            ```json
            {"companyLogoCloudFileName":"01JVY6yVD9TXR67C69E872RAF6.jpg"}
            ```

# Company logo upload feature apis:
   1. Create company api
      Request URL:
         `https://api.dev.worko.work/company/`
      Request Method: `POST`
      Status Code: `200 OK`
      ```json
      // Request Payload:
      {
         "name": "Amazon", // required
         "industry": "string", // required
         "teamSize": 1000, // required
         "carrierPage": "string", // required
         "linkedIn": "string", // required
         "aboutCompany": "string", // optional
         "website": "string", // optional
      }
      ```

   2. Company Logo Generate pre-signed url
      Request URL `https://api.dev.worko.work/file/gsu2u/COMPANY_LOGO`
      Request Method `POST`
      ```json
      // Request Payload:
      {
         "companyLogoFileName": "neobrim-test-2.jpg",
         "companyLogoFileMimeType": "image/jpeg"
      }
      ```
      ```json
      // Response Payload:
      {
         "userFileName": "neobrim-test-2.jpg",
         "cloudFileName": "01JVY6yVD9TXR67C69E872RAF6.jpg",
         "fileMimeType": "image/jpeg",
         "fileExtension": "jpg",
         "awsS3SignedUrl": "..."
      }
      ```

   3. Update the `companyLogoCloudFileName` for particular company
      Request URL:
         `https://api.dev.worko.work/company/:id/company-logo`
      Request Method: `PATCH`
      Status Code: `200 OK`
      ```json
      // Request Payload:
      {"companyLogoCloudFileName":"01JVY6yVD9TXR67C69E872RAF6.jpg"}
      ```

   4. Update company details by id
      Request URL `https://api.dev.worko.work/company/:id/`
      Request Method `PUT`
      Status Code `200 OK`
      ```json
      // Request Payload
      {
         "name": "Nellsys",
         "website": "", // if provided give, if not give empty string
         "linkedIn": "https://www.linkedin.com/company/nellsys/",
         "carrierPage": "https://nellsys.com/",
         "industry": "Advertising & Marketing",
         "teamSize": 52,
         "aboutCompany": "", // if provided give, if not give empty string
         "isCompanyRequestPageFlag": true
      }
      ```

# Company request api flow before `28-05-2025`:
   1. 
      Request URL `https://api.dev.worko.work/company/request`
      Request Method `POST`
      Status Code `201 Created`
      ```json
      // Request Payload:
      {
         "userType": "EMP",
         "companyDetail": {
            "industry": "Industry",
            "linkedIn": "https://www.linkedin.com/company/nellsys/",
            "carrierPage": "https://nellsys.com/",
            "name": "Nellsys"
         },
         "userName": "Rohith",
         "userEmail": "rohithappala777+empcompreq1@gmail.com",
         "userContactNumber": "9666308100",
         "jobUrl": ""
      }
      ```
      ```json
      // Response Payload:
      {
         "PK": "RQST#COMP#",
         "SK": "ID#01JWAQF1GYGQ8DZ1C7X48SM3GR",
         "companyDetail": {
            "industry": "Industry",
            "linkedIn": "https://www.linkedin.com/company/nellsys/",
            "carrierPage": "https://nellsys.com/",
            "name": "Nellsys"
         },
         "userName": "Rohith",
         "userEmail": "rohithappala777+empcompreq1@gmail.com",
         "userType": "EMP",
         "userContactNumber": "9666308100",
         "jobUrl": "",
         "status": "new",
         "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
         "createdAt": 1748411844126,
         "updatedAt": 1748411844126,
         "isDeleted": false
      }
      ```

   2. 
      Request URL `https://api.dev.worko.work/company/01JWAQF1G96E0SE9XHXSFGHNWW/`
      Request Method `PUT`
      Status Code `200 OK`
      ```json
      // Request Payload
      {
         "name": "Nellsys",
         "website": "",
         "linkedIn": "https://www.linkedin.com/company/nellsys/",
         "carrierPage": "https://nellsys.com/",
         "logo": "1.jpg",
         "industry": "Advertising & Marketing",
         "teamSize": 52,
         "aboutCompany": "",
         "logoUrl": "",
         "isCompanyRequestPageFlag": true
      }
      ```
      ```json
      // Response
      {
         "website": "",
         "linkedIn": "https://www.linkedin.com/company/nellsys/",
         "industry": "advertising & marketing",
         "logoUrl": "",
         "createdAt": "2025-05-28T05:57:24.107Z",
         "isDeleted": false,
         "GSI1SK": "ID#01JWAQF1G96E0SE9XHXSFGHNWW",
         "carrierPage": "https://nellsys.com/",
         "logo": "1.jpg",
         "name": "NELLSYS",
         "isVerified": true,
         "teamSize": 52,
         "GSI1PK": "COMP#INDS#advertising & marketing",
         "updatedAt": "2025-05-28T08:47:46.156Z",
         "aboutCompany": "",
         "SK": "ID#01JWAQF1G96E0SE9XHXSFGHNWW",
         "PK": "COMP#",
         "id": "01JWAQF1G96E0SE9XHXSFGHNWW"
      }
      ```

   3. 
      Request URL `https://api.dev.worko.work/company/01JWB2X4BTJ7FAP9F8QDGEJW0K/request`
      Request Method `DELETE`
      Status Code `204 No Content`
