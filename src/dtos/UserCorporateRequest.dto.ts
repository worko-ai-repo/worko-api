// Import necessary enums
import { UserCorporateRequestStatusEnum } from "../enums/User.enum";
import { UserCorporateRequestPricingPlanEnum } from "../enums/UserCorporateRequest.enum";

/**
 * UserCorporateRequestCreateApiDto
 *
 * Structure for User Corporate Request Database Data Transfer Object (DTO).
 */
export interface UserCorporateRequestCreateApiDto {
    userFullName: string;
    userEmail: string;
    contactNumber: string;
    isContactNumberVerified: boolean;
    companyName: string;
    userDesignation: string;
    userMessage: string;
    pricingPlan: UserCorporateRequestPricingPlanEnum;
}

/**
 * UserCorporateRequestCreateDto
 *
 * Structure for User Corporate Request Database Data Transfer Object (DTO).
 */
export interface UserCorporateRequestCreateDto {
    status: UserCorporateRequestStatusEnum;
    userFullName: string;
    userEmail: string;
    // @here number is string due to use of internantional numbers (+91 , +01..) 
    contactNumber: string;
    isContactNumberVerified: boolean;
    companyName: string;
    userDesignation: string;
    userMessage: string;
    pricingPlan: UserCorporateRequestPricingPlanEnum;
}

/**
 * UserCorporateRequestUpdateApiDto
 * 
 * Structure for User Corporate Request Database Data Transfer Object (DTO).
 * 
 */
export interface UserCorporateRequestUpdateApiDto {
    status: UserCorporateRequestStatusEnum;
    adminComment?: string;
}


/**
 * UserCorporateRequestUpdateDto
 * 
 * Structure for User Corporate Request Database Data Transfer Object (DTO).
 * 
*/
export interface UserCorporateRequestUpdateDto {
    status: UserCorporateRequestStatusEnum;
    adminComment?: string;
    updatedByUserId?: string;
}

/**
 * UserCorporateRequestFilterDto
 * 
 * Structure for User Corporate Request Filter Database Data Transfer Object (DTO).
 * 
 */
export interface UserCorporateRequestFilterDto {
    status?: UserCorporateRequestStatusEnum;
    userEmail?: string;
    // @here number is string due to use of internantional numbers (+91 , +01..) 
    contactNumber?: string;
}
