// Load npm packages
import { NextFunction, Request, Response } from "express";

// Load the local packages
import CandidateBaseController from "./CandidateBase.controller";

/**
 * CandidateController
 * 
 * Class to perform related/relevent action/activities related to the "candidate" table.
 */
class CandidateController extends CandidateBaseController {
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
            Hello: "getCandidates"
        });
    }
}

// Export the "CandidateController"
export default CandidateController;