// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User Order Product Database Data Transfer Object (DTO)
class DbUserOrderProductDto extends BaseDbDto {
    GSI1PK!: string;
    GSI1SK!: string;
    id!: string;
    orderId!: string;
    productContext!: string;
    productContextId!: string;
    productContextDetails!: Record<string, any>;
    unitPrice!: number;
    quantity!: number;
    totalAmount!: number;
}

// Define the schema for the order product model using DynamoDB
const UserOrderProductSchema = new dynamoose.Schema(
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
        orderId: {
            type: String,
            required: true
        },
        productContext: {
            type: String,
            required: true
        },
        productContextId: {
            type: String,
            required: true
        },
        productContextDetails: {
            type: Object,
            required: true
        },
        unitPrice: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        }
    },
    {
        ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
    }
);

// Create the UserOrderProductModel using the defined schema
const UserOrderProductModel = dynamoose.model<DbUserOrderProductDto>(
    "UserOrderProduct",
    UserOrderProductSchema
);

// Export the UserOrderProductModel
export { UserOrderProductModel, DbUserOrderProductDto };
