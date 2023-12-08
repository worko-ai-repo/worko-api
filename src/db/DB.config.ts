//import
import * as dynamoose from "dynamoose";

//import DB constants
import { DB_CONSTANTS } from "./DB.constants";

//Import all models
import { CompanyModel } from "./models/Company.model";
import { CompanyDetailModel } from "./models/CompanyDetail.model";
import { CompanyRequestModel } from "./models/CompanyRequest.model";
import { UserModel } from "./models/User.model";
import { UserDetailModel } from "./models/UserDetail.model";
import { UserEmailModel } from "./models/UserEmail.model";
import { UserExperienceModel } from "./models/UserExperience.model";
import { UserRequestModel } from "./models/UserRequest.model";
import { UserSubModel } from "./models/UserSubscription.model";

class DBconfig {
  constructor() {
    console.log(" -> Register DbModel called <- ");
  }
  registerModels() {
    console.log("Registering models");
    const WorkoTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
      UserDetailModel,
      UserModel,
      UserEmailModel,
      UserExperienceModel,
      UserRequestModel,
      UserSubModel,
      CompanyModel,
      CompanyDetailModel,
      CompanyRequestModel,
    ]);
  }
}

export default DBconfig;
