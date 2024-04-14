// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";
import { UserOtpSentViaEnum, UserOtpStatusEnum } from "../../enums/User.enum";

// Define the structure for User Support Database Data Transfer Object (DTO)
class DbUserOtpDto extends BaseDbDto {
    id!: string;
    otp!: string;
    logId!: string;
    userIpAddress!: string;
    sentTo!: string;
    sentVia!: UserOtpSentViaEnum;
    status!: UserOtpStatusEnum;
}

// Define the schema for the support model using DynamoDB
const UserOtpSchema = new dynamoose.Schema(
    {
        ...DB_CONSTANTS.WORKO_PK_SK,
        id: {
            type: String,
            required: true
        },
        otp: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
        },
        logId: {
            type: String,
            required: true,
        },
        userIpAddress: {
            type: String,
            required: true
        },
        sentTo: {
            type: String,
            required: true
        },
        sentVia: {
            type: String,
            required: true
        }
    },
    {
        ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
    }
);

// Create the SupportModel using the defined schema
const UserOtpModel = dynamoose.model<DbUserOtpDto>(
    "UserOtp",
    UserOtpSchema
);

// Export the SupportModel
export { UserOtpModel, DbUserOtpDto };