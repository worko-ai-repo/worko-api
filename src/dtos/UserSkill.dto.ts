export interface UserSkillDTO {
  coreSkills?: {
    skillName: string;
    years: number;
    timestamps?: {
      createdAt: string;
      updatedAt: string;
    };
  }[];
  softSkills?: {
    skillName: string;
    timestamps?: {
      createdAt: string;
    };
  }[];
  certifications?: {
    certName?: string;
    issuedInstitution?: string;
    completionDate?: Date;
    timestamps?: {
      createdAt: string;
    };
  }[];
}
