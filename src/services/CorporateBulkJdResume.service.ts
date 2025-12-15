// import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";
import { ObjectType } from "dynamoose/dist/General";

// import firestore package
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// import constants
import APP_CONSTANTS from "../configs/constants.config";

// import daos
import { corporateBulkJdResumeDaoObj } from "../daos/CorporateBulkJdResume.dao";

// import dtos
import {
  CorporateBulkJdResumeFilterOptions,
  CorporateBulkJdResumeCreateResponseDto,
  CorporateBulkJdResumeCreateApiDto,
  CorporateBulkJdResumesCreateDto,
  CorporateBulkJdResumeDbCvExtractedParsedDto,
} from "../dtos/CorporateBulkJdResume.dto";
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";
import {
  BulkCvsPreSignedUrlToUploadFileDto,
  PreSignedUrlToUploadFileResponseDto,
} from "../dtos/File.dto";
import {
  EmailTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE,
  EmailTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE,
} from "../dtos/EmailTemplatePlaceholder.dto";
import {
  WhatsAppBusinessPartnerTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE,
  WhatsAppBusinessPartnerTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE,
} from "../dtos/WhatsAppBusinessPartnerTemplatePlaceholder.dto";

// import enums
import { CorporateBulkJdResumeProcessingStatusEnum } from "../enums/CorporateBulkJdResume.enum";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { WhatsAppBusinessPartnerTemplateNameEnum } from "../enums/WhatsAppBusinessPartnerTemplate.enum";
import { UserContextTypeEnum } from "../enums/User.enum";
import { CorporateCandidateProfileDbRefereeTypeEnum } from "../enums/CorporateCandidateProfile.enum";
import { CentralCandidateProfileDbRefereeTypeEnum } from "../enums/CentralCandidateProfile.enum";
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import libraries
import {
  emailLibrary,
  EmailSourceDestinationAddress,
} from "../libraries/email.library";
import { whatsAppBusinessPartnerLibraryObj } from "../libraries/WhatsAppBusinessPartner.library";

// import models
import { DbCorporateBulkJdResumeDto } from "../db/models/CorporateBulkJdResume.model";
import { DbCorporateBulkJdDto } from "../db/models/CorporateBulkJd.model";
import { DbCompanyDetailDto } from "../db/models/CompanyDetail.model";
import { DbCorporateCandidateProfileDto } from "../db/gcp-firestore-models/CorporateCandidateProfile.model";
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// import services
import { corporateBulkJdServiceObj } from "./CorporateBulkJd.service";
import { fileServiceObj } from "./File.service";
import { companyServiceObj } from "../admin/services/Company.service";
import { corporateCandidateProfileServiceObj } from "./CorporateCandidateProfile.service";
import UlidService from "./Ulid.service";
import { centralCandidateProfileServiceObj } from "./CentralCandidateProfile.service";
import { candidateParsedCvServiceObj } from "./CandidateParsedCv.service";

// import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";


/**
 * CorporateBulkJdResumeService
 *
 * Service for handling Corporate Bulk Job Description Resume related operations
 */
