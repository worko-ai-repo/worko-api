// Import the local packages
import HttpStatusCode from "./http-codes.util";

/**
 * BaseError
 * 
 * The custom "BaseError" class that extends "Error" built-in class, to provides standards for error. And must be used application wide.
 */
export class BaseError extends Error {
    /**
     * errorCode
     * 
     * The relevant Http Status Code that describes the error.
     */
    public readonly errorCode: number;

    /**
     * errorMsg
     * 
     * The "errorMsg" that provides more information about the error
     */
    public readonly errorMsg: string;

    /**
     * timeStamp
     * 
     * The "timeStamp" of moment when error occured/thrown
     */
    public readonly timeStamp: string = (new Date()).toISOString();

    /**
     * constructor
     * 
     * The properties are defined here.
     * 
     * @param errorMsg string 
     * @param errorCode number
     */
    constructor(errorMsg: string, errorCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR_500) {
        super(errorMsg);

        Object.setPrototypeOf(this, new.target.prototype);

        this.errorCode = errorCode;
        this.errorMsg = errorMsg;

        Error.captureStackTrace(this);
    }
}