/**
 * PreSignedUrlToUploadFileResponseDto
 * 
 * This interface is just to define the representation for the response DTO 
 * for the API that returns the pre signed url to upload files.
 */
export interface PreSignedUrlToUploadFileResponseDto {
    /**
     * userFileName
     * 
     * Sample file name: "TestResume.pdf"
     */
    userFileName?: string | null;

    /**
     * fileExtension
     * 
     * Sample file extension: "pdf"
     */
    fileExtension: string;

    /**
     * fileMimeType
     * 
     * Sample file mime type: "application/pdf"
     */
    fileMimeType: string;

    /**
     * cloudFileName
     * 
     * Sample cloud file name: "01JGB2ABC12A9EFNBQ1H9430ER.pdf"
     */
    cloudFileName: string;

    /**
     * awsS3SignedUrl
     * 
     * Sample aws s3 signed url: "https://worko-app-dev.s3.ap-south-1.amazonaws.com/
     *  users/e1a30d8a-6011-709d-b130-494c61b7f9a1/resumes/01JGB2ABC12A9EFNBQ1H9430ER.pdf?Content-Type=....."
     */
    awsS3SignedUrl: string;
};

/**
 * CompanyJobDescriptionPreSignedUrlToUploadFileRequestApiDto
 * 
 * This interface is just to define the representation for the request DTO from Frontend
 * to generate the pre-signed url for company job description
 */
export interface CompanyJobDescriptionPreSignedUrlToUploadFileRequestApiDto {
    /**
     * companyId
     * 
     * `companyId` is the ID of the company for the posted job description
     *  by the user(As of now only company admin, corporate recruiter, worko admin) 
     */
    companyId: string;

    /**
     * companyJobDescriptionFileName
     * 
     * Sample file name: "TestCompanyJobDescription.pdf" 
     */
    companyJobDescriptionFileName: string;
    
    /**
     * companyJobDescriptionFileMimeType
     * 
     * Sample file mime type: "application/pdf"
     */
    companyJobDescriptionFileMimeType: string; 
};

/**
 * CorporateBulkJdResumePreSignedUrlToUploadDto
 */
export interface CorporateBulkJdResumePreSignedUrlToUploadDto {
    /**
     * fileName
     * 
     * Sample file name: "TestCV.pdf"
     */
    fileName: string;

    /**
     * fileMimeType
     * 
     * Sample file mime type: "application/pdf"
     */
    fileMimeType: string
}

/**
 * BulkCvsPreSignedUrlToUploadFileDto
 * 
 * This interface is just to define the representation for the request DTO from Frontend
 * to generate the pre-signed urls for bulk cvs
 */
export interface BulkCvsPreSignedUrlToUploadFileDto {
  /**
   * companyId
   *
   * `companyId` is the ID of the company
   */
  companyId: string;

  /**
   * corporateBulkJdId
   * 
   * `corporateBulkJdId` is the ID of the corporate bulk job description (The `id` attribute of `CorporateBulkJd` Model)
   */
  corporateBulkJdId: string;

  /**
   * bulkCvs
   */
  bulkCvs: Array<CorporateBulkJdResumePreSignedUrlToUploadDto>;
};

/**
 * BulkCvPreSignedUrlToViewApiDto
 * 
 * This interface is used to view the cv which was uploaded by corporate-recruiter/admin or worko-admin
 */
export interface BulkCvPreSignedUrlToViewApiDto {
  corporateBulkJdId: string;
}

/**
 * CompanyLogoPreSignedUrlToUploadFileRequestApiDto
 *
 * This interface is just to define the representation for the request DTO from Frontend
 * to generate the pre-signed url for company logo
 */
export interface CompanyLogoPreSignedUrlToUploadFileRequestApiDto {
  /**
   * companyLogoFileName
   *
   * Sample file names:
   *  1. "Worko.jpg"
   *  2. "Amazon.png"
   */
  companyLogoFileName: string;

  /**
   * companyLogoFileMimeType
   *
   * Sample file mime type: "image/jpeg"
   */
  companyLogoFileMimeType: string;
};