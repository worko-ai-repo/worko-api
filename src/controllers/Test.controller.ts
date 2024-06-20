// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local libraries
import { emailLibrary } from "../libraries/email.library";

// Import Utils
import HttpStatusCode from "../utils/http-codes.util";
import UserService from "../services/User.service";
import UserSubscriptionService from "../services/UserSubscription.service";
import UserDetailService from "../services/UserDetail.service";
import { EmailTemplatePlaceholderCAND_PREMIUM_UPGRADE_NOTIFICATION } from "../dtos/EmailTemplatePlaceholder.dto";
import ScheduleJobService from "../services/ScheduleJob.service";

/**
 * TestController
 *
 * Class to perform some testing operations required to confirm the changes made in the application.
 * 
 * Note: It is only for testing purposes. The methods from this controller should not be exposed to production.
 */
class TestController {
  /**
   * Just testing
   */
  test = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Logger message
      global.logger.info("Testing the context.", {
        filePath: __filename,
        methodName: this.constructor.name,
        // req: req,
        reqEvent: (req as any)?.lambdaEvent ?? "No event found",
        reqEventAuthorizer: (req as any)?.lambdaEvent?.requestContext?.authorizer ?? "No authorizer found",
        reqContext: (req as any)?.lambdaContext ?? "No context found",
        resLocals: res.locals
      });

      // get-authorizer-context.middleware.ts -- getAuthorizerContext
      // const lambdaContextAuthorizer = (req as any)?.lambdaEvent?.requestContext?.authorizer
      // res.locals.userId = lambdaContextAuthorizer?.userId ?? null;

      res.status(HttpStatusCode.OK_200).json({
        // req: req,
        reqEvent: (req as any)?.lambdaEvent ?? "No event found",
        reqEventAuthorizer: (req as any)?.lambdaEvent?.requestContext?.authorizer ?? "No authorizer found",
        reqContext: (req as any)?.lambdaContext ?? "No context found",
        resLocals: res.locals
      });

    } catch (error) {
      next(error);
    }
  }


  /**
   * scheduleJobToTriggerBack
   *
   * Schedule a job to trigger back
   *
   * @param {string} arg0
   * @param {any} scheduleJobToTriggerBack
   */
  scheduleJob= async (req: Request, res: Response, next: NextFunction) => {
    try {
      const name = req.body.scheduleName
      const schedule = req.body.scheduleExpression //"at(2024-05-12T12:00:00)"
      const input = req.body.input
      console.log(name, schedule)
      const response = await ScheduleJobService.createSchedule(name, schedule, input)

      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      next(error);
    }
  }
  /**
   * sendEmail
   *
   * Send email outside the application
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  sendEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Pepare the details requiered to send email
      let emailRequests = {
        templateName: "templateName1",        
        from: { fullName: "Suraj Yadav", email: "suraj@worko.ai" },      
        to: { fullName: "Suraj Yadav", email: "suraj@worko.ai" },
        replyTo: [{ fullName: "Suraj Yadav", email: "suraj@worko.ai" }],
        cc: [{ fullName: "Suraj Yadav", email: "suraj@worko.ai" }],
        bcc: [{ fullName: "Suraj Yadav", email: "suraj@worko.ai" }],
        placeholders: {
          "SPH1": "SPH - Value - 1",
          "SPH2": "SPH - Value - 2",
          "SPH3": "SPH - Value - 3",
          "BPH1": "BPH - Value - 1",
          "BPH2": "BPH - Value - 2",
          "BPH3": "BPH - Value - 3",
        },
      };

      // Send email
      let sendEmailResponse = await emailLibrary.sendEmail(
        emailRequests.templateName,
        emailRequests.to,
        emailRequests.placeholders,
        emailRequests.replyTo,
        emailRequests.cc,
        emailRequests.bcc,
        emailRequests.from,
      );

      // Send successful response with the created email template data
      res.status(HttpStatusCode.OK_200).json(sendEmailResponse);
    } catch (error) {
      // Pass the error to the next error handler
      next(error);
    }
  };

  /**
   * sendCandProfileReminderEmail
   *
   * Send email to the candidate to remind him to complete his profile
   *
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  sendCandProfileReminderEmail = async (req: Request, res: Response, next: NextFunction) => {
    
    try {

      // Get the email of the candidate
      const email = req.params.id;
      // Call the service to send profile reminder email
      const emailResponse = await UserService.sendProfileReminderEmailtoCand(email);

      res.status(HttpStatusCode.OK_200).json(emailResponse);
      
    } catch (error) {
      next(error)
    }
  }

  /**
   * sendEmpProfileReminderEmail - Controller function to send a profile reminder email to an employer
   * 
   * @param {Request} req - Express Request object
   * @param {Response} res - Express Response object
   * @param {NextFunction} next - Express Next function
   */
  sendEmpProfileReminderEmail = async (req: Request, res: Response, next: NextFunction) => {
    
    try {

      // Get the email of the employee
      const email = req.params.id;
      // Call the service to send profile reminder email
      const emailResponse = await UserService.sendProfileReminderEmailtoEmp(email);

      res.status(HttpStatusCode.OK_200).json(emailResponse);
      
    } catch (error) {
      next(error)
    }
  }

  /**
   * sendMailToUpgradeSubscription - Controller function to send an email to upgrade subscription
   * 
   * @param {Request} req - Express Request object
   * @param {Response} res - Express Response object
   * @param {NextFunction} next - Express Next function
   */
  sendCandMailToUpgradeSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract email from request parameters
      const email = req.params.id;

      // Call UserService to send email for upgrading subscription
      const statusAndEmailResponse = await UserService.sendUserMailToUpgradeSubscription(email);
      
      // Send response with status and email response
      res.status(HttpStatusCode.OK_200).json(statusAndEmailResponse)
    } catch (error) {
      // Pass error to Express error handling middleware
      next(error)
    }
  }

  /**
   * sendRemindertoCreateMutlipleProfiles - Controller function to send a reminder to create multiple profiles
   * 
   * @param {Request} req - Express Request object
   * @param {Response} res - Express Response object
   * @param {NextFunction} next - Express Next function
   */
  sendReminderToCandToCreateMutlipleProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract email from request parameters
      const email = req.params.id;

      // Call UserService to send reminder to create multiple profiles
      const reminderStatus = await UserService.sendCandRemindertoCreateMutlipleProfiles(email);

      // Send response with reminder status
      res.status(HttpStatusCode.OK_200).json(reminderStatus)
    } catch (error) {
      // Pass error to Express error handling middleware
      next(error)
    }
  }

  /**
   * sendRemindertoEmptoCreateMutlipleProfiles - Controller function to send a reminder to employer to create multiple profiles
   * 
   * @param {Request} req - Express Request object
   * @param {Response} res - Express Response object
   * @param {NextFunction} next - Express Next function
   */
  sendReminderToEmpToCreateMutlipleProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract email from request parameters
      const email = req.params.id;

      // Call UserService to send reminder to employer to create multiple profiles
      const reminderStatus = await UserService.sendEmpRemindertoCreateMutlipleProfiles(email);

      // Send response with reminder status
      res.status(HttpStatusCode.OK_200).json(reminderStatus)
    } catch (error) {
      // Pass error to Express error handling middleware
      next(error)
    }
  }
}

export default TestController;