class CorporateBulkJdResumeService {
  /**
   * createCorporateBulkJdResumes
   *
   * This service is used to create a new Corporate Bulk Job Description Resumes and generate pre-signed urls to upload on AWS S3.
   *
   * @param {string} corporateBulkJdId - The id of the corporate bulk job description
   * @param {CorporateBulkJdResumeCreateApiDto} corporateBulkJdResumeDto - The Corporate Bulk Job Description Resume details
   * @param {string | undefined} [createdByUserId] - The id of the user who created the corporate bulk job description resume
   * @param {string | undefined} [createdByCorporateUserId] - The id of the corporate user who created the corporate bulk job description resume
   * @returns {Promise<CorporateBulkJdResumeCreateResponseDto>}
   */
  async createCorporateBulkJdResumes(
    corporateBulkJdId: string,
    corporateBulkJdResumeDto: CorporateBulkJdResumeCreateApiDto,
    createdByUserId?: string,
    createdByCorporateUserId?: string,
  ): Promise<CorporateBulkJdResumeCreateResponseDto> {
    // logger
    global.logger.info(
      "Create Corporate Bulk Job Description Resumes And Generate Pre-signed Urls to upload on AWS S3. [Service]",
      {
        filePath: __filename,
        methodName: this.createCorporateBulkJdResumes.name,
        corporateBulkJdId: corporateBulkJdId,
      }
    );

    // Check whether the corporate bulk jd details exists or not
    const corporateBulkJdDetails: DbCorporateBulkJdDto =
      await corporateBulkJdServiceObj.getCorporateBulkJdById(corporateBulkJdId);

    // Update resume count in corporate bulk jd model
    await corporateBulkJdServiceObj.updateCorporateBulkJdByPkAndSk(
      corporateBulkJdDetails.PK,
      corporateBulkJdDetails.SK,
      {
        resumesCount:
          (corporateBulkJdDetails.resumesCount ?? 0) +
          corporateBulkJdResumeDto.bulkCvs.length,
      }
    );

    // Prepare Argument for Generating Bulk Cvs Pre-signed urls
    const psuToUploadBulkCvsParams: BulkCvsPreSignedUrlToUploadFileDto = {
      companyId: corporateBulkJdDetails.companyId,
      corporateBulkJdId: corporateBulkJdDetails.id,
      bulkCvs: corporateBulkJdResumeDto.bulkCvs,
    };

    // Generate Pre-Signed urls
    const psuToUploadBulkCvsDetails: PreSignedUrlToUploadFileResponseDto[] =
      await fileServiceObj.generatePsuToUploadBulkCvs(psuToUploadBulkCvsParams);

    // Prepare Argument For Storing the Cvs in Database
    const corporateBulkJdResumesArgument: CorporateBulkJdResumesCreateDto[] =
      psuToUploadBulkCvsDetails.map(
        // Iterate On each Psu To Upload BulkCv Detail and prepare the item to be stored in the database
        (
          eachPsuToUploadBulkCvDetail: PreSignedUrlToUploadFileResponseDto
        ): CorporateBulkJdResumesCreateDto => {
          /**
           * Extract the `id` from the cloud File Name which will be used in the keys of model
           *
           * @todo: Extracting the `id` from the cloud File Name is not a appropriate way,
           *
           * @todo: Extracting the `id` from the cloud File Name is not a appropriate way,
           * we should have a better way to get the `id`
           */
          const resumeId: string =
            eachPsuToUploadBulkCvDetail.cloudFileName.split(".")[0];

          /**
           * Prepare Argument For Storing the Cvs in Database
           *
           *
           * NOTE: Preparing the dynamodb keys for the model in service folder should be done in dao folder only
           */
          const corporateBulkJdResumeArgument: CorporateBulkJdResumesCreateDto =
            {
              PK: corporateBulkJdResumeDaoObj.partitianKey.strtr({
                "{id}": corporateBulkJdDetails.id,
              }),
              SK: corporateBulkJdResumeDaoObj.sortKeys.SK_CORP_BULK_JD_RESUME_ID.strtr(
                {
                  "{id}": resumeId,
                }
              ),
              GSI1PK: corporateBulkJdResumeDaoObj.GSI1PK,
              GSI1SK: corporateBulkJdResumeDaoObj.GSI1SK.strtr({
                "{id}": resumeId,
              }),
              GSI2PK: corporateBulkJdResumeDaoObj.GSI2PK.strtr({
                "{companyId}": corporateBulkJdDetails.companyId,
              }),
              GSI2SK: corporateBulkJdResumeDaoObj.GSI2SK.strtr({
                "{id}": resumeId,
              }),
              id: resumeId,
              companyId: corporateBulkJdDetails.companyId,
              corporateBulkJdId: corporateBulkJdDetails.id,
              processingStatus:
                CorporateBulkJdResumeProcessingStatusEnum.PENDING,
              matchingScore: 0,
              userFileName: eachPsuToUploadBulkCvDetail.userFileName ?? "",
              cloudFileName: eachPsuToUploadBulkCvDetail.cloudFileName,
              createdByUserId: createdByUserId,
              createdByCorporateUserId: createdByCorporateUserId,
            };

          return corporateBulkJdResumeArgument;
        }
      );

    /**
     * Initialize chunk size
     *
     * The chunk size is initialized to 20, which is the maximum number of items that can be stored in a single call to batchPut.
     * In a single call to batchPut, up to 25 items can be put or deleted operations.
     */
    const corporateBulkJdResumeChunkSize: number = 20;

    // Chunk the data into groups of 20
    const corporateBulkJdResumeChunks: CorporateBulkJdResumesCreateDto[][] = [];

    // Iterate and create chunks using chunk size of 20
    for (
      let i = 0;
      i < corporateBulkJdResumesArgument.length;
      i += corporateBulkJdResumeChunkSize
    ) {
      /**
       * The slice() method returns selected elements in an array, as a new array.
       * The slice() method selects from a given start, up to a (not inclusive) given end.
       * The slice() method does not change the original array.
       */
      corporateBulkJdResumeChunks.push(
        corporateBulkJdResumesArgument.slice(
          i,
          i + corporateBulkJdResumeChunkSize
        )
      );
    }

    // Process each chunk
    const unprocessedItems: ObjectType[] = [];
    corporateBulkJdResumeChunks.forEach(
      async (
        eachCorporateBulkJdResumeChunk: CorporateBulkJdResumesCreateDto[]
      ) => {
        // Create Each Corporate Bulk Jd Resumes Chunk in Database
        const corporateBulkJdResumesCreateResponse: {
          unprocessedItems: ObjectType[];
        } =
          await corporateBulkJdResumeDaoObj.createCorporateBulkJdResumesByBatchPut(
            eachCorporateBulkJdResumeChunk
          );

        /**
         * If there are any unprocessed items, add them to the unprocessedItems array,
         * `unprocessedItems` means that the item that are failed to be stored in the database using batch put operation of dynamoose
         */
        if (corporateBulkJdResumesCreateResponse.unprocessedItems?.length) {
          unprocessedItems.push(
            ...corporateBulkJdResumesCreateResponse.unprocessedItems
          );
        }
      }
    );

    // prepare response
    const corporateBulkJdCvsResponseDto: CorporateBulkJdResumeCreateResponseDto =
      {
        corporateBulkJdId: corporateBulkJdDetails.id,
        bulkCvs: psuToUploadBulkCvsDetails,
        bulkCvsStorageFailed: unprocessedItems,
      };

    // return the response
    return corporateBulkJdCvsResponseDto;
  }

