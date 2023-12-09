// Import the installed packages
import { Response } from "express";

// Import the local packages
import APP_CONSTANTS from "../configs/constants.config";
import HttpStatusCode from "./http-codes.util";
import { BaseError, RequestValidationError } from "./errors.util";

/**
 * ErrorHandler
 * 
 * This class handles the error and does required activities like logging, informing developer (if required), etc.
 */
class ErrorHandler {
    /**
     * handleError
     * 
     * This method basically logs the error as of now.
     * 
     * Note: If "res" is passed then make sure that at the end the "BaseError" class should be passed in the response
     * 
     * @param err any
     * @param res Response [Optional] It is to respond back to the user's request with appropriate error/exception details.
     */
    public handleError(err: any, res?: Response) {
        // Check if "res" param is set, if then then respond to the user's request
        if (typeof res != "undefined") {
            // An object to hold the new error object
            let newErrorObj = null;

            // When object is instance of the provided classes then no changes/parsing required
            if (
                err instanceof BaseError ||
                err instanceof RequestValidationError
            ) {
                newErrorObj = err;
            }
            else {
                // Prepare the necessary details to respond to the user's request
                let responseStatus = err.status ?? HttpStatusCode.INTERNAL_SERVER_ERROR_500;
                let responseMessage = err.message ?? APP_CONSTANTS.ERROR_MESSAGE_UNKNOWN_EXCEPTION;
                newErrorObj = new BaseError(responseMessage, responseStatus);
            }

            // Respond to the user's request with generic error class that has standard response
            return res
                .status(newErrorObj.errorCode)
                .send(newErrorObj);
        }
    }

    /**
     * isTrustedError (isKnownError))
     * 
     * This method checks if the error object is from the know classes then it indicates the error should mmanually handled.
     * If not then error nees to be handled by the express server default error mechanism.
     * 
     * Note: As of now all errors/exceptions are considered trusted/know and handled manually.
     * Later we may improve this as needed.
     * 
     * @param error any
     * @returns boolean
     */
    public isTrustedError(error: any) {
        return true;
    }
}

export const errorHandler = new ErrorHandler();