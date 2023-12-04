// Load the npm packages
import express, { Express, Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import cors from "cors";

// Import the routes from the `services`
import "./extensions/string.extension";
import routes from "./router";
import { errorHandler } from "./utils/error-handler.util";
import DynamooseConfig from "./db/Dynamoose.config";

class App {
  /**
   * app
   *
   * Express server object
   */
  public app: Express;

  /**
   * constructor
   *
   * To initialise the required propertise.
   */
  constructor() {
    // Create express server
    this.app = express();

    // Call the register methods to do their works
    this.defineGlobals();
    this.initialiseLogger();
    this.registerMiddleWares();
    this.registerAppRoutes();
    this.registerErrorHandlingRoutes();
  }

  /**
   * Define Globals
   *
   * This method define some of the globals required in the application.
   */
  defineGlobals(): void {
    new DynamooseConfig();
  }

  /**
   * Initialise Logger
   *
   * This method intialises the "logger" library which can be used to "log" messages, warnings, errors, etc instead of using build in "console.log."
   */
  initialiseLogger() {}

  /**
   * Register Middlewares
   *
   * This method registers the required middlewares to handle/customise the requests, responses, etc.
   */
  registerMiddleWares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  /**
   * Register Application Routes
   *
   * This method registers the application routes exposed outside by the application, to allow the users/clients to access the routes/resources.
   */
  registerAppRoutes() {
    this.app.use("/", routes);
  }

  /**
   * Error Handling Routes
   *
   * This method registers the error handling routes like 404, exception handling, etc to the "express".
   */
  registerErrorHandlingRoutes() {
    // Route to handle the 404 Not Found error/exception
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).send();
    });

    // Route to handle the exceptions
    this.app.use(
      async (err: any, req: Request, res: Response, next: NextFunction) => {
        // Check if it is trusted/known/expected error, meaning known to the developer.
        if (errorHandler.isTrustedError(err)) {
          // Handle the error manually
          errorHandler.handleError(err, res);
        }

        // Otherwise pass the error to the express and the error would be handled by the express exception handler
        next(err);
      }
    );

    // Handle error/exception on the "unhandledRejection" event
    process.on("unhandledRejection", (reason: Error, promise: Promise<any>) => {
      throw reason;
    });

    /**
     * @todo The below 2 events stops the execustion of the application,
     * investigate and let our handler handle the error and respond back to the user.
     */

    // Handle error/exception on the "uncaughtException" event
    process.on("uncaughtException", (error: Error) => {
      errorHandler.handleError(error);
      if (!errorHandler.isTrustedError(error)) {
        process.exit(1);
      }
    });
  }
}

export const handler = serverless(new App().app);
// Only works on 3000 regardless of what I set environment port to or how I set [value] in app.set('port', [value]).
// new App().app.listen(3000);
// app.listen(3000);
