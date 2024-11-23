export interface UserExperienceDTO {
  companyName: string;
  companyId: string;
  department?: string;
  designation?: string;
  experienceInMonths?: number;
  emailId?: string; // company email id of employee
  isCurrent?: boolean;
  isEmailVerified?: boolean;
  designationTag?: number;
  startedMonth?: number;
  endedMonth?: number;
  startedYear?: number;
  endedYear?: number;
}

export interface UserExperienceDTOWithId extends UserExperienceDTO {
  PK: string;
  SK: string;
}