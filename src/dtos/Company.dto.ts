// It defines the structure of the data that can be sent or received when working with candidates.
// @todo make sure to add appropriate comment for every DTO, 
// mentioning the purpose and where it should be used and for which action.
// We can come up with our own JS DOC properties like resource, action, etc. ANd update the same for all DTOs.
export interface CompanyDTO {
  name: string;
  industry: string;
  teamSize: number;
  carrierPage: string;
  linkedIn: string;
  logoUrl: string;
}

interface CompanyObject {
  name: String;
  industry: String;
  teamSize: Number;
  carrierPage: String;
  linkedIn: String;
  logoUrl: String;
}

export enum UserType {
  EMP = "EMP",
  CAND = "CAND",
}

export enum Status {
  NEW = "new",
  APPROVED = "approved",
  DENIED = "denied",
}

export interface AddCompanyDTO {
  userType: UserType;
  companyDetail: Partial<CompanyObject>;
  status: Status;
}

interface Company {
  teamSize: number;
  SK: string;
  name: string;
  industry: string;
  linkedIn: string;
  logoUrl: string;
  carrierPage: string;
}

export interface CompanyListResponseDto {
  companies: Company[];
  count: number;
}
