
// @todo : Differentiate below api dtos
export interface UserReferralDTO {
  status: string;
  companyId: string;
  jobUrl: string;
  jdExtracted?: string;
  matchingScore: number;
  passedByUserIds?: Array<{ userId: string; actionDate: Date }>;
  rejectedByUserIds?: Array<{ userId: string; actionDate: Date; reason: string; userComment: string }>;
  acceptedByUserId?: string;
  acceptedAtByUser?: Date;
  doneByEmployee?: Date;
  doneByCandidate?: Date;
  withdrawnByUser?: UserReferralStatusChangeByCandDTO;
  GSI1PK: string;
  GSI1SK: string;
}

// Dto for WithdrawnByUser
export interface UserReferralStatusChangeByCandDTO {
  actionDate: Date;
  reason: string;
  userComment?: string;
}