  private async performCandProfileDatabaseActivitiesAfterBulkScreening(
    corporateBulkJdResume: DbCorporateBulkJdResumeDto,
    companyDetails: DbCompanyDetailDto,
    cvExtractedParsed: CorporateBulkJdResumeDbCvExtractedParsedDto
  ) {
    const {companyId, cloudFileName: candidateCvAwsS3FileName, corporateBulkJdId} = corporateBulkJdResume;
    const {
      candidateNumber,
      candidatePhoneCountryCode,
      candidateName,
      candidateNoticePeriod,
      isNoticePeriodNegotiable,
      candidateEmail,
      candidateLocation,
      candidateCurrentCompany,
      candidateCurrentDesignation,
      candidateRelevantYOE,
      candidateTotalYOE,
      candidateExpectedCTC,
      candidateCurrentCTC,
      candidateReadyToRelocate,
      coreSkills,
      technicalSkills,
      userPreferredDepartments,
      userPreferredIndustries,
      userPreferredlocations,
      userPreferredRoles
    } = cvExtractedParsed;
    const {
      name: companyName
    } = companyDetails;

    const existingCorporateCandidateProfile: QuerySnapshot<DocumentData, DocumentData> = await corporateCandidateProfileServiceObj.getDuplicateCorporateCandidateProfile(
      companyId,
      candidateEmail,
      {
        number: candidateNumber,
        countryCode: candidatePhoneCountryCode
      }
    );
    const currentDate: string = dateHelperObj.getISODate();
    if(!existingCorporateCandidateProfile.empty) {
      const existingCorporateCandidateProfileData = existingCorporateCandidateProfile.docs[0].data() as DbCorporateCandidateProfileDto;
      if(existingCorporateCandidateProfileData.candidateEmail === candidateEmail) {
        let updateCorporateCandidateProfileData: Partial<DbCorporateCandidateProfileDto> = {
          updatedAt: currentDate
        };

        const updateEntityCandidateProfilePromises = [];
        
        if(Object.keys(updateCorporateCandidateProfileData).length>1) {
          updateEntityCandidateProfilePromises.push(
            corporateCandidateProfileServiceObj.updateCorporateCandidateProfileById(existingCorporateCandidateProfileData.id, updateCorporateCandidateProfileData)
          )
        }

        if(updateEntityCandidateProfilePromises.length) {
          await Promise.all(updateEntityCandidateProfilePromises);
        }
      } else if(existingCorporateCandidateProfileData.phoneNumberDetails.number === candidateNumber && existingCorporateCandidateProfileData.phoneNumberDetails.countryCode === candidatePhoneCountryCode) {
        global.logger.debug(`Candidate already exists with same phone number and country code [SERVICE]`, {
          existingCorporateCandidateProfileData,
          candidateEmail,
          candidateNumber,
        });
      }
    } else {
      // Prepare Create corporate candidate profile
      const corporateCandidateProfileCreateData: DbCorporateCandidateProfileDto = {
        id: UlidService.getUlidId(),
        createdAt: currentDate,
        updatedAt: currentDate,
        companyId: companyId,
        candidateEmail: candidateEmail,
        refereeType: CorporateCandidateProfileDbRefereeTypeEnum.INTERNAL,
        phoneNumberDetails: {
          number: candidateNumber,
          countryCode: candidatePhoneCountryCode
        },

        /**
         * @note We given it empty to avoid typescript error, this will be updated in below lines of code
         */
        candidateParsedCvId: "", 
      };

      // Get existing candidate data from `CentralCandidateProfile` model
      const existingCentralCandidateProfile: DbCentralCandidateProfileDto | undefined =
        await centralCandidateProfileServiceObj.getCentralCandidateProfileById(
          candidateEmail
        );

      let createOrUpdateCentralCandidateProfile: Promise<DbCentralCandidateProfileDto | undefined>;

      if(existingCentralCandidateProfile) {
        corporateCandidateProfileCreateData.candidateParsedCvId = existingCentralCandidateProfile.latestCandidateParsedCvId;
        
        createOrUpdateCentralCandidateProfile = centralCandidateProfileServiceObj.updateCentralCandidateProfileById(
          candidateEmail,
          {
            updatedAt: currentDate,
            candidateProfileInCompanies: [
              ...(existingCentralCandidateProfile?.candidateProfileInCompanies ?? []),
              {
                companyId: companyId,
                companyName: companyName,
              }
            ],
            corporateCandidateProfileIds: [
              ...(existingCentralCandidateProfile?.corporateCandidateProfileIds ?? []),
              corporateCandidateProfileCreateData.id
            ],
          }
        )
      } else {
        // Prepare Create candidate parsed CV
        const candidateParsedCvCreateData: DbCandidateParsedCvDto = {
          id: UlidService.getUlidId(),
          createdAt: currentDate,
          updatedAt: currentDate,
          name: candidateName,
          email: candidateEmail,
          phoneNumberDetails: {
            number: candidateNumber,
            countryCode: candidatePhoneCountryCode
          },
          currentCompany: candidateCurrentCompany,
          currentDesignation: candidateCurrentDesignation,
          totalYOE: candidateTotalYOE,
          relevantYOE: candidateRelevantYOE,
          currentCTC: candidateCurrentCTC,
          expectedCTC: candidateExpectedCTC,
          noticePeriod: candidateNoticePeriod,
          location: candidateLocation?.toLowerCase(),
          readyToRelocate: candidateReadyToRelocate,
          coreSkills: coreSkills,
          technicalSkills: technicalSkills,
          userPreferredDepartments: userPreferredDepartments,
          userPreferredIndustries: userPreferredIndustries,
          userPreferredlocations: userPreferredlocations,
          userPreferredRoles: userPreferredRoles,
          cvAwsS3ResourceType: CandidateParsedCvAwsS3ResourceTypeEnum.BULK_CVS,
          cvAwsS3BucketName: process.env.APP_AWS_S3_BUCKET_WORKO_CORPORATE as string,
          cvAwsS3FilePath: APP_CONSTANTS.AWS_S3_DIR_PATHS.BULK_CVS.strtr({
            "{companyId}": companyId,
            "{corporateBulkJdId}": corporateBulkJdId
          }),
          cvAwsS3FileName: candidateCvAwsS3FileName,
          cvAwsS3FileTracker: [
            {
              actionDate: currentDate,
              resourceType: CandidateParsedCvAwsS3ResourceTypeEnum.BULK_CVS,
              bucketName: process.env.APP_AWS_S3_BUCKET_WORKO_CORPORATE as string,
              filePath: APP_CONSTANTS.AWS_S3_DIR_PATHS.BULK_CVS.strtr({
                "{companyId}": companyId,
                "{corporateBulkJdId}": corporateBulkJdId
              }),
              fileName: candidateCvAwsS3FileName
            }
          ],
          isNoticePeriodNegotiable,
          companyId: companyId,
          corporateCandidateProfileId: corporateCandidateProfileCreateData.id,
          corporateBulkJdId: corporateBulkJdId
        };
        corporateCandidateProfileCreateData.candidateParsedCvId = candidateParsedCvCreateData.id;
        const createCandidateParsedCvWithEmbedding: DbCandidateParsedCvDto | undefined = await candidateParsedCvServiceObj.createCandidateParsedCvWithEmbedding(candidateParsedCvCreateData);

        let createCentralCandidateProfileData: DbCentralCandidateProfileDto = {
          id: candidateEmail,
          createdAt: currentDate,
          updatedAt: currentDate,
          candidateEmail: candidateEmail,
          phoneNumberDetails: candidateParsedCvCreateData.phoneNumberDetails,
          refereeType: CentralCandidateProfileDbRefereeTypeEnum.INTERNAL,
          candidateProfileInCompanies: [
            {
              companyId: companyId,
              companyName: companyName,
            },
          ],
          corporateCandidateProfileIds: [corporateCandidateProfileCreateData.id],
          candidateParsedCvIds: [candidateParsedCvCreateData.id],
          latestCandidateParsedCvId: candidateParsedCvCreateData.id,
        };
        createOrUpdateCentralCandidateProfile = centralCandidateProfileServiceObj.createCentralCandidateProfile(createCentralCandidateProfileData);
      }

      const candProfilePromises = [
        corporateCandidateProfileServiceObj.createCorporateCandidateProfile(corporateCandidateProfileCreateData),
        createOrUpdateCentralCandidateProfile
      ]

      const candidateProfileResult: (DbCentralCandidateProfileDto | DbCorporateCandidateProfileDto | undefined)[] = await Promise.all(candProfilePromises);

      return candidateProfileResult;
    }
  }

