// Load the npm packages
import * as dynamoose from "dynamoose";
import { ModelType } from "dynamoose/dist/General";
import { Schema } from "dynamoose/dist/Schema";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// import Enums
import { UserGuidanceRequestTypeEnum } from "../../enums/User.enum";

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
   * updatedByUsedId
   *
   * @reference `id` attribute from `UserDetail.model.ts`
   */
  updatedByUsedId?: string;

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
    updatedByUsedId: {
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
