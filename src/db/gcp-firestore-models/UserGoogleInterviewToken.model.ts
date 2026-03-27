// Import models
import { BaseFirestoreModel } from "./Base.model";

interface UserGoogleInterviewAccountDetailsDto {
  accessToken: string;
  refreshToken: string;
  expiryDate?: string;
  scope?: string;
}

/**
 * Firestore document model for storing the user's Google Interview OAuth tokens.
 */
interface DbUserGoogleInterviewTokenDetailsDto extends BaseFirestoreModel {
  userId: string;
  hasGoogleInterviewAccountDetails: UserGoogleInterviewAccountDetailsDto;
}

export {
  DbUserGoogleInterviewTokenDetailsDto,
  UserGoogleInterviewAccountDetailsDto,
};