  /**
   * sendEmailAndWhatsappNotificationsToBulkResumeCandidatesByCorporateBulkJdId
   *
   * Sends email and WhatsApp notifications to candidates based on their resumes and matching scores
   * for a specific corporate bulk job description.
   *
   * NOTE: `sendEmailAndWhatsappNotificationsToBulkResumeCandidatesByCorporateBulkJdId` function
   * is not being used currently, but it may be used in the future.
   *
   * @param {string} corporateBulkJdId - The unique identifier of the corporate bulk job description.
   * @returns {Promise<boolean>} - A promise that resolves to true if notifications are sent successfully,
   *                               false if no resumes are available for processing.
   */
  async sendEmailAndWhatsappNotificationsToBulkResumeCandidatesByCorporateBulkJdId(
    corporateBulkJdId: string
  ): Promise<boolean> {
    global.logger.info(
      `Send Email And Whatsapp Notifications To Bulk Resume Candidates For Particular Corporate Bulk Job Description [Service]`,
      {
        filePath: __filename,
        methodName:
          this
            .sendEmailAndWhatsappNotificationsToBulkResumeCandidatesByCorporateBulkJdId
            .name,
        corporateBulkJdId: corporateBulkJdId,
      }
    );

    // Get Corporate Bulk Jd Details By Id
    const corporateBulkJdDetails: DbCorporateBulkJdDto =
      await corporateBulkJdServiceObj.getCorporateBulkJdById(corporateBulkJdId);

    // Get Company Details By company Id and if not found return false
    const companyDetailsResponse: QueryResponse<DbCompanyDetailDto> =
      await companyServiceObj.getCompanyDetailById(
        corporateBulkJdDetails.companyId
      );
    if (!companyDetailsResponse.count) {
      global.logger.debug(
        `No company details found, so email and whatsapp notifications not sent [service]`,
        {
          filePath: __filename,
          methodName:
            this
              .sendEmailAndWhatsappNotificationsToBulkResumeCandidatesByCorporateBulkJdId
              .name,
          companyId: corporateBulkJdDetails.companyId,
        }
      );

      return false;
    }

    // Retrieve Company Details
    const companyDetails: DbCompanyDetailDto = companyDetailsResponse[0];

    // Get all Corporate Bulk Jd Resumes Without Pagination By Filter Options
    const corporateBulkJdResumesData: DbCorporateBulkJdResumeDto[] =
      await this.getAllCorporateBulkJdResumesWithoutPagination(
        corporateBulkJdId
      );

    // Check if there are any corporate bulk job description resumes and if not return false
    if (corporateBulkJdResumesData.length === 0) {
      return false;
    }

    // Send email and whatsapp notifications to each candidate from bulk resumes
    const corporateBulkJdResumeEmailAndWhatsappPromises: Promise<
      [
        {
          awsMessageId: string | null;
          systemLogId: string | null;
        },
        {
          systemLogId: string | null;
          whatsAppBusinessPartnerSendMessageResponseId:
            | string
            | null
            | undefined;
        }
      ]
    >[] = corporateBulkJdResumesData.map(
      async (eachCorporateBulkJdResume: DbCorporateBulkJdResumeDto) => {
        // Get Cv Extracted Parsed
        const cvExtractedParsed: CorporateBulkJdResumeDbCvExtractedParsedDto | undefined =
          eachCorporateBulkJdResume.cvExtractedParsed;
        if(!cvExtractedParsed) {
          return Promise.resolve([{
            awsMessageId: null,
            systemLogId: null
          }, {
            systemLogId: null,
            whatsAppBusinessPartnerSendMessageResponseId: null
          }])
        }

        // Construct the email address object
        const toAddress: EmailSourceDestinationAddress = {
          email: cvExtractedParsed.candidateEmail,
          fullName: cvExtractedParsed.candidateName,
        };

        let emailPromises: Promise<{
          awsMessageId: string | null;
          systemLogId: string | null;
        }>;

        let whatsAppPromises: Promise<{
          systemLogId: string | null;
          whatsAppBusinessPartnerSendMessageResponseId:
            | string
            | null
            | undefined;
        }>;

        // Check if the matching score is greater than given threshold
        if (
          eachCorporateBulkJdResume.matchingScore >=
          APP_CONSTANTS.MATCHING_SCORES
            .CORPORATE_BULK_JD_RESUME_MINIMUM_MATCHING_SCORE
        ) {
          const whatsAppBusinessPartnerPlaceholders: WhatsAppBusinessPartnerTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE =
            {
              candidateName: cvExtractedParsed.candidateName.toTitleCase(),
              companyName: companyDetails.name.toTitleCase(),
              jobTitle: corporateBulkJdDetails.jobTitle.toTitleCase(),
              matchingScore: eachCorporateBulkJdResume.matchingScore.toString(),
            };

          // sending a whatsapp message to the candidate using the "WHATSAPP BUSINESS PARTNER API INTEGRATION"
          whatsAppPromises =
            whatsAppBusinessPartnerLibraryObj.sendWhatsAppBusinessPartnerWhatsappMessage(
              WhatsAppBusinessPartnerTemplateNameEnum.CAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE,
              cvExtractedParsed.candidatePhoneNumber.strtr({ "+": "" }), // To Phone Number
              whatsAppBusinessPartnerPlaceholders,
              cvExtractedParsed.candidateEmail
            );

          // Construct the email placeholders object
          const emailPlaceholders: EmailTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE =
            {
              candidateName: cvExtractedParsed.candidateName.toTitleCase(),
              companyName: companyDetails.name.toTitleCase(),
              jobTitle: corporateBulkJdDetails.jobTitle.toTitleCase(),
              matchingScore: eachCorporateBulkJdResume.matchingScore,
              signUpUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_SIGNUP_URL,
              ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
            };

          // Send email to the candidate
          emailPromises = emailLibrary.sendEmail(
            EmailTemplateEnum.CAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE,
            toAddress,
            emailPlaceholders
          );
        } else {
          const whatsAppBusinessPartnerPlaceholders: WhatsAppBusinessPartnerTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE =
            {
              candidateName: cvExtractedParsed.candidateName.toTitleCase(),
              companyName: companyDetails.name.toTitleCase(),
              jobTitle: corporateBulkJdDetails.jobTitle.toTitleCase(),
            };

          // sending a whatsapp message to the candidate using the "WHATSAPP BUSINESS PARTNER API INTEGRATION"
          whatsAppPromises =
            whatsAppBusinessPartnerLibraryObj.sendWhatsAppBusinessPartnerWhatsappMessage(
              WhatsAppBusinessPartnerTemplateNameEnum.CAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE,
              cvExtractedParsed.candidatePhoneNumber.strtr({ "+": "" }), // To Phone Number
              whatsAppBusinessPartnerPlaceholders,
              cvExtractedParsed.candidateEmail
            );

          // Construct the email placeholders object
          const emailPlaceholders: EmailTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE =
            {
              candidateName: cvExtractedParsed.candidateName.toTitleCase(),
              companyName: companyDetails.name.toTitleCase(),
              jobTitle: corporateBulkJdDetails.jobTitle.toTitleCase(),
              signUpUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_SIGNUP_URL,
              ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
            };

          // Send email to the candidate
          emailPromises = emailLibrary.sendEmail(
            EmailTemplateEnum.CAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE,
            toAddress,
            emailPlaceholders
          );
        }

        return Promise.all([emailPromises, whatsAppPromises]);
      }
    );

    // Wait for all promises to resolve
    const emailAndWhatsappResponses: [
      {
        awsMessageId: string | null;
        systemLogId: string | null;
      },
      {
        systemLogId: string | null;
        whatsAppBusinessPartnerSendMessageResponseId: string | null | undefined;
      }
    ][] = await Promise.all(corporateBulkJdResumeEmailAndWhatsappPromises);
    global.logger.info(
      "Email and Whatsapp responses length:",
      emailAndWhatsappResponses.length
    );

    return true;
  }

