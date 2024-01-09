export interface UserExperienceDTO {
  department: string;
  designation: string;
  designationTag?: number;
  startedMonth?: number;
  endedMonth?: number;
  startedYear?: number;
  endedYear?: number;
  companyName: string;
  emailId: string;
}

export interface UserExperienceDTOWithId extends UserExperienceDTO {
  PK: string;
  SK: string;
}
