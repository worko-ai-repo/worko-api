// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local dtos

// Load the local schema

// Load the shared service
import MasterSubscriptionService from "../services/MasterSubscription.service";

//Load local util statuscode
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

/**
 *  MasterSubscriptionController
 *
 * Class to perform related/relevent action/activities related to the "MasterSubscription" table
 */
class MasterSubscriptionController {}

export default MasterSubscriptionController;