  /**
   * corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate
   *
   * Sends email and WhatsApp notification to candidate(Who is not registered user on worko) based on their resume and matching score
   * for a specific corporate bulk job description.
   *
   * @param {string} corporateBulkJdResumeId - The unique identifier of the corporate bulk job description resume.
   * @returns {Promise<boolean>} - A promise that resolves to true if email and whatsapp notifications are sent successfully.
   * @throws {BaseError} If the corporate bulk job description resume is not found.
   */
  async corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate(
    corporateBulkJdResumeId: string
  ): Promise<boolean> {
    // Logging the action
    global.logger.info(
      `Processing request to send email and whatsapp notification to candidate(Who is not registered user on worko). [SERVICE]`,
      {
        filePath: __filename,
        methodName:
          this.corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate
            .name,
        corporateBulkJdResumeId: corporateBulkJdResumeId,
      }
    );

    // Get Corporate Bulk Jd Resume Details and return false if not found
    const corporateBulkJdResumeResponse: QueryResponse<DbCorporateBulkJdResumeDto> =
      await corporateBulkJdResumeDaoObj.getCorporateBulkJdResumeById(
        corporateBulkJdResumeId
      );
    if (!corporateBulkJdResumeResponse.count) {
      global.logger.info(
        `Corporate Bulk Jd Resume Details Not found, So Email and Whatsapp notification not sent. [SERVICE]`,
        {
          filePath: __filename,
          methodName:
            this
              .corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate
              .name,
          corporateBulkJdResumeId: corporateBulkJdResumeId,
        }
      );

      // Return false if not found
      return false;
    }

    // Get Corporate Bulk Jd Details
    const corporateBulkJdResumeDetails: DbCorporateBulkJdResumeDto =
      corporateBulkJdResumeResponse[0];

    // Get CV Extracted Parsed details
    const cvExtractedParsed: CorporateBulkJdResumeDbCvExtractedParsedDto | undefined =
      corporateBulkJdResumeDetails.cvExtractedParsed;
    if(!cvExtractedParsed) {
      global.logger.error(
        `CV Extracted Parsed Not found, So Email and Whatsapp notification not sent. [SERVICE]`,
        {
          filePath: __filename,
          methodName:
            this
              .corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate
              .name,
          corporateBulkJdResumeId: corporateBulkJdResumeId,
        }
      )
      throw new BaseError(
        "CV Extracted Parsed Not found",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      )
    }

    if(!cvExtractedParsed.candidateEmail) {
      global.logger.info(
        `Candidate Email Not found, So Email and Whatsapp notification not sent. [SERVICE]`,
        {
          filePath: __filename,
          methodName:
            this
              .corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate
              .name,
          corporateBulkJdResumeId: corporateBulkJdResumeId,
        }
      )

      return false;
    }

    // Get Company Details By company Id
    const companyDetailResponse: QueryResponse<DbCompanyDetailDto> =
      await companyServiceObj.getCompanyDetailById(
        corporateBulkJdResumeDetails.companyId
      );
    if (!companyDetailResponse.count) {
      global.logger.info(
        `Company Details Not found, So Email and Whatsapp notification not sent. [SERVICE]`,
        {
          filePath: __filename,
          methodName:
            this
              .corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate
              .name,
          corporateBulkJdResumeId: corporateBulkJdResumeId,
        }
      );

      // Return false if not found
      return false;
    }

    // Get Compny Details
    const companyDetails: DbCompanyDetailDto = companyDetailResponse[0];

    // Get Corporate Bulk Jd Details
    const corporateBulkJdResponse: QueryResponse<DbCorporateBulkJdDto> =
      await corporateBulkJdServiceObj.getCorporateBulkJdByIdQueryResponse(
        corporateBulkJdResumeDetails.corporateBulkJdId
      );
    if (!corporateBulkJdResponse.count) {
      global.logger.info(
        `Corporate Bulk Jd Details Not found, So Email and Whatsapp notification not sent. [SERVICE]`,
        {
          filePath: __filename,
          methodName:
            this
              .corporateBulkJdResumeSendEmailAndWhatsappNotificationAsCandidate
              .name,
          corporateBulkJdResumeId: corporateBulkJdResumeId,
        }
      );

      // Return false if not found
      return false;
    }

    // Get Corporate Bulk Jd Details
    const corporateBulkJdDetails: DbCorporateBulkJdDto =
      corporateBulkJdResponse[0];

    // Construct the email address object
    const toAddress: EmailSourceDestinationAddress = {
      email: cvExtractedParsed.candidateEmail,
      fullName: cvExtractedParsed.candidateName,
    };

    // Initialize email promise
    let emailPromises: Promise<{
      awsMessageId: string | null;
      systemLogId: string | null;
    }>;

    // Initialize whatsapp promise
    let whatsAppPromises: Promise<{
      systemLogId: string | null;
      whatsAppBusinessPartnerSendMessageResponseId: string | null | undefined;
    }>;

    // Check if the matching score is greater than given threshold
    if (
      corporateBulkJdResumeDetails.matchingScore >=
      APP_CONSTANTS.MATCHING_SCORES
        .CORPORATE_BULK_JD_RESUME_MINIMUM_MATCHING_SCORE
    ) {
      const whatsAppBusinessPartnerPlaceholders: WhatsAppBusinessPartnerTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE =
        {
          candidateName: cvExtractedParsed.candidateName.toTitleCase(),
          companyName: companyDetails.name.toTitleCase(),
          jobTitle: corporateBulkJdDetails.jobTitle.toTitleCase(),
          matchingScore: corporateBulkJdResumeDetails.matchingScore.toString(),
        };

      // sending a whatsapp message to the candidate using the "WHATSAPP BUSINESS PARTNER API INTEGRATION"
      whatsAppPromises =
        whatsAppBusinessPartnerLibraryObj.sendWhatsAppBusinessPartnerWhatsappMessage(
          WhatsAppBusinessPartnerTemplateNameEnum.CAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE,
          cvExtractedParsed.candidatePhoneNumber.strtr({ "+": "" }), // To Phone Number
          whatsAppBusinessPartnerPlaceholders,
          cvExtractedParsed.candidateEmail,
          corporateBulkJdResumeId, // `contextId` is the `id` attribute in `CorporateBulkJdResume.model.ts`
          UserContextTypeEnum.CORPORATE_BULK_JD_RESUME // contextType
        );

      // Construct the email placeholders object
      const emailPlaceholders: EmailTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE =
        {
          candidateName: cvExtractedParsed.candidateName.toTitleCase(),
          companyName: companyDetails.name.toTitleCase(),
          jobTitle: corporateBulkJdDetails.jobTitle.toTitleCase(),
          matchingScore: corporateBulkJdResumeDetails.matchingScore,
          signUpUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_SIGNUP_URL,
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        };

      // Send email to the candidate
      emailPromises = emailLibrary.sendEmail(
        EmailTemplateEnum.CAND_CORPORATE_BULK_JD_RESUME_HIGH_MATCHING_SCORE,
        toAddress,
        emailPlaceholders
      );
    } else {
      const whatsAppBusinessPartnerPlaceholders: WhatsAppBusinessPartnerTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE =
        {
          candidateName: cvExtractedParsed.candidateName.toTitleCase(),
          companyName: companyDetails.name.toTitleCase(),
          jobTitle: corporateBulkJdDetails.jobTitle.toTitleCase(),
        };

      // sending a whatsapp message to the candidate using the "WHATSAPP BUSINESS PARTNER API INTEGRATION"
      whatsAppPromises =
        whatsAppBusinessPartnerLibraryObj.sendWhatsAppBusinessPartnerWhatsappMessage(
          WhatsAppBusinessPartnerTemplateNameEnum.CAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE,
          cvExtractedParsed.candidatePhoneNumber.strtr({ "+": "" }), // To Phone Number
          whatsAppBusinessPartnerPlaceholders,
          cvExtractedParsed.candidateEmail,
          corporateBulkJdResumeId, // `contextId` is the `id` attribute in `CorporateBulkJdResume.model.ts`
          UserContextTypeEnum.CORPORATE_BULK_JD_RESUME // contextType
        );

      // Construct the email placeholders object
      const emailPlaceholders: EmailTemplatePlaceholderCAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE =
        {
          candidateName: cvExtractedParsed.candidateName.toTitleCase(),
          companyName: companyDetails.name.toTitleCase(),
          jobTitle: corporateBulkJdDetails.jobTitle.toTitleCase(),
          signUpUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_SIGNUP_URL,
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        };

      // Send email to the candidate
      emailPromises = emailLibrary.sendEmail(
        EmailTemplateEnum.CAND_CORPORATE_BULK_JD_RESUME_LOW_MATCHING_SCORE,
        toAddress,
        emailPlaceholders
      );
    }

    // Wait for both email and whatsapp promises to resolve
    await Promise.all([emailPromises, whatsAppPromises,this.performCandProfileDatabaseActivitiesAfterBulkScreening(
      corporateBulkJdResumeDetails,
      companyDetails,
      cvExtractedParsed
    )]);

    return true;
  }

