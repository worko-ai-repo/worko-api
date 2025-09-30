
// Import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import BaseDao from "./Base.dao";

// Import dtos
import { UserPreferenceCommonUpdateDto, UserPreferenceCreateDto } from "../dtos/UserPreference.dto";

// Import models
import { DbUserPreferenceDto, UserPreferenceModel } from "../db/models/UserPreference.model";

// Import services
import UlidService from "../services/Ulid.service";

class UserPreferenceDao implements BaseDao {
  modelName: string = "UserPreference";
  partitianKey: string = "USR#EML#{primaryEmail}";
  sortKeys: {
    SK_ID: string;
  } = {
    SK_ID: "PREF#",
  };

  preparePKAndSKForQuery(primaryEmail: string): {
    PK: string;
    SK: string;
  } {
    return {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": primaryEmail,
      }),
      SK: this.sortKeys.SK_ID,
    };
  }

  async createUserPreference(
    requestBody: UserPreferenceCreateDto
  ): Promise<DbUserPreferenceDto> {
    global.logger.info("Create user preference [DAO]");

    const { PK, SK } = this.preparePKAndSKForQuery(requestBody.email);
    const ulidId: string = UlidService.getUlidId();

    return UserPreferenceModel.create({ 
      ...requestBody,
      id: ulidId,
      PK: PK, 
      SK: SK,
    });
  }

  async getUserPreferenceByEmail(email: string): Promise<QueryResponse<DbUserPreferenceDto>> {
    global.logger.info("Get user preference [DAO]");
    const { PK, SK } = this.preparePKAndSKForQuery(email);
    return UserPreferenceModel.query("PK").eq(PK).where("SK").eq(SK).exec();
  }

  async getUserPreferenceBasicDetails(email: string): Promise<QueryResponse<DbUserPreferenceDto>> {
    global.logger.info("Get user preference basic details [DAO]");
    const { PK, SK } = this.preparePKAndSKForQuery(email);
    return UserPreferenceModel.query("PK").eq(PK).where("SK").eq(SK).attributes(
      [
        "userPreferredDepartments",
        "userPreferredIndustries",
        "userPreferredlocations",
        "userPreferredRoles",
      ]
    ).exec();
  }

  async updateUserPreference(email: string, updateData: Partial<UserPreferenceCommonUpdateDto>): Promise<DbUserPreferenceDto> {
    global.logger.info("Update user preference [DAO]", {
      email,
      updateData,
    });
    const { PK, SK } = this.preparePKAndSKForQuery(email);
    return UserPreferenceModel.update({ PK: PK, SK: SK }, updateData);
  }
}

const userPreferenceDaoObj: UserPreferenceDao = new UserPreferenceDao();
export {
  userPreferenceDaoObj,
  UserPreferenceDao
};