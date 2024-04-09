// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// import Enums
import { UserCareerRequestStatusEnum } from "../../enums/User.enum";

// Define the structure for User Career Request Database Data Transfer Object (DTO)
class DbUserCareerRequestDto extends BaseDbDto {
    GSI1PK!: string;
    GSI1SK!: string;
    id!: string;
    status!: UserCareerRequestStatusEnum;
    userFullName!: string;
    userEmail!: string;
    userContactNumber!: string;
    userMessage!: string;
    userCvFileName!: string;
    userCvCloudFileName!: string;
    adminComment?: string;
    updatedByUserId?: string;
}

// Define the schema for the career request model using DynamoDB
const UserCareerRequestSchema = new dynamoose.Schema(
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
        userFullName: {
            type: String,
            required: true
        },
        userContactNumber: {
            type: String,
            required: true
        },
        userMessage: {
            type: String,
            required: true
        },
        userCvFileName: {
            type: String,
            required: true
        },
        userCvCloudFileName: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
        },
        adminComment: {
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

// Create the UserCareerRequestModel using the defined schema
const UserCareerRequestModel = dynamoose.model<DbUserCareerRequestDto>(
    "UserCareerRequest",
    UserCareerRequestSchema
);

// Export the UserCareerRequestModel
export { UserCareerRequestModel, DbUserCareerRequestDto };
