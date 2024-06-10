// Load the npm packages
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";

// Load the local DTOs
import {
  BillDeskOrderCreatePlainDTO,
  BillDeskOrderCreateResponsePlainDTO,
  BillDeskTransactionResponseDecryptedDTO,
} from "../../dtos/BillDesk.dto";
import {
  RazorpayOrderCreatePlainDTO,
  RazorpayOrderCreateResponsePlainDTO,
  RazorpayTransactionResponseDecryptedDTO,
} from "../../dtos/RazorPay.dto";

// Load the local enums
import { UserOrderPaymentGatewayProviderEnum } from "../../enums/UserOrder.enum";
import { BillDeskTransactionAuthStatusEnum } from "../../enums/BillDesk.enum";
import { RazorpayTransactionStatusEnum } from "../../enums/Razorpay.enum";

// Load the local models
import { BaseDbDto } from "./Base.model";

// Define the structure for User Order Transaction Database Data Transfer Object (DTO)
class DbUserOrderTransactionDto extends BaseDbDto {
  GSI1PK!: string;
  GSI1SK!: string;
  id!: string;
  orderId!: string;
  workoPgatewayOrderId!: string;
  pgatewayOrderRequest?: BillDeskOrderCreatePlainDTO | RazorpayOrderCreatePlainDTO;
  pgatewayOrderResponse?:  BillDeskOrderCreateResponsePlainDTO | RazorpayOrderCreateResponsePlainDTO;
  pgatewayTxnResponse?:  BillDeskTransactionResponseDecryptedDTO | RazorpayTransactionResponseDecryptedDTO;
  pgatewayProvider!: UserOrderPaymentGatewayProviderEnum; 
  pgatewayOrderId?: string;
  pgatewayTxnId?: string;
  pgatewayTxnPaymentMethodType?: string;
  pgatewayTxnErrorType?: string;
  pgatewayTxnErrorCode?: string;
  pgatewayTxnErrorDesc?: string;
  pgatewayTxnStatus?: BillDeskTransactionAuthStatusEnum | RazorpayTransactionStatusEnum;
  subTotalAmount!: number;
  discountAmount!: number;
  gstAmount!: number;
  finalAmount!: number;
  userIpAddress!: string;
  userAgent!: string;
}

// Define the schema for the order transaction model using DynamoDB
const UserOrderTransactionSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    GSI1PK: {
      type: String,
      index: {
        name: "GSI1",
        type: "global",
        rangeKey: "GSI1SK",
      },
      required: true,
    },
    GSI1SK: {
      type: String,
      index: {
        name: "GSI1",
        type: "global",
      },
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    workoPgatewayOrderId: {
      type: String,
      required: true,
    },
    pgatewayOrderId: {
      type: String,
      required: false,
    },
    pgatewayTxnId: {
      type: String,
      required: false,
    },
    pgatewayOrderRequest: {
      type: Object, 
      required: false,
    },
    pgatewayOrderResponse: {
      type: Object, 
      required: false,
    },
    pgatewayProvider: {
      type: String, 
      required: true,
    },
    pgatewayTxnResponse: {
      type: Object, 
      required: false,
    },
    pgatewayTxnPaymentMethodType: {
      type: String,
      required: false,
    },
    pgatewayTxnErrorType: {
      type: String,
      required: false,
    },
    pgatewayTxnErrorCode: {
      type: String,
      required: false,
    },
    pgatewayTxnErrorDesc: {
      type: String,
      required: false,
    },
    pgatewayTxnStatus: {
      type: String,
      required: false,
    },
    subTotalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    userIpAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserOrderTransactionModel using the defined schema
const UserOrderTransactionModel = dynamoose.model<DbUserOrderTransactionDto>(
  "UserOrderTransaction",
  UserOrderTransactionSchema
);

// Export the UserOrderTransactionModel
export { UserOrderTransactionModel, DbUserOrderTransactionDto };
