// Load the npm packagesSocialProfile
import * as dynamoose from "dynamoose";

// Load the local model constants and base model functionalities
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto } from "./Base.model";

// Define the structure for User BankDetail Database Data Transfer Object (DTO)
class DbUserBankDetailDto extends BaseDbDto {
  bankDetails!: {
    bankName: string;
    holderName: string;
    ifscCode: string;
    accNumber: number;
    accType: string;
    status?: string;
    verifiedAt?: Date;
    timestamps?: {
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
  upiIds!: {
    upiId: String;
    status?: string;
    verifiedAt?: Date;
    timestamps?: {
      createdAt: Date;
      updatedAt: Date;
    };
  }[];
}

const BankDetailSchema = new dynamoose.Schema({
  BankDetail: {
    type: Object,
    schema: {
      bankName: String,
      holderName: String,
      ifscCode: String,
      accNumber: Number,
      accType: String,
      status: String,
      verifiedAt: Date,
      timestamps: Object,
    },
  },
});

const UpiIdSchema = new dynamoose.Schema({
  UpiId: {
    type: Object,
    schema: {
      upiId: String,
      status: String,
      verifiedAt: Date,
      timestamps: Object,
    },
  },
});

const UserBankDetailSchema = new dynamoose.Schema(
  {
    ...DB_CONSTANTS.WORKO_PK_SK,
    bankDetails: {
      type: Array,
      required: true,
      schema: [BankDetailSchema],
    },
    upiIds: {
      type: Array,
      required: true,
      schema: [UpiIdSchema],
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// Create the UserBankDetailModel using the defined schema
const UserBankDetailModel = dynamoose.model<DbUserBankDetailDto>(
  "UserBankDetail",
  UserBankDetailSchema
);

// Export the UserBankDetailModel
export { UserBankDetailModel };
