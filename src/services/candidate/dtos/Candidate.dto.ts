// This interface represents a Data Transfer Object (DTO) for a Candidate.
// It defines the structure of the data that can be sent or received when working with candidates.
export interface CandidateDTO {
  name: string; // The candidate's name (string)
  email: string; // The candidate's email address (string)
  password: string; // The candidate's password (string)
}
