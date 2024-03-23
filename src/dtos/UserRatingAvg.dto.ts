// Import enums
import { UserReviewCandContext, UserReviewEmpContext } from "../enums/User.enum";
import { MasterServiceCode } from "../enums/MasterService.enum";

/**
 * UserRatingAvgCreateDTO
 */
export interface UserRatingAvgCreateDTO {
  overallRating: number; // The overall rating considering both candidate and employee roles
  overallForCand: number; // The overall rating for the candidate role
  overallForEmp: number; // The overall rating for the employee role
  contextWise: {
    context: UserReviewEmpContext | UserReviewCandContext;
    subContext: MasterServiceCode;
    sum: number;
    len: number;
    avg: number;
  }[];
}
