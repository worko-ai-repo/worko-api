import * as dynamoose from "dynamoose";

//Local
import { DB_CONSTANTS } from "../DB.constants";
import { DBBaseSchema } from "./Base.model";
import { model } from "./Base.model";

const UserSchema = new dynamoose.Schema(
  {
    ...DBBaseSchema.attributes,
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

// const UserModel = model.createDbModel("User", UserSchema);
const UserModel = dynamoose.model("User", UserSchema);
model.registerModel(UserModel);
// const WorkoTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
//   UserModel,
// ]);

export { UserModel };
