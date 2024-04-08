// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// import Enums
import { UserCorporateRequestStatusEnum } from "../../enums/User.enum";

// Define the structure for User Corporate Request Database Data Transfer Object (DTO)
class DbUserCorporateRequestDto extends BaseDbDto {
    GSI1PK!: string;
    GSI1SK!: string;
    id!: string;
    status!: UserCorporateRequestStatusEnum;
    userFullName!: string;
    userEmail!: string;
    contactNumber!: string;
    isContactNumberVerified!: boolean;
    companyName!: string;
    userDesignation!: string;
    userMessage!: string;
    adminMessage?: string;
    updatedByUserId?: string;
}

// Define the schema for the corporate request model using DynamoDB
const UserCorporateRequestSchema = new dynamoose.Schema(
    {
        ...DB_CONSTANTS.WORKO_PK_SK,
        GSI1PK: {
            type: String,
            index: {
                name: "GSI1",
                type: "global",
                rangeKey: "GSI1SK",
            },
            required: true
        },
        GSI1SK: {
            type: String,
            index: {
                name: "GSI1",
                type: "global",
            },
            required: true
        },
        id: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
        },
        userFullName: {
            type: String,
            required: true
        },
        userEmail: {
            type: String,
            required: true
        },
        contactNumber: {
            type: String,
            required: true
        },
        isContactNumberVerified: {
            type: Boolean,
            required: true
        },
        companyName: {
            type: String,
            required: true
        },
        userDesignation: {
            type: String,
            required: true
        },
        userMessage: {
            type: String,
            required: true
        },
        adminMessage: {
            type: String,
            required: false
        },
        updatedByUserId: {
            type: String,
            required: false
        }
    },
    {
        ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
    }
);

// Create the UserCorporateRequestModel using the defined schema
const UserCorporateRequestModel = dynamoose.model<DbUserCorporateRequestDto>(
    "UserCorporateRequest",
    UserCorporateRequestSchema
);

// Export the UserCorporateRequestModel
export { UserCorporateRequestModel, DbUserCorporateRequestDto };