  /**
   * getAllCorporateBulkJdResumesWithoutPagination
   *
   * Retrieves all corporate bulk job description resumes without pagination.
   *
   * @param {string | undefined} [corporateBulkJdId] - The optional corporate bulk job description ID.
   * If provided, resumes related to this ID will be fetched.
   *
   * @returns {Promise<DbCorporateBulkJdResumeDto[]>} - A promise that resolves to an array
   * of corporate bulk job description resume data.
   */
  async getAllCorporateBulkJdResumesWithoutPagination(
    corporateBulkJdId?: string
  ): Promise<DbCorporateBulkJdResumeDto[]> {
    // Logging the action
    global.logger.info(
      `Processing request to get all Corporate Bulk Jd Resumes Without Pagination. [SERVICE]`,
      {
        filePath: __filename,
        methodName: this.getAllCorporateBulkJdResumesWithoutPagination.name,
        corporateBulkJdId: corporateBulkJdId,
      }
    );

    // Initialize internal variables
    let lastKeyInternal: ObjectType | undefined = undefined;
    let pageSizeInternal = 50;

    // Initialize the response
    let allCorporateBulkJdResumesWithoutPagination: DbCorporateBulkJdResumeDto[] =
      [];

    // Continue fetching the data until all the data is fetched
    do {
      // Construct the filter options
      const filterOptions: CorporateBulkJdResumeFilterOptions = {
        corporateBulkJdId: corporateBulkJdId,
        lastKey: lastKeyInternal,
        pageSize: pageSizeInternal,
      };

      // Get a batch of corporate bulk job description resumes by filter options
      const corporateBulkJdResumesResponse: PaginatedResultsWithMatchingConditionsResponse<DbCorporateBulkJdResumeDto> =
        await corporateBulkJdResumeDaoObj.getCorporateBulkJdResumesByFilterOptions(
          filterOptions
        );

      // Destructure the response
      const {
        lastKey,
        count,
        timesQueried,
        queriedCount,
        ...corporateBulkJdResumesData
      } = corporateBulkJdResumesResponse;

      // Convert the data to an array
      const corporateBulkJdResumesArray: DbCorporateBulkJdResumeDto[] =
        Object.values(corporateBulkJdResumesData);

      // Add all the corporate bulk job description resumes to the array
      allCorporateBulkJdResumesWithoutPagination =
        allCorporateBulkJdResumesWithoutPagination.concat(
          corporateBulkJdResumesArray
        );

      // Set the last key
      lastKeyInternal = lastKey ?? undefined;
    } while (lastKeyInternal);

    // return the data array
    return allCorporateBulkJdResumesWithoutPagination;
  }

