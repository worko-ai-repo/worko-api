export interface UserSkillDTO {
  coreSkills?: {
    masterSkillId?: string;
    otherSkillName?: string;
    years: number;
    timestamps?: {
      createdAt: string;
      updatedAt: string;
    };
  }[];
  softSkills?: {
    masterSkillId?: string;
    otherSkillName?: string;
    timestamps?: {
      createdAt: string;
    };
  }[];
  certifications?: {
    masterCertId?: string;
    otherCertName?: string;
    timestamps?: {
      createdAt: string;
    };
  }[];
}
