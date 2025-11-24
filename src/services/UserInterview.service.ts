// Import configs
import APP_CONSTANTS from "../configs/constants.config";
import { awsS3ClientLibrary } from "../configs/aws-sdk.config";

// Import daos
import { interviewDaoObj } from "../daos/UserInterview.dao";

// Import models
import { DbInterviewDto } from "../db/models/UserInterview.model";

// Import dtos
import { EmailTemplatePlaceholderINTERVIEW_REQUEST_BY_CORPORATE_USER } from "../dtos/EmailTemplatePlaceholder.dto";
import {
  InterviewFeedbackGenerationApiDTO,
  InterviewFeedbackResponse,
  InterviewFilterOptions,
  InterviewHistoryEntryDto,
  InterviewInitialResponse,
  InterviewRequestCreateApiDTO,
  InterviewUpdateApiDTO,
} from "../dtos/UserInterview.dto";

// Import enums
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";
import { InterviewStatusEnum } from "../enums/UserInterview.enum";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import libraries
import { emailLibrary, EmailSourceDestinationAddress } from "../libraries/email.library";

// Import services
import InvokeLambdaService from "./InvokeLambda.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";
import { InvocationTypeEnum } from "../enums/InvokeLambda.enum";

class InterviewService {
  /**
   * Helper method to send interview-related emails
   */

