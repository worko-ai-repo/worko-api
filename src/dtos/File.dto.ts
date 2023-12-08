/**
 * PreSignedUrlToUploadFileResponseDto
 * 
 * This class is just to define the representation for the response DTO 
 * for the API that returns the pre signed url to upload files.
 */
export interface PreSignedUrlToUploadFileResponseDto {
    userFileName?: string | null;
    fileExtension: string;
    fileMimeType: string;
    cloudFileName: string;
    awsS3SignedUrl: string;
}