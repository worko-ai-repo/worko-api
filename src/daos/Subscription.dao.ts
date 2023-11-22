import * as dynamoose from "dynamoose";
import Worko from "../db/Dynamoose.config";
import { DB_CONSTANTS, DBSchema } from "../db/DB.constants";

// Subscription related constants here
const SUBSCRIPTION_CONSTANTS = {
  MODEL: "Subscription",
  SK: "SUBS#",
  SK_INIT: "TYPE#",
  TYPES: {
    CANDIDATE: "CAND",
    EMPLOYEE: "EMP",
  },
};

// Strongly typed model for Subscription
export class SubscriptionDao extends Worko {
  "name": String;
  "amount": Number;
  "duration": Number;
}

const SubscriptionModel = dynamoose.model(
  SUBSCRIPTION_CONSTANTS.MODEL,
  DBSchema
);

const SubscriptionTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
  SubscriptionModel,
]);

export { SubscriptionModel, SUBSCRIPTION_CONSTANTS };