  private async sendInterviewMail(
    data: {
      interviewId: string;
      recieverEmail: string;
      fullName: string;
      companyName: string;
      jobId: string;
      corporateUserName: string;
      position: string;
    },
    mailCase: "request" | "reminder" | "followup" | "completion"
  ): Promise<boolean> {
    // Prepare the necessary parameters
    const toAddress: EmailSourceDestinationAddress = {
      email: data.recieverEmail,
      fullName: data.fullName,
    };

    // Prepare the email placeholders
    const emailPlaceholders: EmailTemplatePlaceholderINTERVIEW_REQUEST_BY_CORPORATE_USER = {
      ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
      recipientEmail: data.recieverEmail,
      recipientName: data.fullName,
      companyName: data.companyName,
      position: data.position,
      interviewUrl: APP_CONSTANTS.FRONTEND_URLS.INTERVIEW_PORTAL.strtr({
        "{token}": data.interviewId,
      }),
      jobUrl: APP_CONSTANTS.FRONTEND_URLS.JOB_DETAILS.strtr({
        "{companyName}": data.companyName?.toLowerCase().replace(/\s+/g, "-"),
      }).strtr({
        "{jobId}": data.jobId,
      }),
      requesterName: data.corporateUserName,
    };
    global.logger.info("Email Placeholders: ", emailPlaceholders);
    // Send Invite to the user and log if the email is not sent
    let emailDetails = await emailLibrary.sendEmail(
      EmailTemplateEnum.INTERVIEW_REQUEST_BY_CORPORATE_USER,
      toAddress,
      emailPlaceholders
    );
    if (!emailDetails.systemLogId) {
      // Log the error message if the email is not sent
      global.logger.error("Error in sending email invite to the corporate.", {
        methodName: this.sendInterviewMail.name,
      });

      return false;
    }

    return true;
  }
  /**
   * Helper method to send interview request email
   */
  private async sendInterviewRequestEmail(
    interviewId: string,
    payload: InterviewRequestCreateApiDTO
  ): Promise<void> {
    const emailPayload = {
      interviewId,
      recieverEmail: payload.candidateEmail,
      fullName: payload.candidateFullName || "Candidate",
      companyName: payload.companyName,
      jobId: payload.jobId,
      corporateUserName: payload.requesterUserName,
      position: payload.position,
    };

    const emailSent = await this.sendInterviewMail(emailPayload, "request");

    if (!emailSent) {
      throw new BaseError(
        "Failed to send interview request email to the candidate.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }
  }

  /**
   * requestUserInterview
   * Creates a new interview request (PENDING) for a candidate.
   */
  async requestUserInterview(
    corporateUserId: string,
    payload: InterviewRequestCreateApiDTO
  ): Promise<DbInterviewDto> {
    global.logger.info("Request Interview [service]", {
      methodName: this.requestUserInterview.name,
    });

    // Get existing interviews for the candidate
    const existingInterviews = await interviewDaoObj.getUserInterviewByEmail(
      payload.candidateEmail
    );

    let interviewResult: DbInterviewDto;

    if (existingInterviews.count) {
      // Find pending interview
      const pendingInterview = existingInterviews.find(
        (interview) => interview.status === InterviewStatusEnum.PENDING
      );

      if (pendingInterview && pendingInterview.requestedBy) {
        // Check if the same corporate user already has a pending request
        const existingRequest = pendingInterview.requestedBy?.find(
          (user) => user.corporateUserId === corporateUserId
        );

        if (existingRequest) {
          throw new BaseError(
            "An interview request is already pending for this candidate from your account.",
            HttpStatusCode.CONFLICT_409
          );
        }

        // Add new corporate user to existing pending interview
        global.logger.info("Adding new corporate user to existing pending interview", {
          methodName: this.requestUserInterview.name,
        });

        const updatedRequestedBy = pendingInterview.requestedBy;

        updatedRequestedBy.push({
          corporateUserId: corporateUserId,
          companyId: payload.companyId,
          position: payload.position,
          companyName: payload.companyName,
          requesterUserName: payload.requesterUserName,
          requestedByActor: payload.requestedByActor,
          jobId: payload.jobId,
          requestedAt: dateHelperObj.getISODate(),
        });

        interviewResult = await interviewDaoObj.updateUserInterviewByIdAndEmail(
          pendingInterview.id,
          pendingInterview.candidateEmail,
          { requestedBy: updatedRequestedBy }
        );
      } else {
        // No pending interview found, create new one
        interviewResult = await interviewDaoObj.createUserInterviewRequest(
          corporateUserId,
          payload.candidateEmail,
          payload
        );
      }
    } else {
      // No existing interviews, create new one
      interviewResult = await interviewDaoObj.createUserInterviewRequest(
        corporateUserId,
        payload.candidateEmail,
        payload
      );
    }

    // Send email notification (extracted to avoid duplication)
    await this.sendInterviewRequestEmail(interviewResult.id, payload);

    return interviewResult;
  }

  /**
   * initiateUserInterview
   * Candidate initiates an interview; moves to IN_PROGRESS.
   */
  async initiateUserInterview(
    body: { candidateEmail: string } & Pick<
      DbInterviewDto,
      | "initiatedAt"
      | "createdBy"
      | "status"
      | "createdByUserId"
      | "totalQuestions"
      | "currentQuestion"
    >
  ): Promise<DbInterviewDto> {
    global.logger.info("Initiate Interview [service]", {
      methodName: this.initiateUserInterview.name,
    });

    //  Step 1: Get all interviews for this candidate
    const existingInterviews = (await interviewDaoObj.getUserInterviewByEmail(
      body.candidateEmail
    )) as any;

    // Convert QueryResponse to plain array for TS safety
    const interviews: DbInterviewDto[] = existingInterviews.toJSON
      ? existingInterviews.toJSON()
      : (existingInterviews as DbInterviewDto[]);

    let pendingInterviewExists = false;
    let pendingInterviewDetails: DbInterviewDto | null = null;

    //  Step 2: Check for existing pending or recent interviews
    if (interviews.length > 0) {
      // Find a pending one first
      for (const interview of interviews) {
        if (
          interview.status === InterviewStatusEnum.PENDING &&
          interview.requestedBy &&
          interview.requestedBy.length > 0
        ) {
          pendingInterviewExists = true;
          pendingInterviewDetails = interview;
          break;
        }
      }

      // If none pending, check recent ones (within 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const recentInterview = interviews.find(
        (interview) =>
          interview.initiatedAt && new Date(interview.initiatedAt) >= new Date(threeMonthsAgo)
      );

      if (recentInterview && !pendingInterviewExists) {
        throw new BaseError(
          "An interview has already been initiated for this candidate within the last 3 months.",
          HttpStatusCode.CONFLICT_409
        );
      }
    }

    //  Step 3: Get questions (simulate or fetch via Lambda)
    // You can uncomment this when Lambda integration is live:

    const parseJobDescriptionResponse: InterviewInitialResponse =
      await InvokeLambdaService.triggerInterviewService(
        {
          email: body.candidateEmail,
          totalQuestions: APP_CONSTANTS.INTERVIEW_SETTINGS.TOTAL_QUESTIONS,
        },
        "initial",
        InvocationTypeEnum.RequestResponseType
      );

    global.logger.warn("Interview Service Lambda Response:", parseJobDescriptionResponse);
    // Use parsedResponse directly
    const interviewQuestionsHistory: Pick<DbInterviewDto, "interviewHistory"> = {
      interviewHistory: parseJobDescriptionResponse.initialInterviewQuestionsGeneratedByLambda.map(
        ([index, question]: [number, string]) => ({
          questionId: `q_${Date.now()}_${index + 1}`,
          questionText: question,
          userAnswer: "",
          feedback: "",
          correctAnswer: "",
          isCorrect: false,
          timeTaken: 0,
          chunkId: "",
          chunkUploadStatus: "PENDING" as const,
          chunkFileMimeType: "",
        })
      ),
    };
    // Update the currentQuestion to 1st  (first question) as the interview is inititated and total question in the body
    // First question index id
    body.currentQuestion = interviewQuestionsHistory.interviewHistory?.[0]?.questionId || "0";
    body.totalQuestions = APP_CONSTANTS.INTERVIEW_SETTINGS.TOTAL_QUESTIONS;

    //  Step 5: Create or update interview
    if (pendingInterviewExists && pendingInterviewDetails) {
      // Update existing pending interview
      const updatedInterview = await interviewDaoObj.updateUserInterviewByIdAndEmail(
        pendingInterviewDetails.id,
        pendingInterviewDetails.candidateEmail,
        {
          initiatedAt: body.initiatedAt,
          createdByUserId: body.createdByUserId,
          totalQuestions: body.totalQuestions,
          currentQuestion: body.currentQuestion,
          status: "IN_PROGRESS",
          typeOfcandidate: parseJobDescriptionResponse.typeOfcandidate,
          interviewHistory: interviewQuestionsHistory.interviewHistory,
        }
      );
      return updatedInterview;
    } else {
      // Create a new interview
      const newInterview = await interviewDaoObj.initiateUserInterview({
        ...body,
        interviewHistory: interviewQuestionsHistory.interviewHistory,
        typeOfcandidate: parseJobDescriptionResponse.typeOfcandidate,
      });

      return newInterview;
    }
  }

  /**
   * provideFeedbackUserInterview
   * Updates feedback for a specific question in the interview history.
   */
  async provideFeedbackUserInterview(
    userId: string,
    interviewId: string,
    payload: InterviewFeedbackGenerationApiDTO
  ) {
    global.logger.info("Provide Feedback [service]", {
      methodName: this.provideFeedbackUserInterview.name,
    });

    // Connect with lambda to gather the feedback for the specific question
    const gatherFeedbackfromLambda: InterviewFeedbackResponse =
      await InvokeLambdaService.triggerInterviewService(
        {
          email: payload.email,
          questionId: payload.interviewHistory.questionId,
          questionText: payload.interviewHistory.questionText,
          userAnswer: payload.interviewHistory.userAnswer,
        },
        "feedback",
        InvocationTypeEnum.RequestResponseType
      );

    // Update the partition with the feedback received from lambda
    const finalPayload: {
      currentQuestion: string;
      interviewHistory: InterviewHistoryEntryDto;
    } = {
      currentQuestion: payload.interviewHistory.questionId.trim(),
      interviewHistory: {
        questionId: payload.interviewHistory.questionId.trim(),
        questionText: payload.interviewHistory.questionText,
        userAnswer:
          gatherFeedbackfromLambda?.correctedTranscription || payload.interviewHistory.userAnswer,
        feedback: gatherFeedbackfromLambda?.feedback || "",
        isCorrect: gatherFeedbackfromLambda?.isAnswerCorrect || false,
        timeTaken: payload.interviewHistory.timeTaken,
        chunkId: payload.interviewHistory.chunkId,
        chunkUploadStatus: payload.interviewHistory.chunkUploadStatus,
        chunkFileMimeType: payload.interviewHistory.chunkFileMimeType,
      },
    };

    // Update the interview record in DB by fetching the interview first
    const interviewDetails = await interviewDaoObj.getUserInterviewByEmailAndId(
      payload.email,
      interviewId
    );

    if (!interviewDetails) {
      throw new BaseError(
        "Interview not found for the provided email and interview ID.",
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Check if the currentQuestion is the last one, if yes then trigger the completion lambda
    const isLastQuestion =
      interviewDetails.interviewHistory &&
      interviewDetails.interviewHistory.length > 0 &&
      interviewDetails.interviewHistory[interviewDetails.interviewHistory.length - 1].questionId ===
        payload.interviewHistory.questionId;
    if (isLastQuestion && gatherFeedbackfromLambda.needsFollowUp === false) {
      // Trigger the completion lambda
      InvokeLambdaService.triggerInterviewService(
        {
          email: payload.email,
          interviewHistory: finalPayload.interviewHistory,
        },
        "completion",
        InvocationTypeEnum.EventType
      );
    }

    // Extract the full interview history and update the specific question
    const questionIdToUpdate = payload.interviewHistory.questionId.trim();

    const updatedInterviewHistory =
      interviewDetails.interviewHistory?.map((entry) => {
        if (entry.questionId.trim() === questionIdToUpdate) {
          // Trim both sides
          return finalPayload.interviewHistory;
        }
        return entry;
      }) || [];

    global.logger.debug("Updated interview history", {
      updatedCount: updatedInterviewHistory.filter(
        (e) => e.questionId.trim() === questionIdToUpdate && e.feedback
      ).length,
    });

    // Update the interview record in DB
    const finalInterviewData = await interviewDaoObj.updateUserInterviewByIdAndEmail(
      interviewDetails.id,
      interviewDetails.candidateEmail,
      {
        currentQuestion: finalPayload.currentQuestion,
        interviewHistory: updatedInterviewHistory,
        updatedBy: userId,
      }
    );

    //patch need followup flag to return
    if (gatherFeedbackfromLambda.needsFollowUp !== undefined) {
      (finalInterviewData as any).needsFollowUp = gatherFeedbackfromLambda.needsFollowUp;
    }
    return finalInterviewData;
  }

  /**
   * completeUserInterview
   * Marks an interview as COMPLETED; scoring handled downstream.
   */
  async completeUserInterview(
    userId: string,
    interviewId: string,
    payload: any
  ): Promise<DbInterviewDto> {
    global.logger.info("Complete Interview [service]", {
      methodName: this.completeUserInterview.name,
    });

    const existingInterview = await interviewDaoObj.getUserInterviewByEmailAndId(
      payload.candidateEmail,
      interviewId
    );
    if (!existingInterview) {
      throw new BaseError(
        "Interview not found for the provided email and interview ID.",
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Construct the payload to update by calculating avg response time total time taken using the interview history and feedback last chunk uploaded
    const totalTimeTaken = existingInterview.interviewHistory?.reduce(
      (acc, entry) => acc + (entry.timeTaken || 0),
      0
    ) as number;
    const avgResponseTime = totalTimeTaken / (existingInterview.interviewHistory?.length || 1);
    const updatePayload: Partial<DbInterviewDto> = {
      status: InterviewStatusEnum.COMPLETED,
      duration: totalTimeTaken,
      avgResponseTime: avgResponseTime,
      lastChunkUploaded: payload.lastChunkUploaded,
      updatedBy: userId,
    };

    // Update the interview record in DB
    return interviewDaoObj.updateUserInterviewByIdAndEmail(
      existingInterview.id,
      existingInterview.candidateEmail,
      updatePayload
    );
  }

  /**
   * updateUserInterview
   * Updates status/connection-related fields for an interview.
   */
  async updateUserInterview(
    userId: string,
    interviewId: string,
    payload: InterviewUpdateApiDTO
  ): Promise<DbInterviewDto> {
    global.logger.info("Update Interview [service]", {
      methodName: this.updateUserInterview.name,
    });

    const interviewDetails = await interviewDaoObj.getUserInterviewByEmailAndId(
      payload.candidateEmail,
      interviewId
    );

    if (!interviewDetails) throw new BaseError("Interview not found", HttpStatusCode.NOT_FOUND_404);

    // removvee candidateEmail from payload to avoid updating it
    const { candidateEmail, ...updateData } = payload;
    return interviewDaoObj.updateUserInterviewByIdAndEmail(interviewId, candidateEmail, {
      ...updateData,
      updatedBy: userId,
    } as any);
  }

  /**
   * listUserInterviewByEmail
   * Returns paginated list of interviews based on filters.
   */
  async listUserInterviewByEmail(filter: InterviewFilterOptions) {
    global.logger.info("List Interviews by Email [service]", {
      methodName: this.listUserInterviewByEmail.name,
    });
    return interviewDaoObj.getAllUserInterviewsByFilterOptions(filter);
  }

  /**
   * listUserInterviewDetailsById
   * Returns interview details by id (via GSI1).
   */
  async listUserInterviewDetailsById(interviewId: string) {
    global.logger.info("Get Interview Details [service]", {
      methodName: this.listUserInterviewDetailsById.name,
    });
    return interviewDaoObj.getUserInterviewById(interviewId);
  }

  /**
   * getUserInterviewVideos
   * Fetches all interview recording chunk URLs for a specific interview in order.
   * Returns an array of video URLs mapped to their corresponding questions.
   */
  async getUserInterviewVideos(interviewId: string) {
    global.logger.info("Get Interview Videos [service]", {
      methodName: this.getUserInterviewVideos.name,
    });

    // Fetch the interview details by ID
    const interviewQueryResponse = await interviewDaoObj.getUserInterviewById(interviewId);

    // Convert QueryResponse to array and get first result
    const interviewArray = interviewQueryResponse.toJSON
      ? interviewQueryResponse.toJSON()
      : (interviewQueryResponse as DbInterviewDto[]);

    if (!interviewArray || interviewArray.length === 0) {
      throw new BaseError(
        "Interview not found for the provided interview ID.",
        HttpStatusCode.NOT_FOUND_404
      );
    }

    const interviewDetails = interviewArray[0];

    // Check if interview history exists
    if (!interviewDetails.interviewHistory || interviewDetails.interviewHistory.length === 0) {
      return {
        interviewId: interviewId,
        candidateEmail: interviewDetails.candidateEmail,
        videos: [],
      };
    }

    // Extract chunk URLs from interview history
    const videoChunks = await Promise.all(
      interviewDetails.interviewHistory.map(async (entry: InterviewHistoryEntryDto, index: number) => {
        if (!entry.chunkId || entry.chunkUploadStatus !== "UPLOADED") {
          return {
            questionNumber: index + 1,
            questionId: entry.questionId,
            questionText: entry.questionText,
            chunkId: entry.chunkId || null,
            chunkUrl: null,
            uploadStatus: entry.chunkUploadStatus,
            feedback: entry.feedback || null,
          };
        }

        // Construct the file path for the chunk
        const filePath = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_INTERVIEW_RECORDING.strtr({
          "{interviewId}": interviewId,
          "{userId}": interviewDetails.createdByUserId || "",
        });

        try {
          // Generate the object URL for the chunk
          const chunkUrl = await awsS3ClientLibrary.generateObjectUrl(
            process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
            filePath + "/" + entry.chunkId,
            APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_VIEW_FILE_EXPIRY_IN_SECONDS
          );

          return {
            questionNumber: index + 1,
            questionId: entry.questionId,
            questionText: entry.questionText,
            chunkId: entry.chunkId,
            chunkUrl: chunkUrl,
            uploadStatus: entry.chunkUploadStatus,
            feedback: entry.feedback || null,
          };
        } catch (error) {
          global.logger.error("Error generating chunk URL", {
            chunkId: entry.chunkId,
            error,
          });
          return {
            questionNumber: index + 1,
            questionId: entry.questionId,
            questionText: entry.questionText,
            chunkId: entry.chunkId,
            chunkUrl: null,
            uploadStatus: "ERROR",
            feedback: entry.feedback || null,
          };
        }
      })
    );

    return {
      interviewId: interviewId,
      candidateEmail: interviewDetails.candidateEmail,
      interviewStatus: interviewDetails.status,
      totalQuestions: interviewDetails.totalQuestions,
      videos: videoChunks,
    };
  }
}

const interviewServiceObj = new InterviewService();
export { interviewServiceObj, InterviewService };
