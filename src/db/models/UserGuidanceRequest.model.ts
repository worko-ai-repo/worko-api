// Load the npm packages
import * as dynamoose from "dynamoose";
import { ModelType } from "dynamoose/dist/General";
import { Schema } from "dynamoose/dist/Schema";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Import dtos
import {
  UserGuidanceRequestCancelledByDetailDto,
  UserGuidanceRequestMentorDetailDto,
  UserGuidanceRequestPaymentConfirmationDoneDto,
  UserGuidanceRequestPaymentConfirmationPendingDto,
  UserGuidanceRequestPaymentRequestDto,
  UserGuidanceRequestRejectedByDetailDto,
  UserGuidanceRequestReScheduleMeetingDto,
  UserGuidanceRequestScheduleMeetingDto,
  UserGuidanceRequestStatusTrackerDto,
} from "../../dtos/UserGuidanceRequest.dto";

// import Enums
import { UserGuidanceRequestTypeEnum } from "../../enums/User.enum";
import { UserGuidanceRequestStatusEnum } from "../../enums/UserGuidanceRequest.enum";

// Define the structure for User Guidance Request Database Data Transfer Object (DTO)
class DbUserGuidanceRequestDto extends BaseDbDto {
  /**
   * id
   */
  id!: string;

  /**
   * GSI1PK
   */
  GSI1PK!: string;

  /**
   * GSI1SK
   */
  GSI1SK!: string;

  /**
   * createdByUserId
   *
   * @reference `id` attribute from `UserDetail.model.ts`
   */
  createdByUserId!: string;

  /**
   * updatedByUserId
   *
   * @reference `id` attribute from `UserDetail.model.ts`
   */
  updatedByUserId?: string;

  /**
   * companyId
   *
   * @reference `id` attribute from `CompanyDetail.model.ts`
   */
  companyId?: string;

  /**
   * companyName
   */
  companyName!: string;

  /**
   * jobUrl
   */
  jobUrl!: string;

  /**
   * guidanceRequestType
   */
  guidanceRequestType!: UserGuidanceRequestTypeEnum;

  /**
   * guidanceRequestDeadline
   *
   * @description By when you need the guidance
   * @example `2025-01-27T11:26:06.458Z`
   */
  guidanceRequestDeadline!: string;

  /**
   * guidanceRequestDescription
   */
  guidanceRequestDescription!: string;

  status!: UserGuidanceRequestStatusEnum;

  statusTracker!: UserGuidanceRequestStatusTrackerDto[];

  mentorDetails?: UserGuidanceRequestMentorDetailDto;

  mentorAssignedRemarks?: string;

  scheduleMeetingDetails?: UserGuidanceRequestScheduleMeetingDto;

  rescheduleMeetingDetails?: UserGuidanceRequestReScheduleMeetingDto[];

  paymentRequestDetails?: UserGuidanceRequestPaymentRequestDto;

  paymentConfirmationPendingDetails?: UserGuidanceRequestPaymentConfirmationPendingDto;

  paymentConfirmationDoneDetails?: UserGuidanceRequestPaymentConfirmationDoneDto;

  rejectedByDetails?: UserGuidanceRequestRejectedByDetailDto;

  cancelledByDetails?: UserGuidanceRequestCancelledByDetailDto;
}

// Define the schema for the User Guidance Request
const UserGuidanceRequestSchema: Schema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    id: {
      type: String,
      required: true,
    },
    GSI1PK: {
      type: String,
      index: {
        name: "GSI1",
        type: "global",
        rangeKey: "GSI1SK",
      },
    },
    GSI1SK: {
      type: String,
      index: {
        name: "GSI1",
        type: "global",
      },
    },
    createdByUserId: {
      type: String,
      required: true,
    },
    updatedByUserId: {
      type: String,
      required: false,
    },
    companyId: {
      type: String,
      required: false,
    },
    guidanceRequestType: {
      type: String,
      required: true,
    },
    guidanceRequestDeadline: {
      type: String,
      required: true,
    },
    guidanceRequestDescription: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    statusTracker: {
      type: Array,
      required: true,
      schema: [
        {
          type: Object,
          schema: {
            oldStatus: {
              type: String,
              required: false,
            },
            newStatus: {
              type: String,
              required: true,
            },
            actionDate: {
              type: String,
              required: true,
            },
            actionByUserId: {
              type: String,
              required: true,
            },
            actionByUserType: {
              type: String,
              required: true,
            },
          },
        },
      ],
    },
    mentorDetails: {
      type: Object,
      required: false,
      schema: {
        userId: {
          type: String,
          required: true,
        },
        userEmail: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
    },
    mentorAssignedRemarks: {
      type: String,
      required: false,
    },
    scheduleMeetingDetails: {
      type: Object,
      required: false,
      schema: {
        date: {
          type: String,
          required: true,
        },
        time: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
        meetingLink: {
          type: String,
          required: false,
        }
      },
    },
    rescheduleMeetingDetails: {
      type: Array,
      required: false,
      schema: [
        {
          type: Object,
          schema: {
            date: {
              type: String,
              required: true,
            },
            time: {
              type: String,
              required: true,
            },
            actionDate: {
              type: String,
              required: true,
            },
            actionByUserId: {
              type: String,
              required: true,
            },
            actionByUserType: {
              type: String,
              required: true,
            },
          },
        },
      ],
    },
    paymentRequestDetails: {
      type: Object,
      required: false,
      schema: {
        currency: {
          type: String,
          required: true,
        },
        totalAmount: {
          type: Number,
          required: true,
        },
        platformFee: {
          type: Number,
          required: true,
        },
        guidanceFee: {
          type: Number,
          required: true,
        },
        linkForPayment: {
          type: String,
          required: true,
        },
        actionByUserId: {
          type: String,
          required: true,
        },
        actionByUserType: {
          type: String,
          required: true,
        },
        actionDate: {
          type: String,
          required: true,
        },
      },
    },
    paymentConfirmationPendingDetails: {
      type: Object,
      required: false,
      schema: {
        actionByUserId: {
          type: String,
          required: true,
        },
        actionByUserType: {
          type: String,
          required: true,
        },
        actionDate: {
          type: String,
          required: true,
        },
      },
    },
    paymentConfirmationDoneDetails: {
      type: Object,
      required: false,
      schema: {
        uniqueTransactionReference: {
          type: String,
          required: true,
        },
        actionByUserId: {
          type: String,
          required: true,
        },
        actionByUserType: {
          type: String,
          required: true,
        },
        actionDate: {
          type: String,
          required: true,
        },
      },
    },
    rejectedByDetails: {
      type: Object,
      required: false,
      schema: {
        actionByUserId: {
          type: String,
          required: true,
        },
        actionByUserType: {
          type: String,
          required: true,
        },
        actionDate: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
      },
    },
    cancelledByDetails: {
      type: Object,
      required: false,
      schema: {
        actionByUserId: {
          type: String,
          required: true,
        },
        actionByUserType: {
          type: String,
          required: true,
        },
        actionDate: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
      },
    },
    companyName: {
      type: String,
      required: true,
    },
    jobUrl: {
      type: String,
      required: true,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserGuidanceRequestModel using the defined schema
const UserGuidanceRequestModel: ModelType<DbUserGuidanceRequestDto> =
  dynamoose.model<DbUserGuidanceRequestDto>(
    "UserGuidanceRequest",
    UserGuidanceRequestSchema
  );

// Export the UserGuidanceRequestModel and DbUserGuidanceRequestDto
export { UserGuidanceRequestModel, DbUserGuidanceRequestDto };
