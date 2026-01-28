
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";

// Import daos
import { referralSourceTypeActivationDaoObj } from "../daos/ReferralSourceTypeActivation.dao";

// Import dtos
import { CreateReferralSourceTypeActivationApiDto, CreateReferralSourceTypeActivationDto } from "../dtos/ReferralSourceTypeActivation.dto";

// Import helpers
import { getActionByUserId } from "../helpers/user.helper";

// Import models
import { DbCorporateUserDto } from "../db/models/CorporateUser.model";
import { DbReferralSourceTypeActivationDto } from "../db/gcp-firestore-models/ReferralSourceTypeActivation.model";

// Import services
import { corporateUserServiceObj } from "./CorporateUser.service";

// Import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError } from "../utils/errors.util";

class ReferralSourceTypeActivationService {
   async createReferralSourceTypeActivation(createDto: CreateReferralSourceTypeActivationDto) {
      return referralSourceTypeActivationDaoObj.createReferralSourceTypeActivation(createDto);
   }

   async getReferralSourceTypeActivationByCompanyId(companyId: string): Promise<
      QuerySnapshot<
        DocumentData,
        DocumentData
      >
    > {
      return referralSourceTypeActivationDaoObj.getReferralSourceTypeActivationByCompanyId(companyId);
   }

   async getReferralSourceTypeActivationByEmail(referralSourceTypeEmail: string): Promise<
      QuerySnapshot<
        DocumentData,
        DocumentData
      >
    > {
      return referralSourceTypeActivationDaoObj.getReferralSourceTypeActivationByEmail(referralSourceTypeEmail);
   }

   async getReferralSourceTypeActivationByCompanyIdAndEmail(companyId: string, referralSourceTypeEmail: string): Promise<
      QuerySnapshot<
        DocumentData,
        DocumentData
      >
    > {
      return referralSourceTypeActivationDaoObj.getReferralSourceTypeActivationByCompanyIdAndEmail(companyId, referralSourceTypeEmail);
    }

   async prepareReferralSourceTypeEmail(): Promise<string | undefined> {
      const emailDomain: string | undefined = APP_CONSTANTS.REFERRAL_SOURCE_TYPE_ACTIVATION_EMAIL_DOMAIN;

      return emailDomain;
   }

   async performCreateReferralSourceTypeActivation(
    requestBody: CreateReferralSourceTypeActivationApiDto
   ) {
      const { actionByCorporateUserId } = getActionByUserId();
      if (!actionByCorporateUserId) {
        global.logger.error(
          "Error in createReferralSourceTypeActivation [controller]",
          { error: "actionByCorporateUserId is required" }
        );

        throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
      }

      const corporateUserDetails: DbCorporateUserDto =
        await corporateUserServiceObj.getCorpUserByIdWithParsing(
          actionByCorporateUserId
        );

      const existingReferralSourceTypeActivation: QuerySnapshot<DocumentData, DocumentData> = await this.getReferralSourceTypeActivationByCompanyId(
        corporateUserDetails.companyId
      );
      if(!existingReferralSourceTypeActivation.empty) {
        const existingReferralSourceTypeActivationData = existingReferralSourceTypeActivation.docs[0].data() as DbReferralSourceTypeActivationDto;
        global.logger.error(
          "Error in createReferralSourceTypeActivation [controller]",
          {
            error: "Referral Source Type Activation already exists",
            existingReferralSourceTypeActivationData,
          }
        );

        throw new BaseError("Already submitted.", HttpStatusCode.CONFLICT_409);
      }

      const emailDomain: string | undefined = await this.prepareReferralSourceTypeEmail();
      if(!emailDomain) {
        global.logger.error(
          "Error in createReferralSourceTypeActivation [controller]",
          { error: "emailDomain is not found in config" }
        );

        throw new BaseError("Internal Server Error.", HttpStatusCode.UNAUTHORIZED_401);
      }

      return this.createReferralSourceTypeActivation({
        isEmailVerified: requestBody.isEmailVerified,
        createdByCorporateUserId: corporateUserDetails.id,
        createdByCorporateUserEmail: corporateUserDetails.email,
        companyId: corporateUserDetails.companyId,
        referralSourceTypeEmail: requestBody.referralSourceTypeEmail,
        systemReferralSourceTypeEmail: `${corporateUserDetails.companyId}@${emailDomain}`
      });
   }
}

const referralSourceTypeActivationServiceObj = new ReferralSourceTypeActivationService();
export { referralSourceTypeActivationServiceObj, ReferralSourceTypeActivationService }