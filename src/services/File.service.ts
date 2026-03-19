// Import configs
import APP_CONSTANTS from "../configs/constants.config";
import { awsS3ClientLibrary } from "../configs/aws-sdk.config";

// Import DTOs
import {
  BulkCvsPreSignedUrlToUploadFileDto,
  BulkCvsPsuToUploadApiDto,
  CorporateBulkJdResumePreSignedUrlToUploadDto,
  PreSignedUrlToUploadFileResponseDto,
} from "../dtos/File.dto";

// Import services
import UlidService from "../services/Ulid.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * FileService
 * 
 * Service for handling file related operations
 */
class FileService {
  /**
   * GeneratePreSignedUrlToUploadBulkCvs
   * 
   * Generates pre-signed URLs to upload bulk CVs to AWS S3.
   *
   * This method takes a DTO containing the details required to upload bulk CVs
   * and generates pre-signed URLs for each file. These URLs allow the frontend
   * to upload files directly to the specified S3 bucket.
   *
   * @param {BulkCvsPreSignedUrlToUploadFileDto} psuToUploadBulkCvsParams - An object
   * containing the companyId, corporateBulkJdId, and an array of file details
   * (fileName and fileMimeType) for which pre-signed URLs are to be generated.
   * @returns {Promise<PreSignedUrlToUploadFileResponseDto[]>} - A promise that resolves
   * to an array of response DTOs, each containing the original file name, cloud file name,
   * file mime type, file extension, and the generated pre-signed URL.
   */
  async generatePsuToUploadBulkCvs(
    psuToUploadBulkCvsParams: BulkCvsPreSignedUrlToUploadFileDto
  ): Promise<PreSignedUrlToUploadFileResponseDto[]> {
    global.logger.info(`Generate the Pre-signed URL to upload bulk cvs`, {
      filePath: __filename,
      methodName: this.generatePsuToUploadBulkCvs.name,
      companyId: psuToUploadBulkCvsParams.companyId,
      corporateBulkJdId: psuToUploadBulkCvsParams.corporateBulkJdId,
    });

    // Get the base path where the company job description file would be uploaded
    const fileUploadPath: string =
      APP_CONSTANTS.AWS_S3_DIR_PATHS.BULK_CVS.strtr({
        "{companyId}": psuToUploadBulkCvsParams.companyId.toString(),
        "{corporateBulkJdId}":
          psuToUploadBulkCvsParams.corporateBulkJdId.toString(),
      });

    // Generate the Pre-signed URLs to upload the bulk cvs and return
    return Promise.all(
      psuToUploadBulkCvsParams.bulkCvs.map(
        async (eachFileDetail: CorporateBulkJdResumePreSignedUrlToUploadDto) => {
          // Get the given file extension
          const fileExtension: string = eachFileDetail.fileName
            .split(".")
            .pop() as string; // Sample Output: "pdf"

          // Prepare the given file name
          const cloudFileName: string = `${UlidService.getUlidId()}.${fileExtension}`;

          // Generate the AWS S3 Signed Url
          const fileSignedUrl: string =
            await awsS3ClientLibrary.getSignedUrlForUploadingObject(
              process.env.APP_AWS_S3_BUCKET_WORKO_CORPORATE as string,
              fileUploadPath + "/" + cloudFileName,
              APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS,
              {
                ContentType: eachFileDetail.fileMimeType,
              }
            );

          // Prepare the response object
          const resObject: PreSignedUrlToUploadFileResponseDto = {
            userFileName: eachFileDetail.fileName,
            cloudFileName: cloudFileName,
            fileMimeType: eachFileDetail.fileMimeType,
            fileExtension: fileExtension,
            awsS3SignedUrl: fileSignedUrl,
          };

          return resObject;
        }
      )
    );
  }

  async generatePsuToUploadSingleBulkCv(requestBodyObject: BulkCvsPsuToUploadApiDto, skipParsing: boolean = false): Promise<PreSignedUrlToUploadFileResponseDto> {
    const { companyId, corporateBulkJdId, fileMimeType, fileName } = requestBodyObject;

    // await validatePsuToUploadBulkCvs(companyId, corporateBulkJdId);

    const fileUploadPath: string =
      APP_CONSTANTS.AWS_S3_DIR_PATHS.BULK_CVS.strtr({
        "{companyId}": companyId,
        "{corporateBulkJdId}": corporateBulkJdId,
      });

    const fileExtension: string = fileName.split(".").pop() as string;

    const cloudFileName: string = `${UlidService.getUlidId()}.${fileExtension}`;

    const bucketName: string | undefined =
      process.env.APP_AWS_S3_BUCKET_WORKO_CORPORATE;
    if (!bucketName) {
      global.logger.error(`AWS S3 bucket name not found. [File Service]`, {
        bucketName,
        methodName: this.generatePsuToUploadBulkCvs.name,
      });

      throw new BaseError(
        `AWS S3 bucket name not found.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const fileSignedUrl: string =
      await awsS3ClientLibrary.getSignedUrlForUploadingObject(
        bucketName,
        `${fileUploadPath}/${cloudFileName}`,
        APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS,
        {
          ContentType: fileMimeType,
          Metadata: {
            skipParsing: skipParsing ? "true" : "false",
          }
        }
      );

    return {
      userFileName: fileName,
      cloudFileName: cloudFileName,
      fileMimeType: fileMimeType,
      fileExtension: fileExtension,
      awsS3SignedUrl: fileSignedUrl,
    };
  }
}

// Create an instance of the class
const fileServiceObj = new FileService();

// Export the class
export { FileService, fileServiceObj };
