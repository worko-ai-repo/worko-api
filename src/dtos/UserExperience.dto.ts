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
  companySK: string;
  emailId?: string;
  isCurrent?: boolean;
}

export interface UserExperienceDTOWithId extends UserExperienceDTO {
  PK: string;
  SK: string;
}
