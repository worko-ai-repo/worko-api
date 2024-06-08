// It defines the structure of the data that can be sent or received when working with candidates.
// @todo make sure to add appropriate comment for every DTO,
// mentioning the purpose and where it should be used and for which action.

import {
  RecordListingFilterOptions,
  RecordListingFilterRequestDTO,
} from "./Common.dto";

// We can come up with our own JS DOC properties like resource, action, etc. ANd update the same for all DTOs.
export interface CompanyRequestDTO {
  name: string; 
  industry: string; 
  teamSize: number; 
  carrierPage: string; 
  linkedIn: string; 
  logoUrl: string; 
  logo:  string;  
}

export interface CompanyDTO {
  // Represents the data structure for creating or updating a company.
  // Should be used in requests where a new company needs to be created or an existing one updated.
  name: string; // Company name
  industry: string; // Industry the company belongs to
  teamSize: number; // Size of the company's team
  carrierPage: string; // Carrier page URL
  linkedIn: string; // LinkedIn page URL
  logoUrl: string; // URL of the company's logo
  logo:  string;  // logo name
  isVerified: boolean;
}

interface CompanyObject {
  name: String;
  industry: String;
  teamSize: Number;
  carrierPage: String;
  linkedIn: String;
  logoUrl: String;
  logo: string;
}

export enum UserType {
  EMP = "EMP", // Employee user type
  CAND = "CAND", // Candidate user type
}

export enum Status {
  NEW = "new", // New status
  APPROVED = "approved", // Approved status
  DENIED = "denied", // Denied status
}

export interface AddCompanyDTO {
  // Represents the data structure for adding a new company.
  // Should be used when creating a new company request.
  userType: UserType; // Type of user adding the company
  companyDetail: CompanyObject; // Details of the company to be added
  status: Status; // Status of the company request
  userEmail: string;
  userContactNumber : string;
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
  // Represents the response structure for a list of companies.
  // Should be used when retrieving a list of companies.
  companies: Company[]; // Array of companies
  count: number; // Total count of companies
}

/**
 * CompanyListingFilterOptions
 *
 * It is similar to "RecordListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface CompanyListingFilterOptions extends RecordListingFilterOptions {
  // Represents the filter options for querying companies.
  // Should be used when filtering company records.
  companyName?: string; // Filter by company name
  industryName: string; // Filter by industry name
  teamSize?: string; // Filter by team size
}

/**
 * CompanyListingFilterRequestDTO
 *
 * It is similar to "RecordListingFilterRequestDTO" but it would be used in the backend to perform business logic.
 */
export interface CompanyListingFilterRequestDTO extends RecordListingFilterRequestDTO {
  // Represents the filter request DTO for querying companies.
  // Should be used when requesting to filter company records.
  companyName?: string; // Filter by company name
  industryName: string; // Filter by industry name
  teamSize?: string; // Filter by team size
}
