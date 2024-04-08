// Load npm packages
import { Request, Response, NextFunction } from "express";

// Load the local libraries
import { EmailSourceDestinationAddress, emailLibrary } from "../libraries/email.library";

// Import Utils
import HttpStatusCode from "../utils/http-codes.util";
import UserService from "../services/User.service";

/**
 * TestController
 *
 * Class to perform some testing operations required to confirm the changes made in the application.
 * 
 * Note: It is only for testing purposes. The methods from this controller should not be exposed to production.
 */
class TestController {
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
}

export default TestController;