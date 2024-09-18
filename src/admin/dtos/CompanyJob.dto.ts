// Import Common Dto
import { RecordListingFilterOptions, RecordListingFilterRequestDTO } from '../../dtos/Common.dto';

//Import Db Models Dto
import { DbCompanyDetailDto } from '../../db/models/CompanyDetail.model';

// Import Enums
import { CompanyJobEmploymentTypeEnum, CompanyJobStatusEnum, CompanyJobWorkModeEnum } from '../../enums/CompanyJob.enum';

/**
 * IndustryCreateApiDto:
 * 
 * This DTO is used to validate and structure the data received from the client (API request).
 */
export interface CompanyJobCreateApiDto {
    companyId: string;
    jobTitle: string;
    jobDescription: string;
    otherRequirements?: string;
    experienceRange: number;
    noticePeriod: number;
    numOfOpenings: number;
    salaryRange: number;
    department: string;
    location: string;
    workMode: CompanyJobWorkModeEnum;
    typeofEmployment: CompanyJobEmploymentTypeEnum;
    coreSkills: string[]; // Array of skills like [JAVA, PYTHON] i.e skillName
    softSkills: string[]; // Array of skills like [COMMUNICATION, TEAMWORK] 
    technicalSkills: string[]; // Array of skills like [MS EXCEL, MS OFFICE, SAP] 
    mislaneiousSkills?: string[];  // Array of any skills could be from the above 3 fields. 
    status: CompanyJobStatusEnum; // This will be asked by the UI team to update the status of the Job. for eg. If the admin leaves the form and close the session it'd be saved as draft.
}

/**
 * CompanyJobCreateDto
 * 
 * This is the DTO used to create a new job for the company .Specially used by the backend team.
 * 
 * @extends CompanyJobCreateApiDto
 * 
 * @property {string} createdByUserId - The ID of the user who created the job.
 */
export interface CompanyJobCreateDto extends CompanyJobCreateApiDto {
    createdByUserId: string;
}

/**
 * CompanyJobUpdateApiDto
 * 
 * This DTO is used to validate and structure the data received from the client (API request).
 */
export interface CompanyJobUpdateApiDto {
    companyId: string;
    jobTitle?: string;
    jobDescription?: string;
    otherRequirements?: string;
    experienceRange?: number;
    noticePeriod?: number;
    numOfOpenings?: number;
    salaryRange?: number;
    department?: string;
    location?: string;
    workMode?: CompanyJobWorkModeEnum;
    typeofEmployment?: CompanyJobEmploymentTypeEnum;
    coreSkills?: string[];   //Array of skills like [JAVA, PYTHON]
    softSkills?: string[];    //Array of skills like [COMMUNICATION, TEAMWORK] */
    technicalSkills?: string[];
    mislaneiousSkills?: string[];
    status: CompanyJobStatusEnum; //This will be asked by the UI team to update the status of the Job.
}

/**
 * CompanyJobUpdateDto
 * 
 * This is the DTO used to update a job for the company .Specially used by the backend team.
 * 
 * @extends CompanyJobUpdateApiDto
 * 
 * @property {string} updatedByUserId - The ID of the user who updated the job.
 */
export interface CompanyJobUpdateDto extends CompanyJobUpdateApiDto {
    updatedByUserId: string;
}

/**
 * JobListingFilterOptions
 * 
 * This is the Dto for Receving the Query Params for the Job Listing which extends the RecordListingFilterOptionsDTO 
 * 
 * RecordListingFilterOptions is the DTO that contains the common fields for the Query Params i.e Sort, Limit, Page, Search etc.
 * and JobListingFilterOptions contains the fields that are specific to the Job Listing.
 */
export interface JobListingFilterOptions extends RecordListingFilterOptions {
    companyId?: string[];
    location?: string[];
    department?: string[];
    softSkills?: string[];
    coreSkills?: string[];
    minExperience?: number;
    maxExperience?: number;
    workMode?: CompanyJobWorkModeEnum[];
    minSalary?: number;
    maxSalary?: number;
    status: CompanyJobStatusEnum;
}

/**
 * JobListingFilterRequestDTO
 * 
 * This is the DTO used by Backend to get the Query Params for the Job Listing.
 */
export interface JobListingFilterRequestDTO extends RecordListingFilterRequestDTO {
    companyId?: string[];
    location?: string[];
    department?: string[];
    softSkills?: string[];
    coreSkills?: string[];
    minExperience?: number;
    maxExperience?: number;
    workMode?: CompanyJobWorkModeEnum[];
    minSalary?: number;
    maxSalary?: number;
    status: CompanyJobStatusEnum;
}

/**
 * JobsWithCompanyResDto
 * 
 * This DTO is used to return the Jobs with the Company Details.
 */
export interface JobsWithCompanyResDto extends CompanyJobCreateDto {
    companyDetails: DbCompanyDetailDto | null;
}