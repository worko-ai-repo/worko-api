
// Import
import * as dynamoose from "dynamoose";

// Import DB constants
import APP_CONSTANTS from "../configs/constants.config";
import { DB_CONSTANTS } from "./DB.constants";

// Import all models
import { CompanyModel } from "./models/Company.model";
import { CompanyJobModel } from "./models/CompanyJob.model";
import { CompanyDetailModel } from "./models/CompanyDetail.model";
import { CompanyRequestModel } from "./models/CompanyRequest.model";
import { CompanyJobUrlModel } from "./models/CompanyJobUrl.model";
import { UserModel } from "./models/User.model";
import { UserDetailModel } from "./models/UserDetail.model";
import { UserEmailModel } from "./models/UserEmail.model";
import { UserExperienceModel } from "./models/UserExperience.model";
import { UserSocialProfileModel } from "./models/UserSocialProfile.model";
import { UserEducationModel } from "./models/UserEducation.model";
import { UserSkillModel } from "./models/UserSkill.model";
import { UserAchievementModel } from "./models/UserAchievement.model";
import { UserSubModel } from "./models/UserSubscription.model";
import { UserReferralModel } from "./models/UserReferral.model";
import { UserServiceModel } from "./models/UserService.model";
import { UserProfilePercentageModel } from "./models/UserProfilePercentage.model";
import { UserBankDetailModel } from "./models/UserBankDetail.model";
import { UserProvidedServiceModel } from "./models/UserProvidedService.model";
import { UserAvailabilityModel } from "./models/UserAvailability.model";
import { UserReferralResponseModel } from "./models/UserReferralResponse.model";
import { MasterSubscriptionModel } from "./models/MasterSubscription.model";
import { MasterServiceModel } from "./models/MasterService.model";
import { EmailTemplateModel } from "./models/EmailTemplate.model";
import { EmailLogModel } from "./models/EmailLog.model";
import { UserReviewModel } from "./models/UserReview.model";
import { UserRatingAvgModel } from "./models/UserRatingAvg.model";
import { UserSupportModel } from "./models/UserSupport.model";
import { UserOtpModel } from "./models/UserOTP.model";
import { UserCorporateRequestModel } from "./models/UserCorporateRequest.model";
import { UserCareerRequestModel } from "./models/UserCareerRequest.model";
import { UserOrderModel } from "./models/UserOrder.model";
import { UserOrderProductModel } from "./models/UserOrderProduct.model";
import { UserOrderTransactionModel } from "./models/UserOrderTransaction.model";
import { WhatsappTemplateModel } from "./models/WhatsappTemplate.model";
import { WhatsappMessageLogModel } from "./models/WhatsappMessageLog.model";

import { ScheduleJobModel } from "./models/ScheduleJob.model";

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
    this.setDynamooseConnection();
    this.registerDynamooseModels();
  }

  /**
   * setDynamooseConnection
   *
   * Set up the DynamoDB connection to couunicate with the database.
   */
  setDynamooseConnection() {
    // Log message
    global.logger.info(
      "Establish the 'DynamoDB' connection through 'Dynamoose'."
    );

    // Configuration to connect to the DynamodDB database
    let config = {};

    // If the stage is local then use then connect to the local DynamoDB
    if (process.env.APP_STAGE == APP_CONSTANTS.STAGES.LOCAL) {
      config = {
        credentials: {
          accessKeyId: process.env.APP_AWS_DYNAMODB_ACCESS_KEY_ID as string,
          secretAccessKey: process.env
            .APP_AWS_DYNAMODB_SECRET_ACCESS_KEY as string,
        },
        region: "local",
        endpoint: "http://localhost:8000",
        // convertClassInstanceToMap: true,
      };
    }
    // For other stages, the required permissions would be added in the "serverless.ts" file
    else {
      config = {
        region: process.env.APP_SLS_REGION,
      };
    }

    const ddb = new dynamoose.aws.ddb.DynamoDB(config);
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
      UserSocialProfileModel,
      UserEducationModel,
      UserSkillModel,
      UserAchievementModel,
      UserReferralModel,
      UserSubModel,
      UserServiceModel,
      UserProfilePercentageModel,
      UserBankDetailModel,
      UserProvidedServiceModel,
      UserAvailabilityModel,
      UserReferralResponseModel,
      CompanyModel,
      CompanyDetailModel,
      CompanyRequestModel,
      CompanyJobUrlModel,
      MasterSubscriptionModel,
      MasterServiceModel,
      EmailTemplateModel,
      EmailLogModel,
      UserReviewModel,
      UserRatingAvgModel,
      UserSupportModel,
      UserOtpModel,
      UserCorporateRequestModel,
      UserCareerRequestModel,
      UserOrderModel,
      UserOrderProductModel,
      UserOrderTransactionModel,
      WhatsappTemplateModel,
      WhatsappMessageLogModel,
      ScheduleJobModel,
      CompanyJobModel,
    ]);
  }
}

export default DBConfig;
