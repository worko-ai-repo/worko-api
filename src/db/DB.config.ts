// Import
import * as dynamoose from "dynamoose";

// Import DB constants
import { DB_CONSTANTS } from "./DB.constants";

// Import all models
import { CompanyModel } from "./models/Company.model";
import { CompanyDetailModel } from "./models/CompanyDetail.model";
import { CompanyRequestModel } from "./models/CompanyRequest.model";
import { UserModel } from "./models/User.model";
import { UserDetailModel } from "./models/UserDetail.model";
import { UserEmailModel } from "./models/UserEmail.model";
import { UserExperienceModel } from "./models/UserExperience.model";
import { UserSubModel } from "./models/UserSubscription.model";
import { UserReferralModel } from "./models/UserReferral.model";

/**
 * DBConfig
 *
 * Class to initialise the database connection, register dynamoose models, etc.
 */
class DBConfig {
  /**
   * constructor
   */
  constructor() {
    console.log(` -> ${DBConfig.name} <- `);
  }

  /**
   * init
   *
   * Initialise the required components to enable DynamoDB connection.
   */
  init() {
    this.setDynamoDbConnection();
    this.registerDynamooseModels();
  }

  /**
   * setDynamoDbConnection
   *
   * Set up the DynamoDB connection to couunicate with the database.
   */
  setDynamoDbConnection() {
    console.log("Establish the 'DynamoDB' connection through 'Dynamoose'.");

    // Establish the "DynamoDB" connection through "Dynamoose".
    // @todo Make sure these configuration values are used only for local env.
    // And for all other envs, the appropriate permissions needs to be for lambada function.
    const ddb = new dynamoose.aws.ddb.DynamoDB({
      credentials: {
        accessKeyId: "dntwrl",
        secretAccessKey: "l3q7zk",
      },
      region: "local",
      endpoint: "http://localhost:8000",
    });

    // Set DynamoDB instance to the Dynamoose DDB instance
    dynamoose.aws.ddb.set(ddb);
  }

  /**
   * registerDynamooseModels
   *
   * Register the models created for differet PK and SK to communicate with Dynamoose.
   */
  registerDynamooseModels() {
    console.log("Registering the all available models");
    const workoTable = new dynamoose.Table(DB_CONSTANTS.WORKO_TABLE_NAME, [
      UserDetailModel,
      UserModel,
      UserEmailModel,
      UserExperienceModel,
      UserReferralModel,
      UserSubModel,
      CompanyModel,
      CompanyDetailModel,
      CompanyRequestModel,
    ]);
  }
}

export default DBConfig;
