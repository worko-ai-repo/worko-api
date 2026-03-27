// Import firestore package
import { DocumentData, Firestore } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import models
import { DbUserGoogleInterviewTokenDetailsDto } from "../db/gcp-firestore-models/UserGoogleInterviewToken.model";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { CreateUserGoogleInterviewTokenDetailsDto } from "../dtos/UserGoogleInterviewToken.dto";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

class UserGoogleInterviewTokenDao implements BaseDao {
  databaseName: string = `worko-user-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "userGoogleInterviewTokenDetails";

  getUserGoogleInterviewTokenModelDetails(): GcpFirestoreInteractionDto {
    global.logger.info(
      "Initialized getUserGoogleInterviewTokenModelDetails [DAO]",
      {
        methodName: this.getUserGoogleInterviewTokenModelDetails.name,
      }
    );
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getUserGoogleInterviewTokenFirestoreDatabase(): Promise<Firestore> {
    global.logger.info(
      "Initialized getUserGoogleInterviewTokenFirestoreDatabase [DAO]",
      {
        methodName: this.getUserGoogleInterviewTokenFirestoreDatabase.name,
      }
    );
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  /**
   * createUserGoogleInterviewTokenDetails
   *
   * Stores the user's Google Interview OAuth tokens in Firestore.
   *
   * @param {CreateUserGoogleInterviewTokenDetailsDto} createDto
   * @returns {Promise<DbUserGoogleInterviewTokenDetailsDto | undefined>}
   */
  async createUserGoogleInterviewTokenDetails(
    createDto: CreateUserGoogleInterviewTokenDetailsDto
  ): Promise<DbUserGoogleInterviewTokenDetailsDto | undefined> {
    global.logger.info(
      "Initialized createUserGoogleInterviewTokenDetails [DAO]",
      {
        methodName: this.createUserGoogleInterviewTokenDetails.name,
      }
    );

    const currentDate: string = dateHelperObj.getISODate();
    const finalCreateDto: DbUserGoogleInterviewTokenDetailsDto = {
      ...createDto,
      id: createDto.userId,
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    return gcpFirestoreLibrary.createDocument<DbUserGoogleInterviewTokenDetailsDto>(
      this.getUserGoogleInterviewTokenModelDetails(),
      finalCreateDto
    );
  }

  /**
   * getUserGoogleInterviewTokenDetailsByUserId
   *
   * Fetches the user's token document from Firestore.
   *
   * @param {string} userId
   * @returns {Promise<DbUserGoogleInterviewTokenDetailsDto | undefined>}
   */
  async getUserGoogleInterviewTokenDetailsByUserId(
    userId: string
  ): Promise<DbUserGoogleInterviewTokenDetailsDto | undefined> {
    global.logger.info(
      "Initialized getUserGoogleInterviewTokenDetailsByUserId [DAO]",
      {
        methodName: this.getUserGoogleInterviewTokenDetailsByUserId.name,
      }
    );

    return gcpFirestoreLibrary.getDocumentById<DbUserGoogleInterviewTokenDetailsDto>(
      this.getUserGoogleInterviewTokenModelDetails(),
      userId
    );
  }

  /**
   * updateUserGoogleInterviewTokenDetailsByUserId
   *
   * Upserts the user's token document in Firestore.
   *
   * @param {string} userId
   * @param {Partial<DbUserGoogleInterviewTokenDetailsDto>} updateData
   * @returns {Promise<DbUserGoogleInterviewTokenDetailsDto | undefined>}
   */
  async updateUserGoogleInterviewTokenDetailsByUserId(
    userId: string,
    updateData: Partial<DbUserGoogleInterviewTokenDetailsDto>
  ): Promise<DbUserGoogleInterviewTokenDetailsDto | undefined> {
    global.logger.info(
      "Initialized updateUserGoogleInterviewTokenDetailsByUserId [DAO]",
      {
        methodName: this.updateUserGoogleInterviewTokenDetailsByUserId.name,
      }
    );

    const currentDate: string = dateHelperObj.getISODate();
    const existingDoc: DbUserGoogleInterviewTokenDetailsDto | undefined =
      await this.getUserGoogleInterviewTokenDetailsByUserId(userId);

    const finalUpdateDto: DbUserGoogleInterviewTokenDetailsDto = {
      ...(existingDoc ?? ({} as DocumentData)),
      ...(updateData as DocumentData),
      id: userId,
      userId,
      createdAt: existingDoc?.createdAt ?? currentDate,
      updatedAt: currentDate,
    } as DbUserGoogleInterviewTokenDetailsDto;

    return gcpFirestoreLibrary.createDocument<DbUserGoogleInterviewTokenDetailsDto>(
      this.getUserGoogleInterviewTokenModelDetails(),
      finalUpdateDto
    );
  }

  /**
   * deleteUserGoogleInterviewTokenDetailsByUserId
   *
   * Deletes the user's token document from Firestore.
   *
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async deleteUserGoogleInterviewTokenDetailsByUserId(
    userId: string
  ): Promise<boolean> {
    global.logger.info(
      "Initialized deleteUserGoogleInterviewTokenDetailsByUserId [DAO]",
      {
        methodName: this.deleteUserGoogleInterviewTokenDetailsByUserId.name,
      }
    );

    const db: Firestore = await this.getUserGoogleInterviewTokenFirestoreDatabase();
    await db
      .collection(this.collectionName)
      .doc(userId)
      .delete();

    return true;
  }
}

const userGoogleInterviewTokenDaoObj: UserGoogleInterviewTokenDao =
  new UserGoogleInterviewTokenDao();

export { userGoogleInterviewTokenDaoObj, UserGoogleInterviewTokenDao };

