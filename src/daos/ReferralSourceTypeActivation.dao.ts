
// Import firestore package
import { DocumentData, Firestore, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { CreateReferralSourceTypeActivationDto } from "../dtos/ReferralSourceTypeActivation.dto";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbReferralSourceTypeActivationDto } from "../db/gcp-firestore-models/ReferralSourceTypeActivation.model";

// Import services
import UlidService from "../services/Ulid.service";

class ReferralSourceTypeActivationDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "referralSourceTypeActivations";

  getReferralSourceTypeActivationModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getReferralSourceTypeActivationDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createReferralSourceTypeActivation(
    createDto: CreateReferralSourceTypeActivationDto
  ): Promise<DbReferralSourceTypeActivationDto | undefined> {
    const currentDate: string = dateHelperObj.getISODate();

    const finalCreateDto: DbReferralSourceTypeActivationDto = {
      ...createDto,
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    return gcpFirestoreLibrary.createDocument<DbReferralSourceTypeActivationDto>(
      this.getReferralSourceTypeActivationModelDetails(),
      finalCreateDto
    );
  }

  async getReferralSourceTypeActivationByCompanyId(
    companyId: string
  ): Promise<
    QuerySnapshot<
      DocumentData,
      DocumentData
    >
  > {
    const db: Firestore = await this.getReferralSourceTypeActivationDatabase();

    return db
      .collection(this.collectionName)
      .where("companyId", "==", companyId)
      .get();
  }

  async getReferralSourceTypeActivationByEmail(
    referralSourceTypeEmail: string
  ): Promise<
    QuerySnapshot<
      DocumentData,
      DocumentData
    >
  > {
    const db: Firestore = await this.getReferralSourceTypeActivationDatabase();

    return db
      .collection(this.collectionName)
      .where("referralSourceTypeEmail", "==", referralSourceTypeEmail)
      .get();
  }

  async getReferralSourceTypeActivationByCompanyIdAndEmail(
    companyId: string,
    referralSourceTypeEmail: string
  ) {
    const db: Firestore = await this.getReferralSourceTypeActivationDatabase();

    return db
      .collection(this.collectionName)
      .where("companyId", "==", companyId)
      .where("referralSourceTypeEmail", "==", referralSourceTypeEmail)
      .get();
  }
}

const referralSourceTypeActivationDaoObj: ReferralSourceTypeActivationDao = new ReferralSourceTypeActivationDao();
export { referralSourceTypeActivationDaoObj, ReferralSourceTypeActivationDao };