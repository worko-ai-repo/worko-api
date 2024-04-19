//Import necessary enums
import { UserType, UserSupportContextTypeEnum, UserSupportStatusEnum } from "../enums/User.enum";

/**
 * UserSupportCreateApiDto
 *
 * Structure for User Support Database Data Transfer Object (DTO).
 */
export interface UserSupportCreateApiDto {
    userEmail: string;
    userFirstName: string;
    userLastName?: string;
    userRole: UserType;
    userSupportType: string; // This is Predefined Type in Ui and it should be from Dropdown .
    userMessage: string;
    contextType: UserSupportContextTypeEnum;
    contextId: string;
}

/**
 * UserSupportCreateDto
 *
 * Structure for User Support Database Data Transfer Object (DTO).
 */
export interface UserSupportCreateDto {
    status: UserSupportStatusEnum;
    userId: string;
    userEmail: string;
    userFirstName: string;
    userLastName?: string;
    userRole: UserType;
    userSupportType: string;
    userMessage: string;
    contextType: UserSupportContextTypeEnum;
    contextId: string;
    createdByUserId: string;
}

/**
 * UserSupportUpdateApiDto
 * 
 * Structure for User Support Database Data Transfer Object (DTO).
 * 
 */
export interface UserSupportUpdateApiDto {
    actionByUserId: string;
    assignedToUserId?: string;
    status: UserSupportStatusEnum;
    adminComment?: string;
}

export interface UserSupportUpdateDto {
    status: UserSupportStatusEnum;
    actionByUserId: string;
    assignedToUserId?: string;
    adminComment?: string;
    updatedByUserId: string;
    resolvedByUserId?: string;
    resolvedAt?: Date;
}

export interface UserSupportFilterDto {
    status?: UserSupportStatusEnum;
    userEmail?: string;
    userSupportType?: string;
    contextType?: UserSupportContextTypeEnum;
    contextId?: string;
    assignedToUserId?: string;
    resolvedbyUserId?: string;
}

