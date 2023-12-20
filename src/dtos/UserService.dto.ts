export interface UserServiceRequestDTO {
  mentorLevel: number;
  slot1: Date;
  slot2: Date;
  slot3: Date;
  details?: string;
  masterServiceId: string;
}

export interface UserServiceInterviewGuidanceRequestDTO {
  mentorLevel: number;
  slot1: Date;
  details?: string;
  masterServiceId: string;
  role: string;
}
