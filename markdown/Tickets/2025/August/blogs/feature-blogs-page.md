
# Prod checklist
1. `worko-auth` copy-paste and deploy
2. s3 bucket config:
    1. Create `blog-images` folder in `worko-ui-comp-logo-dev` bucket
    2. upload images in below path manually:-
        1. Amazon S3 > Buckets  > `worko-ui-comp-logo-dev/blog-images/{ulidId}.{fileExtension}`
3. add route in cloudFront for below:
    1. Amazon S3 > Buckets  > `worko-ui-comp-logo-dev/blog-images/{ulidId}.{fileExtension}`
4. In `worko-ui-comp-logo-dev` aws s3 bucket, update `Cross-origin resource sharing (CORS)`
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