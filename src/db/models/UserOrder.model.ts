// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// import Enums
import { UserOrderStatusEnum , UserOrderTypeEnum} from "../../enums/UserOrder.enum";

// Define the structure for User Order Database Data Transfer Object (DTO)
class DbUserOrderDto extends BaseDbDto {
    GSI1PK!: string;
    GSI1SK!: string;
    id!: string;
    userId!: string;
    status!: UserOrderStatusEnum;
    pgatewayStatus?: string; // @todo : this should from enum
    subTotalAmount!: number;
    discountAmount!: number;
    gstAmount!: number;
    finalAmount!: number;
    orderType! : UserOrderTypeEnum;
}

// Define the schema for the order model using DynamoDB
const UserOrderSchema = new dynamoose.Schema(
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
        userId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
        },
        pgatewayStatus: {
            type: String,
            required: false
        },
        subTotalAmount: {
            type: Number,
            required: true
        },
        discountAmount: {
            type: Number,
            required: true
        },
        gstAmount: {
            type: Number,
            required: true
        },
        finalAmount: {
            type: Number,
            required: true
        },
        orderType: {
            type: String,
            required: true
        },
    },
    {
        ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
    }
);

// Create the UserOrderModel using the defined schema
const UserOrderModel = dynamoose.model<DbUserOrderDto>(
    "UserOrder",
    UserOrderSchema
);

// Export the UserOrderModel
export { UserOrderModel, DbUserOrderDto };
