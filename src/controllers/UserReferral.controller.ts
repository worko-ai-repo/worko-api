//npm import
import { Request, Response, NextFunction } from "express";

// Load the local dtos
import { UserReferralRequestDTO } from "../dtos/User.dto";

// Load the local schema
import { UserReferralRequestDTOValidation } from "../schemas/UserReferral.schema";

// Load the shared service
import UserService from "../services/User.service";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";

/**
 * UserReferralController
 *
 * Class to perform related/relevent action/activities related to the "user referral" table
 */
class UserReferralController {
  /**
   * createReferral
   *
   * Create a new referral based on the provided input data. Validates the input data
   * and, if successful, proceeds with the new referral creation logic.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  createReferral = async (req: Request, res: Response, next: NextFunction) => {
    const referralRequest: UserReferralRequestDTO = req.body;
    const { error } = UserReferralRequestDTOValidation.validate(
      referralRequest,
      { abortEarly: false }
    );
    if (error) {
      return res.status(HttpStatusCode.BAD_REQUEST_400).json({
        error: "Validation Error",
        details: error.details.map((detail) => ({
          message: detail.message,
          path: detail.path,
        })),
      });
    }
    const email = req.params.id;
    const newreferral = await UserService.referralRequest(
      referralRequest,
      email
    );
    res.status(HttpStatusCode.OK_200).json(newreferral);
  };
}

export default UserReferralController;
