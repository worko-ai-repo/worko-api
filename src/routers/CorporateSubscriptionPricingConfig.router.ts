import { Router } from 'express';

// Import Corporate Controller
import CorporateSubscriptionPricingConfig from "../controllers/CorporateSubscriptionPricingConfig.controller";

const corporateSubscriptionPricingConfigController = new CorporateSubscriptionPricingConfig();

// Create a new Mountable Route instance
const CorporateSubscriptionPricingConfigRouter = Router();

/**
 * Generate New Access Request for Corporate User
 * 
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateSubscriptionPricingConfigRouter.post('/', corporateSubscriptionPricingConfigController.createCorporateSubscriptionPricingConfig);

/**
 * @authorisedRoles ["admin","corporate-admin"]
 */
CorporateSubscriptionPricingConfigRouter.get('/entityType/:entityType/planType/:planType',corporateSubscriptionPricingConfigController.getCorporateSubscriptionPricingConfigByEntityTypeAndPlanType);

export default CorporateSubscriptionPricingConfigRouter;