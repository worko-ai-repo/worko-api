
// Import dtos
import { RecordListingFilterOptions, RecordListingFilterRequestDTO } from "./Common.dto";

// Import enums
import { UserGuidanceRequestStatusEnum, UserGuidanceRequestTypeEnum } from "../enums/UserGuidanceRequest.enum";
import { UserType } from "../enums/User.enum";
import { AdminRoleEnum } from "../enums/Common.enum";

/**
 * UserGuidanceRequestCreateApiDTO
 */
export interface UserGuidanceRequestCreateApiDTO {
  /**
   * guidanceRequestType
   */
  guidanceRequestType: UserGuidanceRequestTypeEnum;

  /**
   * guidanceDeadlineDate
   *
   * @description By when you need the guidance
   * @example `2025-01-27T11:26:06.458Z` 
   */
  guidanceRequestDeadline: string;

  /**
   * companyName
   *
   * @description Any company name is allowed
   */
  companyName: string;

  /**
   * companyId
   * 
   * @description If user selects Internal Company, then this field is required
   */
  companyId?: string;

  /**
   * jobUrl
   *
   * @description Any job url allowed
   */
  jobUrl: string;

  /**
   * guidanceRequestDescription
   */
  guidanceRequestDescription: string;
}

export interface UserGuidanceRequestFilterOptions extends RecordListingFilterOptions {
  actionByUserType: AdminRoleEnum | UserType;
  email?: string;
  guidanceRequestType?: UserGuidanceRequestTypeEnum;
  companyName?: string;
  mentorId?: string;
}
export interface UserGuidanceRequestFilterRequestDTO extends RecordListingFilterRequestDTO {
  actionByUserType: AdminRoleEnum | UserType;
  email?: string;
  guidanceRequestType?: UserGuidanceRequestTypeEnum;
  companyName?: string;
  mentorId?: string;
}

export interface UserGuidanceRequestStatusTrackerDto {
  oldStatus?: UserGuidanceRequestStatusEnum;
  newStatus: UserGuidanceRequestStatusEnum;

  /**
   * Sample value of `actionDate`: 2024-12-17T11:36:46.753+00:00
   */
  actionDate: string;

  actionByUserId: string;
  actionByUserType: UserType | AdminRoleEnum;
}

export interface UserGuidanceRequestScheduleMeetingDto {
  /**
   * @example "2025-05-27T09:02:14.763+00:00"
   */
  date: string;

  /**
   * @example "7:00 pm"
   */
  time: string;

  /**
   * @example "2 hrs 30 mins"
   */
  duration: string;

  /**
   * Once the payment done by candidate and verified by worko-admin then the meeting link will be submitted by worko-admin and will be sent to candidate
   */
  meetingLink?: string;
}

export interface UserGuidanceRequestReScheduleMeetingDto {
  /**
   * @description This is the date on which the meeting is rescheduled request is raised
   * @example "2025-05-27T09:02:14.763+00:00"
   */
  date: string;

  /**
   * @example "7:00 pm"
   */
  time: string;

  /**
   * Sample value of `actionDate`: 2024-12-17T11:36:46.753+00:00
   */
  actionDate: string;

  actionByUserId: string;
  actionByUserType: UserType;
}

export interface UserGuidanceRequestPaymentRequestDto {
  /**
   * @example "INR"
   */
  currency: string;

  /**
   * @example 5000
   */
  totalAmount: number;

  /**
   * @description
   *  1. `platformFee`: 20% of `totalAmount` i.e 5000 x 0.2 = 1000
   * @example 1000
   */
  platformFee: number;

  /**
   * @description
   *  1. `guidanceFee`: 80% of `totalAmount` i.e 5000 x 0.8 = 4000
   * @example 4000
   */
  guidanceFee: number;

  linkForPayment: string;

  actionByUserId: string;
  actionByUserType: AdminRoleEnum;

  /**
   * Sample value of `actionDate`: 2024-12-17T11:36:46.753+00:00
   */
  actionDate: string;
};

export interface UserGuidanceRequestPaymentConfirmationPendingDto {
  actionByUserId: string;
  actionByUserType: UserType.CAND;

  /**
   * Sample value of `actionDate`: 2024-12-17T11:36:46.753+00:00
   */
  actionDate: string;
}

