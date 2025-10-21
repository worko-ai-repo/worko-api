import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import { countUserDaoObj } from "../daos/CountUser.dao";

// Import dtos
import {
  CountUserCommonUpdateDto,
  CountUserCreateDto,
  CountUserReferralEntityUpdateDto,
} from "../dtos/CountUser.dto";

// Import enums
import { CountUserDbEntityTypeEnum } from "../enums/CountUser.enum";

// Import models
import { DbCountUserDto } from "../db/models/CountUser.model";

class CountUserService {
  private async createCountUser(
    createData: CountUserCreateDto
  ): Promise<DbCountUserDto> {
    global.logger.info("Create Count User [Service]", {
      createData,
    });

    return countUserDaoObj.createCountUser(createData);
  }

  async getCountUserByRegisteredEmailAndEntityType(
    registeredEmail: string,
    entityType: CountUserDbEntityTypeEnum
  ): Promise<QueryResponse<DbCountUserDto>> {
    global.logger.info(
      "Get Count User By Registered Email And Entity Type [Service]",
      {
        registeredEmail,
        entityType,
      }
    );

    return countUserDaoObj.getCountUserByRegisteredEmailAndEntityType(
      registeredEmail,
      entityType
    );
  }

  private async updateCountUserByRegisteredEmailAndEntityType(
    registeredEmail: string,
    entityType: CountUserDbEntityTypeEnum,
    updateData: Partial<CountUserCommonUpdateDto>
  ): Promise<DbCountUserDto> {
    global.logger.info(
      "Update Count User By Registered Email And Entity Type [Service]",
      {
        registeredEmail,
        entityType,
        updateData,
      }
    );

    return countUserDaoObj.updateCountUserByRegisteredEmailAndEntityType(
      registeredEmail,
      entityType,
      updateData
    );
  }

  private async createOrUpdateCountUser(
    registeredEmail: string,
    entityType: CountUserDbEntityTypeEnum,
    updateData: Partial<CountUserCommonUpdateDto>,
    isCountUserExists: boolean // If count user already exists in ddb then update else create
  ): Promise<DbCountUserDto> {
    global.logger.info("Create Or Update Count User [Service]", {
      registeredEmail,
      entityType,
      updateData,
    });

    if (isCountUserExists) {
      return this.updateCountUserByRegisteredEmailAndEntityType(
        registeredEmail,
        entityType,
        updateData
      );
    } else {
      return this.createCountUser({
        email: registeredEmail,
        entityType,
        ...updateData,
      });
    }
  }

  async createOrUpdateCountUserForReferralEntityType(
    registeredEmail: string,
    updateData: CountUserReferralEntityUpdateDto,
    isCountUserExists: boolean
  ): Promise<DbCountUserDto> {
    global.logger.info(
      "Create Or Update Count User For Referral Entity Type [Service]",
      {
        registeredEmail,
        updateData,
      }
    );

    return this.createOrUpdateCountUser(
      registeredEmail,
      CountUserDbEntityTypeEnum.REFERRAL,
      updateData,
      isCountUserExists
    );
  }
}

const countUserServiceObj: CountUserService = new CountUserService();
export { countUserServiceObj, CountUserService };
