// Import Enums
import { MasterServiceCode } from "../enums/MasterService.enum";
import { UserReviewEmpContext, UserReviewCandContext, UserType } from "../enums/User.enum";

/**
 * UserReviewCreateApiDto
 * 
 * Structure for Create Review API action.
 */
export interface UserReviewCreateApiDto {
  ratingByUserId: string; // The user id of the user who is rating; @todo fix by reading the id from the token
  ratingForUserType: UserType; // Updated to use the enum type UserType
  rating: number; // Rating value
  reviewText?: string;
  createdByUserId: string; // @todo fix by reading the id from the token
  updatedByUserId?: string;
  reviewContext: UserReviewEmpContext | UserReviewCandContext; // ref , cand user , emp_provi  
  referalId?: string;
  masterServiceCode?: MasterServiceCode;
  serviceReqId?: string;
}

/**
 * UserReviewCreateDto
 * 
 * Structure for Create Review action.
 */
export interface UserReviewCreateDto {
  ratingByUserId: string; // The user id of the user who is rating; @todo fix by reading the id from the token
  ratingForUserId: string;
  ratingForUserType: UserType; // Updated to use the enum type UserType
  rating: number; // Rating value
  reviewText?: string;
  createdByUserId: string; // @todo fix by reading the id from the token
  updatedByUserId?: string;
  reviewContext: UserReviewEmpContext | UserReviewCandContext; // ref , cand user , emp_provi  
  referalId?: string;
  masterServiceCode?: MasterServiceCode;
  serviceReqId?: string;
}

/**
 * GetUserReceivedReviewRequestApiDto
 * 
 * Structure for query parameters for getting the reviewes received by the user. (API Action)
 */
export interface GetUserReceivedReviewRequestApiDto {
  ratingForUserType: UserType; // Updated to use the enum type UserType
  reviewContext: UserReviewEmpContext | UserReviewCandContext;
  referalId?: string;
  masterServiceCode?: MasterServiceCode;
  serviceReqId?: string;
}
