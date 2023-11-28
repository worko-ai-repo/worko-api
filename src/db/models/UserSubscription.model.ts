import * as dynamoose from "dynamoose";
//
import { DB_CONSTANTS } from "../DB.constants";
import { BaseDbDto, DBBaseSchema, model } from "./Base.model";

class UserSubsDbDto extends BaseDbDto {
  "amount": Number;
  "status": String;
  "expiryDate": Date;
  "purchaseDate": Date;
  "GSI1PK": String;
  "GSI1SK": String;
}

const UserSubscriptionSchema = new dynamoose.Schema(
  {
    ...DBBaseSchema.attributes, // Use the attributes property from DBBaseSchema
    // subList: {
    //   type: [],
    //   required: true,
    // },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    GSI1PK: {
      type: String,
      required: true,
    },
    GSI1SK: {
      type: String,
      required: true,
    },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

const UserSubModel = dynamoose.model<UserSubsDbDto>(
  "UserSubs",
  UserSubscriptionSchema
);
model.registerModel(UserSubModel);
// const UserTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
//   UserSubModel,
// ]);
export { UserSubModel };
