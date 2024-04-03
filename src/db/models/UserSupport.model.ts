// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";
import { UserType, UserSupportContextTypeEnum, UserSupportStatusEnum } from "../../enums/User.enum";

// Define the structure for User Support Database Data Transfer Object (DTO)
class DbUserSupportDto extends BaseDbDto {
    GSI1PK!: string;
    GSI1SK!: string;
    id!: string;
    status!: UserSupportStatusEnum;
    userId!: string;
    userEmail!: string;
    userFirstName!: string;
    userLastName?: string;
    userRole!: UserType;
    userSupportType!: string;
    userMessage!: string;
    contextType!: UserSupportContextTypeEnum;
    contextId?: string;
    createdByUserId!: string;
    updatedByUserId?: string;
    assignedToUserId?: string;
    adminComment?: string;
    resolvedByUserId?: string;
    resolvedAt?: Date;
}

// Define the schema for the support model using DynamoDB
const UserSupportSchema = new dynamoose.Schema(
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
        userId: {
            type: String,
            required: true
        },
        userEmail: {
            type: String,
            required: true
        },
        userFirstName: {
            type: String,
            required: false
        },
        userLastName: {
            type: String,
            required: true
        },
        userRole: {
            type: String,
            required: true,
        },
        userSupportType: {
            type: String,
            required: true
        },
        userMessage: {
            type: String,
            required: true
        },
        contextType: {
            type: String,
            required: true
        },
        contextId: {
            type: String,
            required: false
        },
        createdByUserId: {
            type: String,
            required: true
        },
        updatedByUserId: {
            type: String,
            required: false
        },
        assignedToUserId: {
            type: String,
            required: false
        },
        adminComment: {
            type: String,
            required: false
        },
        resolvedByUserId: {
            type: String,
            required: false
        },
        resolvedAt: {
            type: Date,
            required: false
        }
    },
    {
        ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
    }
);

// Create the SupportModel using the defined schema
const UserSupportModel = dynamoose.model<DbUserSupportDto>(
    "UserSupport",
    UserSupportSchema
);

// Export the SupportModel
export { UserSupportModel, DbUserSupportDto };