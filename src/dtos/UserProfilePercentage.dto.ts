export interface FieldDTO {
  field: string;
  expPerc: number;
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
