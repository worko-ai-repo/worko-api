export interface UserReferralDTO {
  status: string;
  companySK: string;
  jobUrl: string;
  jdExtracted?: string;
  matchingScore: number;
  passedByUserIds?: string[];
  rejectedByUserIds?: string[];
  acceptedByUserId?: string;
  doneByEmployee?: Date;
  doneByCandidate?: Date;
  GSI1PK: string;
  GSI1SK: string;
}
