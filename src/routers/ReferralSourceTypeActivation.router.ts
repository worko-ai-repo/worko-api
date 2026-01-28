import { Router } from "express";

// Load controllers
import ReferralSourceTypeActivationController from "../controllers/ReferralSourceTypeActivation.controller";

const referralSourceTypeActivationController = new ReferralSourceTypeActivationController();

const ReferralSourceTypeActivationRouter = Router();

/**
 * @authorisedRoles ["corporate-admin"]
 */
ReferralSourceTypeActivationRouter.post(
  "/",
  referralSourceTypeActivationController.createReferralSourceTypeActivation
);

/**
 * @authorisedRoles ["corporate-admin"]
 */
ReferralSourceTypeActivationRouter.get(
  "/:companyId",
  referralSourceTypeActivationController.getReferralSourceTypeActivationByCompanyId
);

export default ReferralSourceTypeActivationRouter;
