
# Apis
1. Create blog
   [POST] `https://api.dev.worko.work/blog/`
   ```json
   // Request body
   {
    "title": "Unit morning ground face paper culture",
    "basicDescription": "Board authority successful race myself professor see image plant especially task team.",
    "detailedDescription": "Picture daughter by event customer interview general store. Black raise ever court among thing require summer. Officer area threat sing. Finally suddenly yet still class. Want career station fact production. Relationship actually total word shoulder through customer.\n\nWall alone staff produce entire. Main despite expect kitchen result. Artist speak race instead step. Mouth stop movie sport here pull public. Idea goal throughout own turn during serious. Authority early mind night whether whether.\n\nArrive choice address activity. Soldier however own this carry. Order amount owner along politics. Maintain wrong move spring nearly family.\n\nFast short million reflect expert. Soon wind report us your would they. Machine article travel moment one at. Television money born. Show stage thank new program strong.",
    "htmlDetailedDescription": "<html>\n <body>\n  <p>\n   Picture daughter by event customer interview general store. Black raise ever court among thing require summer. Officer area threat sing. Finally suddenly yet still class. Want career station fact production. Relationship actually total word shoulder through customer.\n  </p>\n  <p>\n   Wall alone staff produce entire. Main despite expect kitchen result. Artist speak race instead step. Mouth stop movie sport here pull public. Idea goal throughout own turn during serious. Authority early mind night whether whether.\n  </p>\n  <p>\n   Arrive choice address activity. Soldier however own this carry. Order amount owner along politics. Maintain wrong move spring nearly family.\n  </p>\n  <p>\n   Fast short million reflect expert. Soon wind report us your would they. Machine article travel moment one at. Television money born. Show stage thank new program strong.\n  </p>\n </body>\n</html>",
    "status": "PUBLISHED",
    "tags": ["example", "blog", "random", "data"]
   }
   ```
   ```json
   // Response body
   {
      "createdByUserId": "REDACTED",
      "updatedAt": "2025-05-30T14:12:40.230Z",
      "status": "PUBLISHED",
      "createdAt": "2025-05-30T14:12:40.230Z",
      "SK": "ID#01JWGRKB54AGVFZWWB04ABAVFC",
      "basicDescription": "Board authority successful race myself professor see image plant especially task team.",
      "htmlDetailedDescription": "<html>\n <body>\n  <p>\n   Picture daughter by event customer interview general store. Black raise ever court among thing require summer. Officer area threat sing. Finally suddenly yet still class. Want career station fact production. Relationship actually total word shoulder through customer.\n  </p>\n  <p>\n   Wall alone staff produce entire. Main despite expect kitchen result. Artist speak race instead step. Mouth stop movie sport here pull public. Idea goal throughout own turn during serious. Authority early mind night whether whether.\n  </p>\n  <p>\n   Arrive choice address activity. Soldier however own this carry. Order amount owner along politics. Maintain wrong move spring nearly family.\n  </p>\n  <p>\n   Fast short million reflect expert. Soon wind report us your would they. Machine article travel moment one at. Television money born. Show stage thank new program strong.\n  </p>\n </body>\n</html>",
      "detailedDescription": "Picture daughter by event customer interview general store. Black raise ever court among thing require summer. Officer area threat sing. Finally suddenly yet still class. Want career station fact production. Relationship actually total word shoulder through customer.\n\nWall alone staff produce entire. Main despite expect kitchen result. Artist speak race instead step. Mouth stop movie sport here pull public. Idea goal throughout own turn during serious. Authority early mind night whether whether.\n\nArrive choice address activity. Soldier however own this carry. Order amount owner along politics. Maintain wrong move spring nearly family.\n\nFast short million reflect expert. Soon wind report us your would they. Machine article travel moment one at. Television money born. Show stage thank new program strong.",
      "PK": "BLOG#",
      "id": "01JWGRKB54AGVFZWWB04ABAVFC",
      "tags": [
         "example",
         "blog",
         "random",
         "data"
      ],
      "title": "unit morning ground face paper culture"
   }
   ```