export interface UserGuidanceRequestPaymentConfirmationDoneDto {
  /**
   * uniqueTransactionReference
   *
   * 1. Unique Transaction Reference is mainly used in India for identifying bank-to-bank fund transfers.
   * 2. Unique Transaction Reference is Common in NEFT, RTGS, and IMPS transactions.
   *
   * @example "N1234567***23456"
   */
  uniqueTransactionReference: string;

  actionByUserId: string;
  actionByUserType: AdminRoleEnum;

  /**
   * Sample value of `actionDate`: 2024-12-17T11:36:46.753+00:00
   */
  actionDate: string;
}

export interface UserGuidanceRequestMentorDetailDto {
  /**
   * @reference As of now this is the `id` attribute from `UserDetail.model.ts`
   */
  userId: string;

  /**
   * @reference As of now this is the `primaryEmail` from `PK` attribute from `UserDetail.model.ts`
   */
  userEmail: string;

  /**
   * @reference `name` attribute from `UserDetail.model.ts`
   */
  name: string;
};

export interface UserGuidanceRequestRejectedByDetailDto {
  actionByUserId: string;
  actionByUserType: AdminRoleEnum;

  /**
   * Sample value of `actionDate`: 2024-12-17T11:36:46.753+00:00
   */
  actionDate: string;

  reason: string;
};

export interface UserGuidanceRequestCancelledByDetailDto {
  actionByUserId: string;
  actionByUserType: UserType.CAND;

  /**
   * Sample value of `actionDate`: 2024-12-17T11:36:46.753+00:00
   */
  actionDate: string;

  reason: string;
};

export interface UserGuidanceRequestUpdateByWorkoAdminApiDto {
  newStatus: UserGuidanceRequestStatusEnum;
  actionByUserId: string;
  actionByUserType: AdminRoleEnum;

  rejectionReason?: string;

  mentorDetails?: UserGuidanceRequestMentorDetailDto;
  scheduleMeetingDetails?: UserGuidanceRequestScheduleMeetingDto;
  mentorAssignedRemarks?: string;
  /**
   * @example "INR"
   */
  currency?: string;
  /**
   * @example 5000
   */
  totalAmount?: number;
  linkForPayment?: string;

  /**
   * uniqueTransactionReference
   *
   * 1. Unique Transaction Reference is mainly used in India for identifying bank-to-bank fund transfers.
   * 2. Unique Transaction Reference is Common in NEFT, RTGS, and IMPS transactions.
   *
   * @example "N1234567***23456"
   */
  uniqueTransactionReference?: string;

  meetingLink: string;
}

export interface UserGuidanceRequestUpdateByCandidateApiDto {
  newStatus: UserGuidanceRequestStatusEnum;
  actionByUserId: string;
  actionByUserType: UserType.CAND;

  cancelReason?: string;

  reScheduleRequestDate?: string; // Iso Date String
  reScheduleRequestTime?: string; // @example: "10:00 am"
}

export interface UserGuidanceRequestUpdateByMentorApiDto {
  newStatus: UserGuidanceRequestStatusEnum;
  actionByUserId: string;
  actionByUserType: UserType.EMP;

  reScheduleRequestDate?: string; // Iso Date String
  reScheduleRequestTime?: string; // @example: "10:00 am"
}

/**
 * @note: You must use this interface as `Partial<UserGuidanceRequestUpdateByWorkoAdminApiDto>`
 *        because this interface is used for common update guidance requests
 */
export interface UserGuidanceRequestCommonUpdateDto {
  updatedByUserId: string;
  status: UserGuidanceRequestStatusEnum;
  statusTracker: UserGuidanceRequestStatusTrackerDto[];
  mentorDetails: UserGuidanceRequestMentorDetailDto;
  mentorAssignedRemarks: string;
  scheduleMeetingDetails: UserGuidanceRequestScheduleMeetingDto;
  paymentRequestDetails: UserGuidanceRequestPaymentRequestDto;
  rejectedByDetails: UserGuidanceRequestRejectedByDetailDto;
  cancelledByDetails: UserGuidanceRequestCancelledByDetailDto;
  paymentConfirmationPendingDetails: UserGuidanceRequestPaymentConfirmationPendingDto;
  paymentConfirmationDoneDetails: UserGuidanceRequestPaymentConfirmationDoneDto;
  rescheduleMeetingDetails: UserGuidanceRequestReScheduleMeetingDto[];
}