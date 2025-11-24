import { Router } from "express";

import InterviewController from "../controllers/UserInterview.controller";

const interviewController: InterviewController = new InterviewController();
const UserInterviewRouter: Router = Router();

/**
 * Registers all Interview routes.
 * Base mount: router.use("/user", UserInterviewRouter)
 */

/**
 * POST /interview/request
 * Corporate requests a candidate interview (status=PENDING)
 * @authorisedRoles ["admin", "corporate-admin", "corporate-recruiter", "evaluator"]
 */
UserInterviewRouter.post("/interview/request", interviewController.requestUserInterview);

/**
 * POST /interview/initiate
 * Candidate initiates an interview session
 */
UserInterviewRouter.post("/interview/initiate", interviewController.initiateUserInterview);

/**
 * PATCH /interview/question/:id
 * Lambda: fetch current question feedback using lambda and update in the history.
 */
UserInterviewRouter.patch("/interview/question/:interviewId", interviewController.provideFeedbackUserInterview);

/**
 * PATCH /interview/complete
 * Mark interview as completed and update the feedback summary
*/
UserInterviewRouter.patch("/interview/complete/:interviewId", interviewController.completeUserInterview);

/**
 * PATCH /interview/update-status
 * Update status/connection metadata
 */
UserInterviewRouter.patch("/interview/update/:interviewId", interviewController.updateUserInterview);

/**
 * GET /interview/list/:email
 * List interviews for a candidate
 */
UserInterviewRouter.get("/interview/list/:email", interviewController.listUserInterviewByEmail);


/**
 * GET /interview/details/:interviewId
 * Get full interview details
*/
UserInterviewRouter.get("/interview/details/:interviewId", interviewController.listUserInterviewDetailsById);

/**
 * GET /corporate/interviews
 * List corporate-requested interviews
 */
UserInterviewRouter.get("/interviews", interviewController.listAllUserInterview);

/**
 * GET /interview/:interviewId/videos
 * Get all the interview videos for a specific interview
 */
UserInterviewRouter.get("/interview/:interviewId/videos", interviewController.getUserInterviewVideos);

export default UserInterviewRouter;
