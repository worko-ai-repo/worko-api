export interface UserSocialProfileDTO {
  twitter?: string[];
  github?: string[];
  linkedin?: string[];
  otherSocialPlatForms?: Record<string, string[]>;
}

export interface UserSocialProfileDTOWithPrimaryKeys extends UserSocialProfileDTO {
  PK?: string;
  SK?: string;
}