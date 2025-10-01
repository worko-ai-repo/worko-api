
export interface UserPreferenceCreateOrUpdateApiDto {
  email: string;
  userPreferredDepartments?: string[];
  userPreferredIndustries?: string[];
  userPreferredlocations?: string[];
  userPreferredRoles?: string[];
}

export interface UserPreferenceCreateDto extends UserPreferenceCreateOrUpdateApiDto {
  createdByUserId: string;
}

export interface UserPreferenceCommonUpdateDto {
  updatedByUserId: string;
  userPreferredDepartments: string[];
  userPreferredIndustries: string[];
  userPreferredlocations: string[];
  userPreferredRoles: string[];
}

export interface UserPreferencePartialCvExtractUpdateDto {
  userPreferredDepartments: string[];
  userPreferredlocations: string[];
}