
// Import firestore package
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { CreateReferralSourceTypeActivationApiDto } from "../dtos/ReferralSourceTypeActivation.dto";

// Import models
import { DbReferralSourceTypeActivationDto } from "../db/gcp-firestore-models/ReferralSourceTypeActivation.model";

// Import services
import { referralSourceTypeActivationServiceObj } from "../services/ReferralSourceTypeActivation.service";

// Import validation schemas
import { createReferralSourceTypeActivationApiDtoValidation } from "../schemas/ReferralSourceTypeActivation.schema";

// Import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class ReferralSourceTypeActivationController {
  createReferralSourceTypeActivation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requestBody: CreateReferralSourceTypeActivationApiDto = req.body;
      const { error, value: validatedReqBody } = createReferralSourceTypeActivationApiDtoValidation.validate(
        requestBody,
        {
          abortEarly: false,
        }
      )
      if (error) {
        throw new RequestValidationError(error);
      }
      const response: DbReferralSourceTypeActivationDto | undefined =
        await referralSourceTypeActivationServiceObj.performCreateReferralSourceTypeActivation(
          validatedReqBody
        );
      if(!response) {
        global.logger.error("Error in createReferralSourceTypeActivation [controller]", { error: "Failed to create Referral Source Type Activation", requestBody, response });
        throw new BaseError("Internal Server Error.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
      }
      res.status(HttpStatusCode.CREATED_201).json(response);
    } catch (error) {
      global.logger.error(
        "Error in createReferralSourceTypeActivation [controller]",
        { error }
      );
      next(error);
    }
  };

  getReferralSourceTypeActivationByCompanyId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const companyId: string = req.params.companyId;
      const response: QuerySnapshot<
              DocumentData,
              DocumentData
            > =
        await referralSourceTypeActivationServiceObj.getReferralSourceTypeActivationByCompanyId(
          companyId,
        );
      res.status(HttpStatusCode.OK_200).json(
        response.empty ? {} : response.docs[0].data()
      );
    } catch (error) {
      global.logger.error(
        "Error in getReferralSourceTypeActivationByCompanyId [controller]",
        { error }
      );
      next(error);
    }
  }
}

export default ReferralSourceTypeActivationController;
