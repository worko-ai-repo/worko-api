
```ts
/**
 * SAMPLE EXAMPLE FLOW FOR FILE UPLOADING TO AWS S3 BUCKET FOR RESUME 
 */
```
1. Generate url from the uploaded file [BACKEND_NODE_JS_API]
Request URL: `https://api.dev.worko.work/file/gsu2u/USER_RESUME`
Request Method: `POST`
Status Code: `200 OK`
Request Payload: 
```json
{
   "userId":"e1a30d8a-6011-709d-b130-494c61b7f9a1",
   "resumeUserFileName":"TestResume.pdf",
   "resumeFileMimeType":"application/pdf"
}
```
Response:
```json
{
    "userFileName": "TestResume.pdf",
    "cloudFileName": "01JGB2ABC12A9EFNBQ1H9430ER.pdf",
    "fileMimeType": "application/pdf",
    "fileExtension": "pdf",
    "awsS3SignedUrl": "https://worko-app-dev.s3.ap-south-1.amazonaws.com/users/e1a30d8a-6011-709d-b130-494c61b7f9a1/resumes/01JGB2ABC12A9EFNBQ1H9430ER.pdf?Content-Type=application%2Fpdf&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=REDACTED%2F20241230%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20241230T055842Z&X-Amz-Expires=900&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCmFwLXNvdXRoLTEiRjBEAiBSqj0gUhySpZwut%2Bv4yvzazVcxX1dsCOBUsWenAYPtpgIgHNVtZnKBLiT9nt0p0YouaqTdgOd6jGF0lfIP6G5LPd4qgAMIh%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwyMTExMjUzNTM4OTkiDMfBvkJiH316qTS%2BcirUAlujFbDSfeDRJ6fC9XVdPabgAP1B8n56YktswwNog6p5TDrXTqKsqZGFyYnFUNwpIMCDRQ1fC68ErL74uYucOyFGltz2uF0H6mpml%2FfrdxuUBJeIJ7ChntikojtmLI9QJqBSLRqEDBQI7AE7be%2FTCgALn8%2BRDmTrucS0ZxxeejKbo0dScSSdnmc4z0oc8sRa7HlaapG%2FeDXf6rKf3Nxh4WBRodTox9q2kqQbYrBn7vzndkR1EE1jS0fqrtP%2Foo7%2FVAtRcTvMnm9k1R3aVDliNkCiDZ%2FcUqTr9VKP3WIc%2B2MJQgOw4aPNdTyyoIEXB6UdT68YddbtrKYUXevA2byjZZJFMyfylFxzH7RnLB215sTV6i9fy4bOkpMH1vH%2B5HxaihM46hU1WOkCW7u4J0rHb4vJgrYG6f7IUoPBhOx2vxu8qRuZWISLCUW9RjgOSMuGCDfaUpgwke3IuwY6nwG3Odi7w%2FTCJ3zkGRBGC8X%2BkWUj36WEn3TWtXtYV8aoEgnsheKvjY2JMgPptQFbSchHKrqeXYAUqe6MejgnJBF6dU3Zn673uA72muhRRmCplLTKzKzgLLv0aZlEBDRoVfGtEa%2BYsATNxVIkOtpgMO3RHIcgRRKgOXetCFi5eatSwvVAT1hl2VaTHzhjMamH5RK8hONpKWZvfKIA4x0l5As%3D&X-Amz-Signature=2f7a2b78ecb0daa6408910582b102db8558463deb1589deb6c92f78b58aa4d6b&X-Amz-SignedHeaders=host"
}
```

