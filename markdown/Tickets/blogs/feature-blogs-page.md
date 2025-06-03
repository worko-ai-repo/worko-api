
# Prod checklist
1. `worko-auth` copy-paste and deploy
2. create `APP_AWS_S3_BUCKET_WORKO_UI_BLOG` s3 bucket
3. s3 permission configuration on `prod`
```json
// on production
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
            "https://worko.ai"
        ],
        "ExposeHeaders": []
    }
]
```


# Test cases
1. Test authorization for `create`, `get`, `update` apis
   ```ts
   // Blog routers
   { path: "/blog/", method: HttpMethodsConstants.POST }, // only admin can use 
   { path: "/blog*", method: HttpMethodsConstants.GET }, // whitelisted api
   { path: "/blog/:id", method: HttpMethodsConstants.PATCH }, // only admin can use 

   // File routers
   { path: "/file/gsu2u/COMPANY_LOGO", method: HttpMethodsConstants.POST }, // only admin can use 
   { path: "/file/gsu2u/BLOG_COVER_IMAGE", method: HttpMethodsConstants.POST }, // only admin can use 
   ```
2. test api joi validation
3. test creating duplicate data
4. test with wrong blog ids