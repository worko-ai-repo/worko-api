export interface UserExperienceDTO {
  department: string;
  designation?: string;
  designationTag?: number;
  startedMonth?: number;
  endedMonth?: number;
  startedYear?: number;
  endedYear?: number;
  experienceInMonths?: number;
  companyName: string;
  companyId: string;
  emailId?: string; // company email id of employee
  isCurrent?: boolean;
  isEmailVerified?: boolean;
}

export interface UserExperienceDTOWithId extends UserExperienceDTO {
  PK: string;
  SK: string;
}