2. Upload the Generated URL in the aws s3 bucket [AWS_API]
Request URL: `https://worko-app-dev.s3.ap-south-1.amazonaws.com/users/e1a30d8a-6011-709d-b130-494c61b7f9a1/resumes/01JGB2ABC12A9EFNBQ1H9430ER.pdf?Content-Type=application%2Fpdf&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=REDACTED%2F20241230%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20241230T055842Z&X-Amz-Expires=900&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCmFwLXNvdXRoLTEiRjBEAiBSqj0gUhySpZwut%2Bv4yvzazVcxX1dsCOBUsWenAYPtpgIgHNVtZnKBLiT9nt0p0YouaqTdgOd6jGF0lfIP6G5LPd4qgAMIh%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwyMTExMjUzNTM4OTkiDMfBvkJiH316qTS%2BcirUAlujFbDSfeDRJ6fC9XVdPabgAP1B8n56YktswwNog6p5TDrXTqKsqZGFyYnFUNwpIMCDRQ1fC68ErL74uYucOyFGltz2uF0H6mpml%2FfrdxuUBJeIJ7ChntikojtmLI9QJqBSLRqEDBQI7AE7be%2FTCgALn8%2BRDmTrucS0ZxxeejKbo0dScSSdnmc4z0oc8sRa7HlaapG%2FeDXf6rKf3Nxh4WBRodTox9q2kqQbYrBn7vzndkR1EE1jS0fqrtP%2Foo7%2FVAtRcTvMnm9k1R3aVDliNkCiDZ%2FcUqTr9VKP3WIc%2B2MJQgOw4aPNdTyyoIEXB6UdT68YddbtrKYUXevA2byjZZJFMyfylFxzH7RnLB215sTV6i9fy4bOkpMH1vH%2B5HxaihM46hU1WOkCW7u4J0rHb4vJgrYG6f7IUoPBhOx2vxu8qRuZWISLCUW9RjgOSMuGCDfaUpgwke3IuwY6nwG3Odi7w%2FTCJ3zkGRBGC8X%2BkWUj36WEn3TWtXtYV8aoEgnsheKvjY2JMgPptQFbSchHKrqeXYAUqe6MejgnJBF6dU3Zn673uA72muhRRmCplLTKzKzgLLv0aZlEBDRoVfGtEa%2BYsATNxVIkOtpgMO3RHIcgRRKgOXetCFi5eatSwvVAT1hl2VaTHzhjMamH5RK8hONpKWZvfKIA4x0l5As%3D&X-Amz-Signature=2f7a2b78ecb0daa6408910582b102db8558463deb1589deb6c92f78b58aa4d6b&X-Amz-SignedHeaders=host`
Request Method: `PUT`
Status Code: `200 OK`
Query String Parameters:
```sh
Content-Type: application%2Fpdf
X-Amz-Algorithm: AWS4-HMAC-SHA256
X-Amz-Credential: REDACTED%2F20241230%2Fap-south-1%2Fs3%2Faws4_request
X-Amz-Date: 20241230T055842Z
X-Amz-Expires: 900
X-Amz-Security-Token: IQoJb3JpZ2luX2VjEK7%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCmFwLXNvdXRoLTEiRjBEAiBSqj0gUhySpZwut%2Bv4yvzazVcxX1dsCOBUsWenAYPtpgIgHNVtZnKBLiT9nt0p0YouaqTdgOd6jGF0lfIP6G5LPd4qgAMIh%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwyMTExMjUzNTM4OTkiDMfBvkJiH316qTS%2BcirUAlujFbDSfeDRJ6fC9XVdPabgAP1B8n56YktswwNog6p5TDrXTqKsqZGFyYnFUNwpIMCDRQ1fC68ErL74uYucOyFGltz2uF0H6mpml%2FfrdxuUBJeIJ7ChntikojtmLI9QJqBSLRqEDBQI7AE7be%2FTCgALn8%2BRDmTrucS0ZxxeejKbo0dScSSdnmc4z0oc8sRa7HlaapG%2FeDXf6rKf3Nxh4WBRodTox9q2kqQbYrBn7vzndkR1EE1jS0fqrtP%2Foo7%2FVAtRcTvMnm9k1R3aVDliNkCiDZ%2FcUqTr9VKP3WIc%2B2MJQgOw4aPNdTyyoIEXB6UdT68YddbtrKYUXevA2byjZZJFMyfylFxzH7RnLB215sTV6i9fy4bOkpMH1vH%2B5HxaihM46hU1WOkCW7u4J0rHb4vJgrYG6f7IUoPBhOx2vxu8qRuZWISLCUW9RjgOSMuGCDfaUpgwke3IuwY6nwG3Odi7w%2FTCJ3zkGRBGC8X%2BkWUj36WEn3TWtXtYV8aoEgnsheKvjY2JMgPptQFbSchHKrqeXYAUqe6MejgnJBF6dU3Zn673uA72muhRRmCplLTKzKzgLLv0aZlEBDRoVfGtEa%2BYsATNxVIkOtpgMO3RHIcgRRKgOXetCFi5eatSwvVAT1hl2VaTHzhjMamH5RK8hONpKWZvfKIA4x0l5As%3D
X-Amz-Signature: 2f7a2b78ecb0daa6408910582b102db8558463deb1589deb6c92f78b58aa4d6b
X-Amz-SignedHeaders: host
```