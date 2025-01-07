
// import dtos
import { RecordListingFilterOptions, RecordListingFilterRequestDTO } from "./Common.dto";

// import enums
import { JobApplicationStatus } from "../enums/UserJobApplication.enum";

// import types
import { JobApplicationRejectedByUserIdType, JobApplicationStatusTrackerType, JobApplicationUserType, JobApplicationUserTypeWithAdmin } from "../types/UserJobApplication.type";

/**
 * UserJobApplicationCreateApiDTO
 * 
 * Data required from the API to create a user's job application.
 * Focuses on the essentials needed to initiate the request.
 */
export interface UserJobApplicationCreateApiDTO {
  companyId: string;
  companyName: string;
  jobUrl: string;
  jdExtracted: string;
  jobId: string;
  jobTitle: string;
  jobPortal?: string;
}

/**
 * UserJobApplicationListingFilterOptions
 *
 * It is similar to "UserJobApplicationListingFilterRequestDTO" but `UserJobApplicationListingFilterOptions` would be used in the backend to perform business logic.
 */
export interface UserJobApplicationListingFilterOptions extends RecordListingFilterOptions {
  status?: JobApplicationStatus,
  jobId?: string, // Job ID of the posted job 
  companyId?: string,
  userEmail?: string,
  userType?: JobApplicationUserType
}

/**
 * UserJobApplicationListingFilterRequestDTO
 * 
 * It is similar to "UserJobApplicationListingFilterOptions" but `UserJobApplicationListingFilterRequestDTO` will come from the request payload(From frontend)
 */
export interface UserJobApplicationListingFilterRequestDTO extends RecordListingFilterRequestDTO {
  status?: JobApplicationStatus,
  jobId?: string, // Job ID of the posted job 
  companyId?: string,
  userEmail?: string,
  userType?: JobApplicationUserType
}

/**
 * UserJobApplicationUpdateApiDTO
 * 
 * Data required from the API to update a user's job application.
 * NOTE: This Comes from the request body of the API i.e from the frontend
 */
export interface UserJobApplicationUpdateApiDTO {
  userId: string; // The ID of the corporate user i.e `CorporateUser` model
  status: JobApplicationStatus;
  emailId: string; // The email ID of the corporate user i.e `CorporateUser` model
  reason?: string;
  userComment?: string;
  userType: JobApplicationUserTypeWithAdmin;
}

/**
 * UserJobApplicationInternalUpdateDto
 * 
 * Data required from the API to update a user's job application.
 * NOTE: This is an internal update interface which would be used in the backend.
 */
export interface UserJobApplicationInternalUpdateDto {
  status: JobApplicationStatus;
  rejectedByUserId?: JobApplicationRejectedByUserIdType;
  statusTracker: JobApplicationStatusTrackerType;
}

/**
 * UserJobApplicationRequestFeedbackApiDTO
 * 
 * Data required from the API to request feedback on a user's job application.
 */
export interface UserJobApplicationRequestFeedbackApiDTO {
  /**
   * applicationDate
   *
   * Sample value of `applicationDate`: 2024-12-17T11:36:46.753+00:00
   */
  applicationDate: string;
}