2. Generate Presignedurl To Upload Blog Cover Image
   [POST] `https://api.dev.worko.work/file/gsu2u/BLOG_COVER_IMAGE`
   ```json
   // Request Body
   {
    "blogCoverImageFileName": "blog1.jpg",
    "blogCoverImageFileMimeType": "image/jpeg"
   }
   ```
   ```json
   // Response Body
   {
    "userFileName": "blog1.jpg",
    "cloudFileName": "01JWJAD97GY4QC9F9HSX2FRSS4.jpg",
    "fileMimeType": "image/jpeg",
    "fileExtension": "jpg",
    "awsS3SignedUrl": "https://worko-ui-blog-dev.s3.ap-south-1.amazonaws.com/blog-cover-images/01JWJAD97GY4QC9F9HSX2FRSS4.jpg?Content-Type=image%2Fjpeg&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=REDACTED%2F20250531%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250531T044310Z&X-Amz-Expires=900&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEO3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCmFwLXNvdXRoLTEiSDBGAiEApj2t70N%2BFEgQuHN2QrI8%2Fd%2BVJdXfVYUjkMk0KnsH308CIQDSTUbz9Ga%2FWrV5TFO7PLYDAtHzwUVAq3E5VdMHXSGpQCqAAwi2%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDIxMTEyNTM1Mzg5OSIMLXofvb1Tg9z7EQbvKtQCg4mdxxrrZJMqYhf0CIFpDWjc%2BKQ8FE00YkTQ83S6IvTIJCa2bvX8CeQjSutCECUSDV6SQ5Cp4oBKHU%2BLD2gnmanE%2FRHZpaGLycgIQVnU3jfgwrEDKqDuGpCrVTfTJG72JLxge7iEVx8pDEBFbUX1Ww76fwpbY4OljZzaKKHReG4LUAz4GOkknNQmMZzsMP7YUXHjK%2BdXQwa0GPJajhNNjbF%2FQDIW3NL%2B7c23DtkaJw97HjhZ0dWvgw4DdR4Or5dr3cucKlEJR7f50SuNypFjpZZl3ZR21idAp4LN7PVFshCc9UykMdZ%2BAn%2BcqWv2Mfi3SHvjhbT9JLiLyUEZPU%2F%2FNetBbBRocpNejbbInUUjEybrr27Xphwo3aCfHy%2FzkID4ROR20sx99yIJgUaFEmGD2HCofTl0Ll5j7%2B5bPDgyQ0r36xISK9K9mkQec01PXVvhopJMkzDckerBBjqdAZ11wUJYytFibKu%2B2vVruUTtfHvMuj5T%2Bfy2Ur0u%2FpHsAF1AQTRxiEciFMPjAYSUkZzHLimPlgzJa9fWIWgGHbYDxUG2H5ty%2BS3hKHnWthwllpLOTmNoHolGk0Bp1unrpk%2FXjs7wNU6WOWHDynTCd67BocUcR503MjH%2BYaQ%2B4RCYsctHTbGjh%2BdtqpLTMYUakUDa%2B%2B965wnhxyw019Q%3D&X-Amz-Signature=09dda278f01857802e325e692e85da98ece7363526822ba1a8d0a6ad3ee426cd&X-Amz-SignedHeaders=host"
   }
   ```


3. Update Blog Cover Image cloud name
   [PATCH] `https://api.dev.worko.work/blog/:id`
   ```json
   // Request payload
   {
      "cloudBlogCoverImageName": "01JWJAD97GY4QC9F9HSX2FRSS4.jpg"
   }
   ```
   ```json
   // Response payload
   {
      // ...
      "cloudBlogCoverImageName": "01JWJAD97GY4QC9F9HSX2FRSS4.jpg"
      // ...
   }
   ```