  /**
   * getCorporateBulkJdResumesByFilterOptions
   *
   * Retrieves corporate bulk job description resumes based on the provided filter options.
   *
   * @param {CorporateBulkJdResumeFilterOptions} filterOptions - The filtering criteria used to
   * query the corporate bulk JD resumes. This includes options such as status, corporate bulk JD ID,
   * sort order, date range, and search text.
   *
   * @returns {Promise<PaginatedResultsWithMatchingConditionsResponse<DbCorporateBulkJdResumeDto>>} -
   * A promise that resolves to a paginated response containing an array of corporate bulk JD resume
   * entries matching the filter criteria.
   */
  async getCorporateBulkJdResumesByFilterOptions(
    filterOptions: CorporateBulkJdResumeFilterOptions
  ): Promise<
    PaginatedResultsWithMatchingConditionsResponse<DbCorporateBulkJdResumeDto>
  > {
    // logger
    global.logger.info(
      "Getting Corporate Bulk JD Resumes By Filter Options. [Service]",
      {
        filePath: __filename,
        methodName: this.getCorporateBulkJdResumesByFilterOptions.name,
      }
    );

    return corporateBulkJdResumeDaoObj.getCorporateBulkJdResumesByFilterOptions(
      filterOptions
    );
  }

  /**
   * getCorporateBulkJdResumeById
   *
   * Retrieves a corporate bulk job description resume by its unique identifier.
   *
   * @param {string} corporateBulkJdResumeId - The unique identifier of the corporate bulk job description resume.
   * @returns {Promise<DbCorporateBulkJdResumeDto>} - A promise that resolves to the corporate bulk job description resume details.
   * @throws {BaseError} If the corporate bulk job description resume is not found.
   */
  async getCorporateBulkJdResumeById(
    corporateBulkJdResumeId: string
  ): Promise<DbCorporateBulkJdResumeDto> {
    // logger
    global.logger.info(
      "Get Corporate Bulk Job Description Resume by id [Service]",
      {
        filePath: __filename,
        methodName: this.getCorporateBulkJdResumeById.name,
      }
    );

    // get corporate bulk jd
    const corporateBulkJdResumeDetails: QueryResponse<DbCorporateBulkJdResumeDto> =
      await corporateBulkJdResumeDaoObj.getCorporateBulkJdResumeById(
        corporateBulkJdResumeId
      );
    if (!corporateBulkJdResumeDetails.count) {
      throw new BaseError(
        `Corporate Bulk Job Description Resume Details Not found`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    return corporateBulkJdResumeDetails[0];
  }
}

// Create an instance of the CorporateBulkJdResumeService class and export it
const corporateBulkJdResumeServiceObj = new CorporateBulkJdResumeService();
export { corporateBulkJdResumeServiceObj, CorporateBulkJdResumeService };
