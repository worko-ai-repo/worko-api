// import dynamoose packages
import { ObjectType } from "dynamoose/dist/General";

// import dtos
import { RecordListingFilterOptions, RecordListingFilterRequestDTO } from "./Common.dto";
import { CorporateBulkJdResumePreSignedUrlToUploadDto, PreSignedUrlToUploadFileResponseDto } from "./File.dto";

// import enums
import { CorporateBulkJdResumeProcessingStatusEnum } from "../enums/CorporateBulkJdResume.enum";

/**
 * CorporateBulkJdResumeFilterOptions
 *
 * It is similar to "CorporateBulkJdResumeFilterRequestDTO" but `CorporateBulkJdResumeFilterOptions` would be used in the backend to perform business logic.
 */
export interface CorporateBulkJdResumeFilterOptions extends RecordListingFilterOptions {
  status?: CorporateBulkJdResumeProcessingStatusEnum;
  corporateBulkJdId?: string; // refer `CorporateBulkJd` model
  companyId?: string
}

/**
 * CorporateBulkJdResumeFilterRequestDTO
 * 
 * It is similar to "CorporateBulkJdResumeFilterOptions" but `CorporateBulkJdResumeFilterRequestDTO` will come from the request payload(From frontend)
 */
export interface CorporateBulkJdResumeFilterRequestDTO extends RecordListingFilterRequestDTO {
  status?: CorporateBulkJdResumeProcessingStatusEnum;
  corporateBulkJdId?: string; // refer `CorporateBulkJd` model
  companyId?: string
}

/**
 * CorporateBulkJdResumeCreateApiDto
 * 
 * This interface is just to define the representation for the request DTO from Frontend for bulk cvs to 
 * generate the pre-signed urls to upload in aws s3 and store in db
 */
export interface CorporateBulkJdResumeCreateApiDto {
  bulkCvs: Array<CorporateBulkJdResumePreSignedUrlToUploadDto>;
}

/**
 * CorporateBulkJdResumeCreateResponseDto
 * 
 * This interface is just to define the representation for the response DTO 
 * for the API that returns the pre signed url to upload files for bulk cvs.
 */
export interface CorporateBulkJdResumeCreateResponseDto {
  corporateBulkJdId: string;
  bulkCvs: PreSignedUrlToUploadFileResponseDto[];

  /**
   * This is an array of bulkCvs that are not stored in the aws dynamo db database.
   */
  bulkCvsStorageFailed: ObjectType[];
}

/**
 * CorporateBulkJdResumesCreateDto
 * 
 * This interface is used to create a item in the `CorporateBulkJdResume` model in dynamodb
 */
export interface CorporateBulkJdResumesCreateDto {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
  id: string;
  companyId: string;
  corporateBulkJdId: string;
  processingStatus: CorporateBulkJdResumeProcessingStatusEnum;
  matchingScore: number;
  userFileName: string;
  cloudFileName: string;
  createdByUserId?: string;
  createdByCorporateUserId?: string;
}

/**
 * CorporateBulkJdResumeCvExtractedParsedDto
 * 
 * This interface is used to store the extracted data from the uploaded cv
 * Refer `cvExtractedParsed` attribute in `CorporateBulkJdResume.model.ts`
 */
export interface CorporateBulkJdResumeCvExtractedParsedPartialDto {
  candidateCurrentCompany: string;
  candidateCurrentDesignation: string;
  candidateEmail: string;
  candidateExperience: string;
  candidateLocation: string;
  candidateName: string;
  candidatePhoneNumber: string;
}


export interface CorporateBulkJdResumeDbCvExtractedParsedDto {
  candidateName: string; //  "Rohith Appala";
  candidateEmail: string; // "rohithappala777@gmail.com";
  candidatePhoneNumber: string; // "+919666308100";
  candidateNumber: number; // 9666308100;
  candidatePhoneCountryCode: number; // 91;
  candidateCurrentCompany?: string; // "Worko.ai-India";
  candidateCurrentDesignation?: string; // "NodeJs Backend Developer";
  candidateExperience?: number; // 3;
  candidateTotalYOE?: number; // 3;
  candidateRelevantYOE?: number; // 4;
  candidateCurrentCTC?: number; // 10;
  candidateExpectedCTC?: number; // 9;
  candidateNoticePeriod?: number; // 60;
  candidateLocation?: string; // "Hyderabad, Telangana";
  candidateReadyToRelocate?: boolean; // false;
  isNoticePeriodNegotiable?: boolean; // false;
  about?: string;
  education?: {
    collage: string;
    degree: string;
    startedYear?: number;
    passingYear: number;
    grade?: string;
    field?: string;
  }[];
  multipleCandidateExperience?: {
    companyId?: string;
    companyName: string;
    designation: string;
    department?: string;
    YOE?: number;
    startDate?: string;

    /**
     * endDate
     *
     * @description if endDate is not provided or empty string, it will be considered as ongoing experience
     */
    endDate?: string;
  }[];
  coreSkills?: {
    skillName: string;
    years: number;
    timestamps?: {
      createdAt: string;
      updatedAt: string;
    };
  }[];
  technicalSkills?: {
    skillName: string;
    years: number;
    timestamps?: {
      createdAt: string;
      updatedAt: string;
    };
  }[];
  userPreferredDepartments?: string[];
  userPreferredIndustries?: string[];
  userPreferredlocations?: string[];
  userPreferredRoles?: string[];
}