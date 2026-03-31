// Import firestore package
import {
  Firestore,
} from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import models
import { DbCorporateSubscriptionPricingConfigDto } from "../db/gcp-firestore-models/CorporateSubscriptionPricingConfig.model";

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
}

const corporateSubscriptionPricingConfigDao = new CorporateSubscriptionPricingConfigDao();
export { corporateSubscriptionPricingConfigDao, CorporateSubscriptionPricingConfigDao };
