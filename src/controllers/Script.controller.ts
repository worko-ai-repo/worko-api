// Import npm packages
import { Request, Response, NextFunction } from "express";

// Import Services
import ScriptService from "../services/Script.service";

// Import local utils
import HttpStatusCode from "../utils/http-codes.util";

/**
 * ScriptController
 *
 * Controller for handling script-related operations related to updating GSI attributes.
 */
class ScriptController {
  /**
   * updateUserSubscriptionsGSIs
   *
   * Updates the GSI1PK and GSI1SK attributes for all user subscriptions.
   *
   * Problem: The GSI1PK and GSI1SK attributes for user subscriptions need to be updated
   * according to the latest requirements or as defined in the data model file. This operation
   * ensures that the Global Secondary Index (GSI) is consistent with the updated data structure
   * and maintains data integrity.
   * This operation updates these attributes to ensure the GSI is consistent with the updated data
   * structure, thereby maintaining data integrity across the application.
   * 
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>} - A promise that resolves to void
   */
  updateUserSubscriptionsGSIs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Update the GSI1PK and GSI1SK attributes for all user subscriptions
      const updatedUserSubs = await ScriptService.updateAllUserSubscriptionsGSI1SK();
      res.status(HttpStatusCode.OK_200).json(updatedUserSubs);
    } catch (error) {
      next(error);
    }
  };

  // /**
  //  * updateUserExperiencesGSIs
  //  *
  //  * Updates the GSI1PK and GSI1SK attributes for all user experiences.
  //  *
  //  * Problem: Similar to user subscriptions, the GSI1PK and GSI1SK attributes for user experiences
  //  * need to be updated to align with the latest data structure requirements as specified in the model file.
  //  * This operation updates these attributes to ensure the GSI is consistent with the updated data
  //  * structure, thereby maintaining data integrity across the application.
  //  *
  //  * @param {Request} req - Express request object
  //  * @param {Response} res - Express response object
  //  * @param {NextFunction} next - Express next middleware function
  //  * @returns {Promise<void>} - A promise that resolves to void
  //  */
  // updateUserExperiencesGSIs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     // Update the GSI1PK and GSI1SK attributes for all user experiences
  //     const updatedUserExps = await ScriptService.updateUserExperiencesGSIs();
  //     res.status(HttpStatusCode.OK_200).json(updatedUserExps);
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default ScriptController;
