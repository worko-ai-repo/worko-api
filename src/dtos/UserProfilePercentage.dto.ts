export interface FieldDTO {
  field: string; // Examples: "name","isEmailVerified"
  expPerc: number; // Examples: 5,10
  curPerc: number;
}

export interface FieldGroupDTO {
  fieldGroup: string;
  expPerc: number;
  curPerc: number;
  fields: FieldDTO[];
}

export interface UserProfilePercentageDTO {
  candidate: FieldGroupDTO[];
  employee: FieldGroupDTO[];
}
