import * as dynamoose from "dynamoose";
import Worko from "../db/Dynamoose.config";
import { DB_CONSTANTS, DBSchema } from "../db/DB.constants";

// Subscription related constants here
const USER_CONSTANTS = {
  MODEL: "User",
  PK: "USER#EMAIL",

  // Sort key prefixes
  SK_ID: "ID#",
  SK_ROLE: "ROLE#",
  SK_TYPE: "TYPE#",
  SK_SKILL: "SKILL#",
  SK_EMAILS: "EMAILS#",
};

// Strongly typed model for Subscription
//   export class SubscriptionDao extends Worko {
//     "name": String;
//     "amount": Number;
//     "duration": Number;
//   }

const UserModel = dynamoose.model(USER_CONSTANTS.MODEL, DBSchema);

const SubscriptionTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
  UserModel,
]);

export { UserModel, USER_CONSTANTS };
