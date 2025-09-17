// Load the npm packages
import * as dynamoose from "dynamoose";
import { ModelType } from "dynamoose/dist/General";
import { Schema } from "dynamoose/dist/Schema";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

/**
 * Define the structure for User Detail Settings Database Data Transfer Object (DTO)
 */
class DbUserDetailSettingDto extends BaseDbDto {
  /**
   * id
   */
  id!: string;

  /**
   * subscribedEmailId
   *
   * @description This field is used to store the email which was entered as input while loggedIn user subscribing.
   */
  subscribedEmailId?: string;

  /**
   * jobNotification
   * 
   * @description This field is used to store, whether the job should notify to the subscribed user or not.
   */
  jobNotification?: boolean;
}

/**
 * Define the structure for User Detail Settings Database Schema
 */
const UserDetailSettingSchema: Schema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    id: {
      type: String,
      required: true,
    },
    subscribedEmailId: {
      type: String,
      required: false,
    },
    jobNotification: {
      type: Boolean,
      required: false,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserDetailSettingModel using the defined schema
const UserDetailSettingModel: ModelType<DbUserDetailSettingDto> = dynamoose.model<DbUserDetailSettingDto>(
  "UserDetailSetting",
  UserDetailSettingSchema
);

// Export the UserDetailSettingModel
export { UserDetailSettingModel, DbUserDetailSettingDto };