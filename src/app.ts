// Load the npm packages
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import express, { Express, Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import cors from "cors";

// Import extensions
import "./extensions/string.extension";

// Import libraries
import "./libraries/logger.library";

// Import configs
import DBConfig from "./db/DB.config";
import APP_CONSTANTS from "./configs/constants.config";

// Import middlewares
import { getAuthorizerContext } from "./middlewares/authorizer-context.middleware";

// Import the routes
import routes from "./router";

// Import Utils
import { errorHandler } from "./utils/error-handler.util";

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
    this.initDatabaseConfig();
    this.registerMiddleWares();
    this.registerAppRoutes();
    this.registerErrorHandlingRoutes();

    // Logger message
    global.logger.info("Application is initialised successfully.", {
      filePath: __filename,
      methodName: this.constructor.name
    });
  }

  /**
   * Define Globals
   *
   * This method define some of the globals required in the application.
   */
  defineGlobals(): void {

  }

  /**
   * initDatabaseConfig
   * 
   * Initialise the database configurations
   */
  initDatabaseConfig() {
    const dbConf = new DBConfig();
    dbConf.init();
  }

  /**
   * Register Middlewares
   *
   * This method registers the required middlewares to handle/customise the requests, responses, etc.
   */
  registerMiddleWares() {
    const origins: string[] = process.env.APP_STAGE === APP_CONSTANTS.STAGES.PROD ? APP_CONSTANTS.FRONTEND_ORIGINS.PROD : APP_CONSTANTS.FRONTEND_ORIGINS.DEV;
    this.app.use(cors({ origin: origins })); 
    this.app.use(express.json());
  }

  /**
   * Register Application Routes
   *
   * This method registers the application routes exposed outside by the application, to allow the users/clients to access the routes/resources.
   */
  registerAppRoutes() {
    /**
     * @todo: We need to implement authorization without errors for local environment also
     */
    if(process.env.APP_STAGE === APP_CONSTANTS.STAGES.LOCAL) {
      this.app.use("/", routes);
    } else {
      this.app.use("/", getAuthorizerContext(), routes);
    }
  }

  /**
   * Error Handling Routes
   *
   * This method registers the error handling routes like 404, exception handling, etc to the "express".
   */
  registerErrorHandlingRoutes() {
    // Route to handle the 404 Not Found error/exception
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      global.logger.error("The endpoint '%s' not found.", req.originalUrl, {
        filePath: __filename,
        methodName: this.registerErrorHandlingRoutes.name
      });
      res.status(404).send();
    });

    // Route to handle the exceptions
    this.app.use(async (err: any, req: Request, res: Response, next: NextFunction) => {
      // Check if it is trusted/known/expected error, meaning known to the developer.
      if (errorHandler.isTrustedError(err)) {
        // Handle the error manually
        return errorHandler.handleError(err, res);
      }

      // Otherwise pass the error to the express and the error would be handled by the express exception handler
      // It will throw error back to the user as it is an unhandled exception.
      return next(err);
    });

    // Handle error/exception on the "unhandledRejection" event
    process.on('unhandledRejection', (error: Error, promise: Promise<any>) => {
      errorHandler.handleError(error);
      if (!errorHandler.isTrustedError(error)) {
        process.exit(1);
      }
    });

    /**
     * @todo The below 2 events stops the execustion of the application, 
     * investigate and let our handler handle the error and respond back to the user.
     */

    // Handle error/exception on the "uncaughtException" event
    process.on('uncaughtException', (error: Error) => {
      errorHandler.handleError(error);
      if (!errorHandler.isTrustedError(error)) {
        process.exit(1);
      }
    });
  }
}

export const handler = serverless(new App().app, {
  request: function (req: any, event: APIGatewayProxyEvent, context: Context) {
    // Modify the request object with received "event" and "context" from the API Gateway, 
    // to make it accessible in the routes/controllers.
    req.lambdaEvent = event;
    req.lambdaContext = context;
  },
});

// Only works on 3000 regardless of what I set environment port to or how I set [value] in app.set('port', [value]).
// new App().app.listen(3000);
// app.listen(3000);
