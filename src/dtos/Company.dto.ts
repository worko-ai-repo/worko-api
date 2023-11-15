// This interface represents a Data Transfer Object (DTO) for a Candidate.

import { WorkoDTO } from "./Worko.dto";

// It defines the structure of the data that can be sent or received when working with candidates.
export interface CompanyDTO extends WorkoDTO {
  name: String;
  industry: String;
  teamSize: Number;
  carrierPage: String;
  linkedIn: String;
  logoUrl: String;
}
