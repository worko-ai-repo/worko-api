// Load npm packages
import { Request, Response, NextFunction } from "express";

// Import config
import APP_CONSTANTS from "../configs/constants.config";
import { awsS3ClientLibrary } from "../configs/aws-sdk.config";

// Import DTOs
import { PreSignedUrlToUploadFileResponseDto } from "../dtos/File.dto";

// Import enums
import { FileResourceKey } from "../enums/File.enum";

// Import services
import UlidService from "../services/Ulid.service";

// Import Schemas
import { FileGeneratePsuToUploadUserResumeDTOValidation } from "../schemas/File.schema";

// Import utilities
import { BaseError, RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * FileController
 *
 * Class to perform activities related to File like,
 * - Generating AWS Signed to allow upload file.
 * - Generating AWS Signed to view the file.
 * - etc
 */
class FileController {
  /**
   * constructor
   * 
   * Class constructor
   */
  constructor() {

  }

  /**
   * generatePreSignedUrlsToUpload
   * 
   * Generate the Pre-signed URL(s) to upload file(s) to cloud for any entity (user resume, user profile pic, company logo, etc).
   * The frontend will upload file(s) to the cloud using the provided pre-signed urls.
   * 
   * @param req Request
   * @param res Response
   * @param next NextFunction
   * @returns {Promise<any>}
   */
  generatePreSignedUrlsToUpload = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      // Get the resource key to route the action/operation to respective methods
      const resourceKey = req.params["resourceKey"];

      // Frontend wants to generate the pre-signed url to upload the user's resume
      if (resourceKey == FileResourceKey.USER_RESUME) {
        return this.generatePsuToUploadUserResume(req, res, next);
      }

      // As resource keys are not matched above, let frontend know about the same.
      throw new BaseError("The provide 'resourceKey' is invalid. Please provide a valid 'resourceKey'.", HttpStatusCode.BAD_REQUEST_400);
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * generatePsuToUploadUserResume
   * 
   * Generate the Pre-signed URL to upload user's resume.
   * The frontend will upload the user's resume to the cloud using the provided pre-signed url.
   * 
   * Note: Here the file mime type and extension of the file is expected in the request to provide flexibility.
   * 
   * @param req Request
   * @param res Response
   * @param next NextFunction
   * @returns {Promise<any>}
   */
  private generatePsuToUploadUserResume = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      // Get the request body
      let requestBodyObject = req.body;

      // Validate the request data
      const { error } = FileGeneratePsuToUploadUserResumeDTOValidation.validate(
        requestBodyObject,
        {
          abortEarly: false,
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      }

      // Get the base path where the user's resume file would be uploaded
      const masterCsvUploadPath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_RESUME.strtr({
        "{userId}": requestBodyObject.userId.toString(),
      });

      // Get the user's resume file extension
      const resumeUserFileExtension = requestBodyObject.resumeUserFileName.split(".").pop() as string; // It is expected in request payload to provide flexibility

      // Prepare the user's resume file name
      const resumeCloudFileName = UlidService.getUlidId() + "." + resumeUserFileExtension;

      // Generate the AWS S3 Signed Url
      const masterCsvSignedUrl = await awsS3ClientLibrary
        .getSignedUrlForUploadingObject(
          process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
          masterCsvUploadPath + "/" + resumeCloudFileName,
          APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS,
          {
            ContentType: requestBodyObject.resumeFileMimeType, // It is expected in request payload to provide flexibility
          }
        );

      // Prepare the response object
      const resObject: PreSignedUrlToUploadFileResponseDto = {
        userFileName: requestBodyObject.resumeUserFileName,
        cloudFileName: resumeCloudFileName,
        fileMimeType: requestBodyObject.resumeFileMimeType,
        fileExtension: resumeUserFileExtension,
        awsS3SignedUrl: masterCsvSignedUrl,
      }

      // Return the response
      return res.status(HttpStatusCode.OK_200).json(resObject);
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  }
}

export default FileController;