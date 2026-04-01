// Import firestore package
import {
  DocumentData,
  Firestore,
  Query,
} from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { CorporateSubscriptionPricingConfigListingFilterOptions } from "../dtos/CorporateSubscriptionPricingConfig.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import models
import { DbCorporateSubscriptionPricingConfigDto } from "../db/gcp-firestore-models/CorporateSubscriptionPricingConfig.model";

// Import utils
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

class CorporateSubscriptionPricingConfigDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "corporateSubscriptionPricingConfigs";

  getCorporateSubscriptionPricingConfigModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getCorporateSubscriptionPricingConfigFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createCorporateSubscriptionPricingConfig(createData: DbCorporateSubscriptionPricingConfigDto): Promise<DbCorporateSubscriptionPricingConfigDto | undefined> {
    return gcpFirestoreLibrary.createDocument<DbCorporateSubscriptionPricingConfigDto>(
      this.getCorporateSubscriptionPricingConfigModelDetails(),
      createData
    );
  }

  async getCandidateParsedCvById(id: string): Promise<DbCorporateSubscriptionPricingConfigDto | undefined> {
    return gcpFirestoreLibrary.getDocumentById<DbCorporateSubscriptionPricingConfigDto>(
      this.getCorporateSubscriptionPricingConfigModelDetails(),
      id
    );
  }

  async getAllCorporateSubscriptionPricingConfigByFilterOptions(filterRequest: CorporateSubscriptionPricingConfigListingFilterOptions) {
    const db: Firestore = await this.getCorporateSubscriptionPricingConfigFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db.collection(
      this.collectionName
    );
    return gcpFirestoreUtilObj.paginateGcpFirestore<
      CorporateSubscriptionPricingConfigListingFilterOptions,
      DbCorporateSubscriptionPricingConfigDto
    >(db, this.collectionName, baseQuery, filterRequest);
  }
}

const corporateSubscriptionPricingConfigDao = new CorporateSubscriptionPricingConfigDao();
export { corporateSubscriptionPricingConfigDao, CorporateSubscriptionPricingConfigDao };
