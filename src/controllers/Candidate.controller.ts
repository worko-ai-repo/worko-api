// Load npm packages
import { NextFunction, Request, Response } from "express";

// Load the local dtos
import { CandidateDTO } from "../dtos/Candidate.dto";

// Load the local schema
import { CreateCandidateSchema } from "../schemas/User.schema";

// Load the shared service
import BaseController from "./Base.controller";
import UserService from "../services/User.service";

/**
 * CandidateController
 *
 * Class to perform related/relevent action/activities related to the "candidate" table.
 */
class CandidateController extends BaseController {
  /**
   * getCandidates
   *
   * Get the candidates based on the provided quesry parameters
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  getCandidates = async (req: Request, res: Response, next: NextFunction) => {
    res.send({
      Hello: "getCandidates",
    });
  };
  /**
   * createCandidate
   *
   * Create a new candidate based on the provided input data. Validates the input data
   * and, if successful, proceeds with the candidate creation logic.
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  createCandidate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputData: CandidateDTO = req.body; // Extract data from the request body

      // Validate the input data against the schema
      const { error, value } = CreateCandidateSchema.validate(inputData, {
        abortEarly: false,
      });

      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // If validation is successful, proceed with candidate creation logic
      try {
        // const createdCandidate = await UserService.createUser(inputData);
        // Return a success response
        // res.status(201).json(createdCandidate);
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  };
}

// Export the "CandidateController"
export default CandidateController;
