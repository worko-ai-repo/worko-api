// Import DTOs
import { RecordListingFilterOptions, RecordListingFilterRequestDTO } from "./Common.dto";

// Import Enums
import { CorporateUserInviteAccessTypeEnum, CorpInviteStatusEnum, CorporateUserInviteDbPricingPlanEnum } from "../enums/CorporateUserInvite.enum";

/**
 * CorporateUserInviteCreateApiDto
 * 
 * This DTO is used to validate and structure the data received from the client (API request).
 * 
 * @see {CorporateUserInviteAccessTypeEnum}  - The type of access the user is requesting.
 */
export interface CorporateUserInviteCreateApiDto {
    companyId: string;
    corporateUserType: CorporateUserInviteAccessTypeEnum; // The type of access the user is requesting.
    email: string; // User Email to send the invite
    firstName: string; // Need firstName of the user
    lastName: string; // Need lastName of the user
    phoneNumberDetails: CorporateUserInviteDbPhoneNumberDetailDto;
    pricingPlan?: CorporateUserInviteDbPricingPlanEnum;
    cvDuplicacyAccess?: boolean;
}

/**
 * CorporateUserInviteCreateDto
 * 
 * This is the DTO used to create a new access request for the company. Specially used by the backend team.
 * 
 * @extends CorporateUserInviteCreateApiDto
 * 
 * @see {CorpInviteStatusEnum}  - The inviteStatus of the corporate invite.
 */
export interface CorporateUserInviteCreateDto extends CorporateUserInviteCreateApiDto {
    companyName?: string; //  This Will be used only in the response that is send back to the user.
    inviteStatus: CorpInviteStatusEnum; // The inviteStatus of the corporate invite. Enum [AWAITING, ACCEPTED]

    createdByUserId?: string;
    createdByCorporateUserId?:string;
    
    expiresAt: Date; // The expiration date of the invite.
} 

/**
 * CorporateUserInviteUpdateApiDto
 *
 * This is the DTO comes in the requestBody used to update the access request for the company.
 */
export interface CorporateUserInviteUpdateApiDto {
    cvDuplicacyAccess?: boolean;
    inviteStatus?: CorpInviteStatusEnum; // The inviteStatus of the corporate invite. Enum [AWAITING, ACCEPTED, EXPIRED]
}

export interface CorporateUserInviteSoftDeleteApiDto {
    reasonForRevokingInvite: string;
}

/**
 * CorporateUserInviteLisitngFilterOptionsDTO
 * 
 * The DTO that will be used to keep the request query params for the Corporate Invite Listing.
 * 
 * @extends RecordListingFilterRequestDTO - The base DTO for the record listing filter requests.
 * 
 * @see {CorporateUserInviteAccessTypeEnum}  - The type of access the user is requesting.
 * @see {CorpInviteStatusEnum}  - The inviteStatus of the corporate invite.
 */
export interface CorporateUserInviteLisitngFilterOptionsDTO extends RecordListingFilterRequestDTO {
    companyId?: string;
    corporateUserType?: CorporateUserInviteAccessTypeEnum;
    email?: string;
    firstName?: string;
    lastName?: string;
    inviteStatus?: CorpInviteStatusEnum;
    includeCompanyDetails?: boolean;
    includeRegisteredCorporateDetails?: boolean;
}

/**
 * CorporateUserInviteLisitngFilterOptions
 * 
 * This is the DTO used by the backend team to filter the corporate invites.
 * 
 * @extends RecordListingFilterOptions - The base DTO for the record listing filter used by backend team.
 * 
 * @see {CorporateUserInviteAccessTypeEnum}  - The type of access the user is requesting.
 * @see {CorpInviteStatusEnum}  - The inviteStatus of the corporate invite.
 */
export interface CorporateUserInviteLisitngFilterOptions extends RecordListingFilterOptions {
    companyId?: string;
    corporateUserType?: CorporateUserInviteAccessTypeEnum;
    email?: string;
    firstName?: string;
    lastName?: string;
    inviteStatus?: CorpInviteStatusEnum;
    includeCompanyDetails?: boolean;
    includeRegisteredCorporateDetails?: boolean;
}

export interface CorporateUserInviteCommonUpdateDto {
  evaluatorCognitoUserId: string;

  inviteStatus: CorpInviteStatusEnum;

  updatedByUserId: string;
  updatedByCorporateUserId: string;

  expiresAt: Date;
  isDeleted: boolean;
  reasonForRevoke: string;
  deletedByUserId: string;
  deletedByCorporateUserId: string;
}

export interface CorporateUserInviteDbPhoneNumberDetailDto {
    countryCode: number; // 91
    phoneNumber: number; // 9xxxxxxxxx
}