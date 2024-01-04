export interface UserEducationDTO {
  collage: string;
  degree: string;
  startedYear?: number;
  passingYear: number;
  grade?: string;
  field?: string;
}

export interface UserEducationDTOWithId extends UserEducationDTO {
  PK: string;
  SK: string;
}
