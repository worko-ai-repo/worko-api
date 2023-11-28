// UserDetailsModel.ts
import { DB_CONSTANTS } from "../DB.constants";
import * as dynamoose from "dynamoose";
import { BaseDbDto, DBBaseSchema, model } from "./Base.model";

class UserDetailsDbDto extends BaseDbDto {
  firstName!: string;
  lastName!: string;
  emailList!: { [key: string]: string };
}

const UserDetailsSchema = new dynamoose.Schema(
  {
    ...DBBaseSchema.attributes, // Use the attributes property from DBBaseSchema
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    emailList: {
      type: Object,
      required: true,
    },
    // emailList: {
    //   type: Object,
    //   schema: {
    //     work: {
    //       type: String,
    //       required: true,
    //     },
    //   },
    //   required: true,
    // },
    // Add other user-specific attributes here
  },
  {
    ...DB_CONSTANTS.WORKO_MODEL_SCHEMA_OPTIONS,
  }
);

const UserDetailsModel = dynamoose.model<UserDetailsDbDto>(
  "UserDetails",
  UserDetailsSchema
); //  <UserDetailsDbDto>
model.registerModel(UserDetailsModel);
// const WorkoTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
//   UserDetailsModel,
// ]);
export { UserDetailsModel };
