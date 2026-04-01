
// Import daos
import { corporateSubscriptionPricingConfigDao } from "../daos/CorporateSubscriptionPricingConfig.dao";

// Import DTOs
import { CorporateSubscriptionPricingConfigCreateApiDto, CorporateSubscriptionPricingConfigListingFilterOptions } from "../dtos/CorporateSubscriptionPricingConfig.dto";

// Import Enums
import { CorporateSubscriptionEntityTypeEnum, CorporateSubscriptionPlanTypeEnum } from "../enums/Common.enum";
import { dateHelperObj } from "../helpers/date.helper";

class CorporateSubscriptionPricingConfigService {
   async performCreateCorporateSubscriptionPricingConfig(
      requestBody: CorporateSubscriptionPricingConfigCreateApiDto 
   ) {
      return this.createCorporateSubscriptionPricingConfig(
         requestBody.entityType,
         requestBody.planType,
         requestBody.pricePerEntityPerMonth
      )
   }

   async createCorporateSubscriptionPricingConfig(
      entityType: CorporateSubscriptionEntityTypeEnum,
      planType: CorporateSubscriptionPlanTypeEnum,
      pricePerEntityPerMonth: number
   ) {
      const date: string = dateHelperObj.getISODate();
      let durationMonths: number;
      if(planType === CorporateSubscriptionPlanTypeEnum.ANNUALLY) {
         durationMonths = 12;
      } else {
         durationMonths = 3;
      }
      return corporateSubscriptionPricingConfigDao.createCorporateSubscriptionPricingConfig({
         id: `${entityType}#${planType}`,
         createdAt: date,
         updatedAt: date,
         entityType: entityType,
         planType: planType,
         durationMonths,
         pricePerEntityPerMonth,
      })
   }

   async getCorporateSubscriptionPricingConfigByEntityTypeAndPlanType(entityType: CorporateSubscriptionEntityTypeEnum, planType: CorporateSubscriptionPlanTypeEnum) {
      return corporateSubscriptionPricingConfigDao.getCandidateParsedCvById(`${entityType}#${planType}`);
   }

   async getAllCorporateSubscriptionPricingConfigByFilterOptions(
      filterRequest: CorporateSubscriptionPricingConfigListingFilterOptions
   ) {
      return corporateSubscriptionPricingConfigDao.getAllCorporateSubscriptionPricingConfigByFilterOptions(
         filterRequest
      );
   }
}

const corporateSubscriptionPricingConfigServiceObj = new CorporateSubscriptionPricingConfigService();
export { corporateSubscriptionPricingConfigServiceObj, CorporateSubscriptionPricingConfigService };