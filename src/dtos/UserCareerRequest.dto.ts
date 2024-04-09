// Import necessary enums
import { UserCareerRequestStatusEnum } from "../enums/User.enum";

/**
 * UserCareerRequestCreateApiDto
 *
 * Structure for User Career Request Database Data Transfer Object (DTO).
 */
export interface UserCareerRequestCreateApiDto {
    userFullName: string;
    userEmail: string;
    userContactNumber: string;
    userMessage: string;
    userCvFileName: string;
    userCvCloudFileName: string;

}

/**
 * UserCareerRequestCreateDto
 *
 * Structure for User Career Request Database Data Transfer Object (DTO).
 */
export interface UserCareerRequestCreateDto {
    status: UserCareerRequestStatusEnum;
    userFullName: string;
    userEmail: string;
    userContactNumber: string;
    userMessage: string;
    userCvFileName: string;
    userCvCloudFileName: string;
}

/**
 * UserCareerRequestUpdateApiDto
 * 
 * Structure for User Career Request Database Data Transfer Object (DTO).
 * 
*/
export interface UserCareerRequestUpdateApiDto {
    status: UserCareerRequestStatusEnum;
    adminComment?: string;
}

/**
 * UserCareerRequestUpdateDto
 * 
 * Structure for User Career Request Database Data Transfer Object (DTO).
 * 
*/
export interface UserCareerRequestUpdateDto {
    status: UserCareerRequestStatusEnum;
    adminComment?: string;
    updatedByUserId?: string;
}

/**
 * UserCareerRequestFilterDto
 * 
 * Structure for User Career Request Filter Database Data Transfer Object (DTO).
 * 
 */
export interface UserCareerRequestFilterDto {
    status?: UserCareerRequestStatusEnum;
    userEmail?: string;
    userContactNumber?: string;
}
