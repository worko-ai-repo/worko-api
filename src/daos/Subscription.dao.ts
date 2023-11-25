// // subscription.dao.ts
// import * as dynamoose from "dynamoose";
// import Worko from "../db/Dynamoose.config";
// import { DB_CONSTANTS, DBSchema } from "../db/DB.constants";

// // Subscription related constants here
// const SUBSCRIPTION_CONSTANTS = {
//   MODEL: "Subscription",
//   SK: "SUBS#",
//   SK_INIT: "TYPE#",
//   TYPES: {
//     CANDIDATE: "CAND",
//     EMPLOYEE: "EMP",
//   },
// };

// // Strongly typed model for Subscription
// class SubscriptionDao extends Worko {
//   "name": String;
//   "amount": Number;
//   "duration": Number;

//   static SubscriptionModel = dynamoose.model(SUBSCRIPTION_CONSTANTS.MODEL, [
//     DBSchema,
//   ]);
//   static SubscriptionTable = new dynamoose.Table(
//     DB_CONSTANTS.WORKO_TABLE_NAME,
//     [SubscriptionDao.SubscriptionModel]
//   );

//   static async subscriptionList() {
//     try {
//       // return SubscriptionDao.SubscriptionModel.query("SK")
//       //   .eq(SUBSCRIPTION_CONSTANTS.SK)
//       //   .exec();
//     } catch (error) {
//       throw error;
//     }
//   }
// }

// export default SubscriptionDao;
