// Load npm packages
import { Request, Response, NextFunction } from "express";

// Import config
import APP_CONSTANTS from "../configs/constants.config";
import { awsS3ClientLibrary } from "../configs/aws-sdk.config";

// Import DTOs
import {
  BlogCoverImagePreSignedUrlToUploadFileRequestApiDto,
  BulkCvPreSignedUrlToViewApiDto,
  BulkCvsPsuToUploadApiDto,
  CompanyJobDescriptionPreSignedUrlToUploadFileRequestApiDto,
  CompanyLogoPreSignedUrlToUploadFileRequestApiDto,
  InterviewRecordingPreSignedUrlToUploadFileRequestApiDto,
  InterviewRecordingPreSignedUrlToViewApiDto,
  PreSignedUrlToUploadFileResponseDto,
} from "../dtos/File.dto";

// Import enums
import { FileResourceKey } from "../enums/File.enum";

// Import services
import UlidService from "../services/Ulid.service";
import { fileServiceObj } from "../services/File.service";

// Import Schemas
import {
  FileGeneratePsuToUploadBlogCoverImageDTOValidation,
  FileGeneratePsuToUploadCareerResumeDTOValidation,
  FileGeneratePsuToUploadCompanyJobDescriptionDTOValidation,
  FileGeneratePsuToUploadCompanyLogoDTOValidation,
  FileGeneratePsuToUploadUserProfilePicDTOValidation,
  FileGeneratePsuToUploadUserResumeDTOValidation,
  FileGeneratePsuToViewBulkJdResumeDTOValidation,
  FileGeneratePsuToUploadInterviewRecordingDTOValidation,
  FileGeneratePsuToViewInterviewRecordingDTOValidation,
  bulkCvsPsuToUploadApiDtoValidation,
} from "../schemas/File.schema";

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
  constructor() {}

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
  generatePreSignedUrlsToUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      // Get the resource key to route the action/operation to respective methods
      const resourceKey = req.params["resourceKey"];

      switch (resourceKey) {
        // Frontend wants to generate the pre-signed url to upload the user's resume
        case FileResourceKey.USER_RESUME:
          return this.generatePsuToUploadUserResume(req, res, next);

        // Frontend wants to generate the pre-signed url to upload the user's profile pic
        case FileResourceKey.USER_PROFILE_PIC:
          return this.generatePsuToUploadUserProfilePic(req, res, next);

        // Frontend wants to generate the pre-signed url to upload the company logo
        case FileResourceKey.COMPANY_LOGO:
          return this.generatePsuToUploadCompanyLogo(req, res, next);

        case FileResourceKey.BLOG_COVER_IMAGE:
          return this.generatePsuToUploadBlogCoverImage(req, res, next);

        // Frontend wants to generate the pre-signed URL to upload the user's career CV
        case FileResourceKey.CAREER_RESUME:
          return this.generatePsuToUploadCareerResume(req, res, next);

        // Frontend wants to generate the pre-signed URL to upload the company job description
        case FileResourceKey.COMPANY_JOB_DESCRIPTION:
          return this.generatePsuToUploadCompanyJobDescription(req, res, next);

        // Frontend wants to generate the pre-signed url to upload interviewChunk
        case FileResourceKey.USER_INTERVIEW_RECORDING:
          return this.generatePsuToUploadInterviewChunks(req, res, next);

        case FileResourceKey.BULK_CVS: 
          return this.generatePsuToUploadSingleBulkCv(req, res, next);

        // As resource keys are not matched above, let frontend know about the same.
        default:
          throw new BaseError(
            "The provided 'resourceKey' is invalid. Please provide a valid 'resourceKey'.",
            HttpStatusCode.BAD_REQUEST_400
          );
      }
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * generatePreSignedUrlsToView
   *
   * Get the file (resume or profilePic) from the cloud storage.
   *
   * @param req Request
   * @param res Response
   * @param next NextFunction
   * @returns {Promise<any>}
   */
  generatePreSignedUrlsToView = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      // Get the resource key to route the action/operation to respective methods
      const resourceKey: string = req.params["resourceKey"];

      // Frontend wants to get the user's resume
      if (resourceKey === FileResourceKey.USER_RESUME) {
        return this.getUserResume(req, res, next);
      }
      // Frontend wants to get the user's profilePic
      else if (resourceKey === FileResourceKey.USER_PROFILE_PIC) {
        return this.getUserProfilePic(req, res, next);
      }
      // Frontend wants to get the user's profilePic
      else if (resourceKey === FileResourceKey.CAREER_RESUME) {
        return this.getUserCareerResume(req, res, next);
      }
      // Frontend wants to get the company job description file
      else if (resourceKey === FileResourceKey.COMPANY_JOB_DESCRIPTION) {
        return this.generatePsuToViewCompanyJobDescription(req, res, next);
      }
      // Frontend wants to get the cv file from bulk cvs list
      else if (resourceKey === FileResourceKey.BULK_CVS) {
        return this.generatePsuToViewBulkCv(req, res, next);
      }
      // Frontend wants to get the user's interview recording chunks
      else if (resourceKey === FileResourceKey.USER_INTERVIEW_RECORDING) {
        return this.generatePsuToViewInterviewChunks(req, res, next);
      }

      // As resource keys are not matched above, let frontend know about the same.
      throw new BaseError(
        "The provided 'resourceKey' is invalid. Please provide a valid 'resourceKey'.",
        HttpStatusCode.BAD_REQUEST_400
      );
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
  private generatePsuToUploadUserResume = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      // Get the request body
      let requestBodyObject = req.body;

      // Validate the request data
      const { error } = FileGeneratePsuToUploadUserResumeDTOValidation.validate(requestBodyObject, {
        abortEarly: false,
      });

      if (error) {
        throw new RequestValidationError(error);
      }

      // Get the base path where the user's resume file would be uploaded
      const fileUploadPath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_RESUME.strtr({
        "{userId}": requestBodyObject.userId.toString(),
      });

      // Get the user's resume file extension
      const resumeUserFileExtension = requestBodyObject.resumeUserFileName
        .split(".")
        .pop() as string; // It is expected in request payload to provide flexibility

      // Prepare the user's resume file name
      const resumeCloudFileName = UlidService.getUlidId() + "." + resumeUserFileExtension;

      // Generate the AWS S3 Signed Url
      const fileSignedUrl = await awsS3ClientLibrary.getSignedUrlForUploadingObject(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        fileUploadPath + "/" + resumeCloudFileName,
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
        awsS3SignedUrl: fileSignedUrl,
      };

      // Return the response
      return res.status(HttpStatusCode.OK_200).json(resObject);
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * generatePsuToUploadUserProfilePic
   *
   * Generate the Pre-signed URL to upload user's ProfilePic.
   * The frontend will upload the user's ProfilePic to the cloud using the provided pre-signed url.
   *
   * Note: Here the file mime type and extension of the file is expected in the request to provide flexibility.
   *
   * @param req Request
   * @param res Response
   * @param next NextFunction
   * @returns {Promise<any>}
   */
  private generatePsuToUploadUserProfilePic = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      // Get the request body
      let requestBodyObject = req.body;

      // Validate the request data
      const { error } = FileGeneratePsuToUploadUserProfilePicDTOValidation.validate(
        requestBodyObject,
        {
          abortEarly: false,
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      }

      // Get the base path where the user's ProfilePic file would be uploaded
      const fileUploadPath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_PROFILE_PIC.strtr({
        "{userId}": requestBodyObject.userId.toString(),
      });

      // Get the user's ProfilePic file extension
      const profilePicUserFileExtension = requestBodyObject.profileUserFileName
        .split(".")
        .pop() as string; // It is expected in request payload to provide flexibility

      // Prepare the user's ProfilePic file name
      const profilePicCloudFileName = UlidService.getUlidId() + "." + profilePicUserFileExtension;

      // Generate the AWS S3 Signed Url
      const fileSignedUrl = await awsS3ClientLibrary.getSignedUrlForUploadingObject(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        fileUploadPath + "/" + profilePicCloudFileName,
        APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS,
        {
          ContentType: requestBodyObject.profileFileMimeType, // It is expected in request payload to provide flexibility
        }
      );

      // Prepare the response object
      const resObject: PreSignedUrlToUploadFileResponseDto = {
        userFileName: requestBodyObject.profileUserFileName,
        cloudFileName: profilePicCloudFileName,
        fileMimeType: requestBodyObject.profileFileMimeType,
        fileExtension: profilePicUserFileExtension,
        awsS3SignedUrl: fileSignedUrl,
      };

      // Return the response
      return res.status(HttpStatusCode.OK_200).json(resObject);
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * generatePsuToUploadCompanyLogo
   *
   * @param {Request} req - The incoming request object.
   * @param {Response} res - The outgoing response object.
   * @param {NextFunction} next - The next function in the middleware chain.
   */
  private generatePsuToUploadCompanyLogo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Get the request body
      let requestBodyObject: CompanyLogoPreSignedUrlToUploadFileRequestApiDto = req.body;

      // Validate the request data
      const { error } = FileGeneratePsuToUploadCompanyLogoDTOValidation.validate(
        requestBodyObject,
        {
          abortEarly: false,
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      }

      // Get the base path where the company logo file would be uploaded.
      const fileUploadPath: string = APP_CONSTANTS.AWS_S3_DIR_PATHS.COMPANY_LOGO;

      /**
       * Get the company logo file extension
       *
       * @example:
       *  1. "jpg"
       *  2. "png"
       */
      const companyLogoFileExtension = requestBodyObject.companyLogoFileName
        .split(".")
        .pop() as string;

      /**
       * Prepare the company logo file name
       *
       * @example:
       *  1. "2vhd2uidvkqh3kv2rf6697.jpg"
       *  2. "2vhd2uiugdqwidvkqh3kv2.png"
       */
      const companyLogoCloudFileName: string = `${UlidService.getUlidId()}.${companyLogoFileExtension}`;

      // Generate the AWS S3 Signed Url
      const fileSignedUrl: string = await awsS3ClientLibrary.getSignedUrlForUploadingObject(
        process.env.APP_AWS_S3_BUCKET_WORKO_UI_COMP_LOGO as string,
        `${fileUploadPath}/${companyLogoCloudFileName}`,
        APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS,
        {
          ContentType: requestBodyObject.companyLogoFileMimeType,
        }
      );

      // Prepare the response object
      const resObject: PreSignedUrlToUploadFileResponseDto = {
        userFileName: requestBodyObject.companyLogoFileName,
        cloudFileName: companyLogoCloudFileName,
        fileMimeType: requestBodyObject.companyLogoFileMimeType,
        fileExtension: companyLogoFileExtension,
        awsS3SignedUrl: fileSignedUrl,
      };

      // Return the response
      return res.status(HttpStatusCode.OK_200).json(resObject);
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * generatePsuToUploadBlogCoverImage
   *
   * @param {Request} req - The incoming request object.
   * @param {Response} res - The outgoing response object.
   * @param {NextFunction} next - The next function in the middleware chain.
   */
  private generatePsuToUploadBlogCoverImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Get the request body
      let requestBodyObject: BlogCoverImagePreSignedUrlToUploadFileRequestApiDto = req.body;

      // Validate the request data
      const { error } = FileGeneratePsuToUploadBlogCoverImageDTOValidation.validate(
        requestBodyObject,
        {
          abortEarly: false,
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      }

      // Get the base path where the blog cover image file would be uploaded.
      const fileUploadPath: string = APP_CONSTANTS.AWS_S3_DIR_PATHS.BLOG_IMAGE;

      /**
       * Get the blog cover image file extension
       *
       * @example:
       *  1. "jpg"
       *  2. "png"
       */
      const blogCoverImageFileExtension = requestBodyObject.blogCoverImageFileName
        .split(".")
        .pop() as string;

      /**
       * Prepare the company logo file name
       *
       * @example:
       *  1. "2vhd2uidvkqh3kv2rf6697.jpg"
       *  2. "2vhd2uiugdqwidvkqh3kv2.png"
       */
      const blogCoverImageCloudName: string = `${UlidService.getUlidId()}.${blogCoverImageFileExtension}`;

      // Generate the AWS S3 Signed Url
      const fileSignedUrl: string = await awsS3ClientLibrary.getSignedUrlForUploadingObject(
        process.env.APP_AWS_S3_BUCKET_WORKO_UI_COMP_LOGO as string,
        `${fileUploadPath}/${blogCoverImageCloudName}`,
        APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS,
        {
          ContentType: requestBodyObject.blogCoverImageFileMimeType,
        }
      );

      // Prepare the response object
      const resObject: PreSignedUrlToUploadFileResponseDto = {
        userFileName: requestBodyObject.blogCoverImageFileName,
        cloudFileName: blogCoverImageCloudName,
        fileMimeType: requestBodyObject.blogCoverImageFileMimeType,
        fileExtension: blogCoverImageFileExtension,
        awsS3SignedUrl: fileSignedUrl,
      };

      // Return the response
      return res.status(HttpStatusCode.OK_200).json(resObject);
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * generatePsuToUploadCareerResume
   *
   * Generate the Pre-signed URL to upload user's career CV.
   * The frontend will upload the user's career CV to the cloud using the provided pre-signed URL.
   *
   * Note: Here the file mime type and extension of the file is expected in the request to provide flexibility.
   *
   * @param req Request
   * @param res Response
   * @param next NextFunction
   * @returns {Promise<any>}
   */
  private generatePsuToUploadCareerResume = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      // Get the request body
      let requestBodyObject = req.body;

      // Validate the request data
      const { error } = FileGeneratePsuToUploadCareerResumeDTOValidation.validate(
        requestBodyObject,
        {
          abortEarly: false,
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      }

      // Get the base path where the user's career CV file would be uploaded
      const uploadPath = APP_CONSTANTS.AWS_S3_DIR_PATHS.CAREER_RESUME;

      // Get the career CV file extension
      const careerCVFileExtension = requestBodyObject.careerCVFileName.split(".").pop() as string; // It is expected in request payload to provide flexibility

      // Prepare the career CV file name
      const careerCvCloudFileName = UlidService.getUlidId() + "." + careerCVFileExtension;

      // Generate the AWS S3 Signed Url
      const signedUrl = await awsS3ClientLibrary.getSignedUrlForUploadingObject(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        uploadPath + "/" + careerCvCloudFileName,
        APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS,
        {
          ContentType: requestBodyObject.careerCVFileMimeType,
        }
      );

      // Prepare the response object
      const resObject: PreSignedUrlToUploadFileResponseDto = {
        userFileName: requestBodyObject.careerCVFileName,
        cloudFileName: careerCvCloudFileName,
        fileMimeType: requestBodyObject.careerCVFileMimeType,
        fileExtension: careerCVFileExtension,
        awsS3SignedUrl: signedUrl,
      };

      // Return the response
      return res.status(HttpStatusCode.OK_200).json(resObject);
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * generatePsuToUploadCompanyJobDescription
   *
   * Generate the Pre-signed URL to upload Company Job Description
   * The frontend will upload the company job description file to the cloud using the provided pre-signed url.
   *
   * The file mime type and extension of the file is expected in the request to provide flexibility.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  private generatePsuToUploadCompanyJobDescription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Get the request body
      let requestBodyObject: CompanyJobDescriptionPreSignedUrlToUploadFileRequestApiDto = req.body;

      // Validate the request data and throw a validation error if invalid
      const { error } = FileGeneratePsuToUploadCompanyJobDescriptionDTOValidation.validate(
        requestBodyObject,
        {
          abortEarly: false,
        }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      // Get the base path where the company job description file would be uploaded
      const fileUploadPath: string = APP_CONSTANTS.AWS_S3_DIR_PATHS.COMPANY_JOB_DESCRIPTION.strtr({
        "{companyId}": requestBodyObject.companyId.toString(),
      });

      // Get the Company job description file extension
      const companyJobDescriptionFileExtension = requestBodyObject.companyJobDescriptionFileName
        .split(".")
        .pop() as string; // Sample Output: "pdf"

      // Prepare the Company job description file name
      const companyJobDescriptionCloudFileName: string =
        UlidService.getUlidId() + "." + companyJobDescriptionFileExtension;

      // Generate the AWS S3 Signed Url
      const fileSignedUrl: string = await awsS3ClientLibrary.getSignedUrlForUploadingObject(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        fileUploadPath + "/" + companyJobDescriptionCloudFileName,
        APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS,
        {
          ContentType: requestBodyObject.companyJobDescriptionFileMimeType, // It is expected in request payload to provide flexibility
        }
      );

      // Prepare the response object
      const resObject: PreSignedUrlToUploadFileResponseDto = {
        userFileName: requestBodyObject.companyJobDescriptionFileName,
        cloudFileName: companyJobDescriptionCloudFileName,
        fileMimeType: requestBodyObject.companyJobDescriptionFileMimeType,
        fileExtension: companyJobDescriptionFileExtension,
        awsS3SignedUrl: fileSignedUrl,
      };

      // Return the response
      return res.status(HttpStatusCode.OK_200).json(resObject);
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * generatePsuToUploadInterviewChunks
   *
   * Generate the Pre-signed URL to upload interview recording chunks.
   * The frontend will upload the interview recording chunks to the cloud using the provided pre-signed url.
   *
   * Note: Here the file mime type and extension of the file is expected in the request to provide flexibility.
   *
   * @param req Request
   * @param res Response
   * @param next NextFunction
   * @returns {Promise<any>}
   */
  private generatePsuToUploadInterviewChunks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      // Get the request body
      let requestBodyObject: InterviewRecordingPreSignedUrlToUploadFileRequestApiDto = req.body;

      // Validate the request data
      const { error } = FileGeneratePsuToUploadInterviewRecordingDTOValidation.validate(
        requestBodyObject,
        {
          abortEarly: false,
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      }

      // Get the base path where the interview recording chunk would be uploaded
      const fileUploadPath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_INTERVIEW_RECORDING.strtr({
        "{interviewId}": requestBodyObject.interviewId.toString(),
        "{userId}": requestBodyObject.userId.toString(),
      });

      // Get the interview recording chunk file extension
      const chunkFileExtension = requestBodyObject.chunkFileName.split(".").pop() as string; // It is expected in request payload to provide flexibility

      // Prepare the interview recording chunk file name with optional sequence
      const chunkSequencePrefix = requestBodyObject.chunkSequence
        ? `chunk_${requestBodyObject.chunkSequence}_`
        : "";
      const chunkCloudFileName =
        chunkSequencePrefix + UlidService.getUlidId() + "." + chunkFileExtension;

      // Generate the AWS S3 Signed Url
      const fileSignedUrl = await awsS3ClientLibrary.getSignedUrlForUploadingObject(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        fileUploadPath + "/" + chunkCloudFileName,
        APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS,
        {
          ContentType: requestBodyObject.chunkFileMimeType, // It is expected in request payload to provide flexibility
        }
      );

      // Prepare the response object
      const resObject: PreSignedUrlToUploadFileResponseDto = {
        userFileName: requestBodyObject.chunkFileName,
        cloudFileName: chunkCloudFileName,
        fileMimeType: requestBodyObject.chunkFileMimeType,
        fileExtension: chunkFileExtension,
        awsS3SignedUrl: fileSignedUrl,
      };

      // Return the response
      return res.status(HttpStatusCode.OK_200).json(resObject);
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  generatePsuToUploadSingleBulkCv = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let requestBodyObject: BulkCvsPsuToUploadApiDto = req.body;

      const { error } = bulkCvsPsuToUploadApiDtoValidation.validate(
        requestBodyObject,
        {
          abortEarly: false,
        }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: PreSignedUrlToUploadFileResponseDto =
        await fileServiceObj.generatePsuToUploadSingleBulkCv(requestBodyObject, true);

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Error at catch block in while generating pre-signed url for file upload. [File Controller]`,
        {
          error,
          methodName: this.generatePsuToUploadSingleBulkCv.name,
        }
      );
      next(error);
    }
  }

  /**
   * generatePsuToViewInterviewChunks
   *
   * Get the interview recording chunks from cloud storage.
   *
   * @param req Request
   * @param res Response
   * @param next NextFunction
   * @returns {Promise<any>}
   */
  private generatePsuToViewInterviewChunks = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const interviewId = req.params["id"];
      const cloudFileName = req.params["cloudFileName"];

      // Validate the request parameters
      const requestParams: InterviewRecordingPreSignedUrlToViewApiDto = {
        interviewId: interviewId,
      };

      const { error } = FileGeneratePsuToViewInterviewRecordingDTOValidation.validate(
        requestParams,
        {
          abortEarly: false,
        }
      );

      if (error) {
        throw new RequestValidationError(error);
      }

      // Construct the file path in the cloud storage
      const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_INTERVIEW_RECORDING.strtr({
        "{interviewId}": interviewId.toString(),
      });

      // Generate the object URL for viewing the interview recording chunk
      const objectUrl = await awsS3ClientLibrary.generateObjectUrl(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        filePath + "/" + cloudFileName
      );

      // Return the object URL to the frontend
      return res.status(HttpStatusCode.OK_200).json({ objectUrl });
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * getUserResume
   *
   * Get the user's resume from cloud storage.
   *
   * @param req Request
   * @param res Response
   * @param next NextFunction
   * @param userId string
   * @returns {Promise<any>}
   */
  private getUserResume = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = req.params["id"];
      const cloudFileName = req.params["cloudFileName"];
      // Construct the file path in the cloud storage
      const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_RESUME.strtr({
        "{userId}": userId.toString(),
      });

      // Assume that you have a method to generate the object URL
      const objectUrl = await awsS3ClientLibrary.generateObjectUrl(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        filePath + "/" + cloudFileName
      );

      // Return the object URL to the frontend
      return res.status(HttpStatusCode.OK_200).json({ objectUrl });
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * getUserProfilePic
   *
   * Get the user's profilePic from cloud storage.
   *
   * @param req Request
   * @param res Response
   * @param next NextFunction
   * @param userId string
   * @returns {Promise<any>}
   */
  private getUserProfilePic = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const userId = req.params["id"];
      const cloudFileName = req.params["cloudFileName"];
      // Construct the file path in the cloud storage
      const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_PROFILE_PIC.strtr({
        "{userId}": userId.toString(),
      });

      // Assume that you have a method to generate the object URL
      const objectUrl = await awsS3ClientLibrary.generateObjectUrl(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        filePath + "/" + cloudFileName
      );

      // Return the object URL to the frontend
      return res.status(HttpStatusCode.OK_200).json({ objectUrl });
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * getUserCareerResume
   *
   * Get the user's career resume from cloud storage.
   *
   * @param req Request
   * @param res Response
   * @param next NextFunction
   * @returns {Promise<any>}
   */
  private getUserCareerResume = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      // get cloudFile name to create Signed URL
      const cloudFileName = req.params["cloudFileName"];

      // Construct the file path in the cloud storage
      const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.CAREER_RESUME;

      // Assume that you have a method to generate the object URL
      const objectUrl = await awsS3ClientLibrary.generateObjectUrl(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        filePath + "/" + cloudFileName
      );

      // Return the object URL to the frontend
      return res.status(HttpStatusCode.OK_200).json({ objectUrl });
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * generatePsuToViewCompanyJobDescription
   *
   * Get the company job description from cloud storage.
   *
   * @param {Request} req - The incoming request object.
   * @param {Response} res - The outgoing response object.
   * @param {NextFunction} next - The next function in the middleware chain.
   * @param {string} companyId - The ID of the company.
   * @param {string} cloudFileName - The name of the file in the cloud storage.
   */
  private generatePsuToViewCompanyJobDescription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const companyId = req.params["id"];
      const cloudFileName = req.params["cloudFileName"];

      // Construct the file path in the cloud storage
      const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.COMPANY_JOB_DESCRIPTION.strtr({
        "{companyId}": companyId.toString(),
      });

      // Assume that you have a method to generate the object URL
      const objectUrl = await awsS3ClientLibrary.generateObjectUrl(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        filePath + "/" + cloudFileName
      );

      // Return the object URL to the frontend
      return res.status(HttpStatusCode.OK_200).json({ objectUrl });
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };

  /**
   * generatePsuToViewBulkCv
   *
   * Get the cv detail from bulk cv path from cloud storage.
   *
   * @param {Request} req - The incoming request object.
   * @param {Response} res - The outgoing response object.
   * @param {NextFunction} next - The next function in the middleware chain.
   *
   * @param {string} cloudFileName - The name of the file in the cloud storage.
   */
  private generatePsuToViewBulkCv = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const companyId: string = req.params["id"];
      const cloudFileName: string = req.params["cloudFileName"];

      // retrieve the request body and throw error if it is invalid
      const reqQuery = req.query as unknown as BulkCvPreSignedUrlToViewApiDto;
      const { error } = FileGeneratePsuToViewBulkJdResumeDTOValidation.validate(reqQuery, {
        abortEarly: false,
      });
      if (error) {
        throw new RequestValidationError(error);
      }

      // Construct the file path in the cloud storage
      const filePath: string = APP_CONSTANTS.AWS_S3_DIR_PATHS.BULK_CVS.strtr({
        "{companyId}": companyId.toString(),
        "{corporateBulkJdId}": reqQuery.corporateBulkJdId,
      });

      // Assume that you have a method to generate the object URL
      const objectUrl: string = await awsS3ClientLibrary.generateObjectUrl(
        process.env.APP_AWS_S3_BUCKET_WORKO_CORPORATE as string,
        filePath + "/" + cloudFileName
      );

      // Return the object URL to the frontend
      return res.status(HttpStatusCode.OK_200).json({ objectUrl: objectUrl });
    } catch (error) {
      // Let global error handler handle the exception (app.ts)
      next(error);
    }
  };
}

export default FileController;