4. Get blog by filter options
   [GET] `/blog/`
   ```ts
   // Request Query Parameters
   status: "PUBLISHED", // required filter
   title: "blog", // optional search filter
   ```
   ```json
   // Response
   {
      "data": [
         {
            "createdByUserId": "REDACTED",
            "updatedAt": "2025-05-30T14:12:40.230Z",
            "status": "PUBLISHED",
            "createdAt": "2025-05-30T14:12:40.230Z",
            "SK": "ID#01JWGRKB54AGVFZWWB04ABAVFC",
            "basicDescription": "Board authority successful race myself professor see image plant especially task team.",
            "htmlDetailedDescription": "<html>\n <body>\n  <p>\n   Picture daughter by event customer interview general store. Black raise ever court among thing require summer. Officer area threat sing. Finally suddenly yet still class. Want career station fact production. Relationship actually total word shoulder through customer.\n  </p>\n  <p>\n   Wall alone staff produce entire. Main despite expect kitchen result. Artist speak race instead step. Mouth stop movie sport here pull public. Idea goal throughout own turn during serious. Authority early mind night whether whether.\n  </p>\n  <p>\n   Arrive choice address activity. Soldier however own this carry. Order amount owner along politics. Maintain wrong move spring nearly family.\n  </p>\n  <p>\n   Fast short million reflect expert. Soon wind report us your would they. Machine article travel moment one at. Television money born. Show stage thank new program strong.\n  </p>\n </body>\n</html>",
            "detailedDescription": "Picture daughter by event customer interview general store. Black raise ever court among thing require summer. Officer area threat sing. Finally suddenly yet still class. Want career station fact production. Relationship actually total word shoulder through customer.\n\nWall alone staff produce entire. Main despite expect kitchen result. Artist speak race instead step. Mouth stop movie sport here pull public. Idea goal throughout own turn during serious. Authority early mind night whether whether.\n\nArrive choice address activity. Soldier however own this carry. Order amount owner along politics. Maintain wrong move spring nearly family.\n\nFast short million reflect expert. Soon wind report us your would they. Machine article travel moment one at. Television money born. Show stage thank new program strong.",
            "PK": "BLOG#",
            "id": "01JWGRKB54AGVFZWWB04ABAVFC",
            "tags": [
               "example",
               "blog",
               "random",
               "data"
            ],
            "title": "unit morning ground face paper culture"
         }
      ],
      "pagination": {
         "count": 1,
         "pageSize": 25,
         "sortOrder": "descending",
         "timesQueried": 1,
         "queriedCount": 0
      }
   }
   ```


5. Get blog by id
   [GET] `/blog/:id`
   ```json
   // Response body
   {
      "createdByUserId": "REDACTED",
      "updatedAt": "2025-05-30T14:12:40.230Z",
      "status": "PUBLISHED",
      "createdAt": "2025-05-30T14:12:40.230Z",
      "SK": "ID#01JWGRKB54AGVFZWWB04ABAVFC",
      "basicDescription": "Board authority successful race myself professor see image plant especially task team.",
      "htmlDetailedDescription": "<html>\n <body>\n  <p>\n   Picture daughter by event customer interview general store. Black raise ever court among thing require summer. Officer area threat sing. Finally suddenly yet still class. Want career station fact production. Relationship actually total word shoulder through customer.\n  </p>\n  <p>\n   Wall alone staff produce entire. Main despite expect kitchen result. Artist speak race instead step. Mouth stop movie sport here pull public. Idea goal throughout own turn during serious. Authority early mind night whether whether.\n  </p>\n  <p>\n   Arrive choice address activity. Soldier however own this carry. Order amount owner along politics. Maintain wrong move spring nearly family.\n  </p>\n  <p>\n   Fast short million reflect expert. Soon wind report us your would they. Machine article travel moment one at. Television money born. Show stage thank new program strong.\n  </p>\n </body>\n</html>",
      "detailedDescription": "Picture daughter by event customer interview general store. Black raise ever court among thing require summer. Officer area threat sing. Finally suddenly yet still class. Want career station fact production. Relationship actually total word shoulder through customer.\n\nWall alone staff produce entire. Main despite expect kitchen result. Artist speak race instead step. Mouth stop movie sport here pull public. Idea goal throughout own turn during serious. Authority early mind night whether whether.\n\nArrive choice address activity. Soldier however own this carry. Order amount owner along politics. Maintain wrong move spring nearly family.\n\nFast short million reflect expert. Soon wind report us your would they. Machine article travel moment one at. Television money born. Show stage thank new program strong.",
      "PK": "BLOG#",
      "id": "01JWGRKB54AGVFZWWB04ABAVFC",
      "tags": [
         "example",
         "blog",
         "random",
         "data"
      ],
      "title": "unit morning ground face paper culture"
   }
   ```
