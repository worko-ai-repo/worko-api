// Import dynamoose
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import BaseDao from "./Base.dao";

// Import db models
import { DbInterviewDto, InterviewModel } from "../db/models/UserInterview.model";

// Import dtos
import { PaginatedResultsWithMatchingConditionsResponse } from "../dtos/Common.dto";
import { InterviewFilterOptions, InterviewRequestCreateApiDTO } from "../dtos/UserInterview.dto";

// Import enums
import { InterviewStatusEnum } from "../enums/UserInterview.enum";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";

// Import services
import UlidService from "../services/Ulid.service";

class InterviewDao implements BaseDao {
  modelName = "Interview";
  partitianKey = "USR#EML#{primaryEmail}";
  sortKeys = { SK_INIT: "VINT#ID#{id}" };
  GSI1PK = "VINT#";
  GSI1SK = "ID#{id}";

  /**
   * preparePKAndSKForQuery
   * Builds PK/SK for a user email and interview id.
   */
  preparePKAndSKForQuery(primaryEmail: string, id: string): { PK: string; SK: string } {
    return {
      PK: this.partitianKey.strtr({ "{primaryEmail}": primaryEmail }),
      SK: this.sortKeys.SK_INIT.strtr({ "{id}": id }),
    };
  }

  /**
   * prepareGSI1PKAndGSI1SKForQuery
   * Builds GSI1 keys for global interview lookups by id.
   */
  prepareGSI1PKAndGSI1SKForQuery(id: string): { GSI1PK: string; GSI1SK: string } {
    return {
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({ "{id}": id }),
    };
  }

  /**
   * createUserInterviewRequest
   * Creates a new interview item with PENDING status.
   */
  async createUserInterviewRequest(
    corporateUserId: string,
    candidateEmail: string,
    payload: InterviewRequestCreateApiDTO
  ): Promise<DbInterviewDto> {
    global.logger.info("Create Interview Request [dao]", {
      corporateUserId,
      candidateEmail,
      methodName: this.createUserInterviewRequest.name,
    });

    const ulidId: string = UlidService.getUlidId();
    const { PK, SK } = this.preparePKAndSKForQuery(candidateEmail, ulidId);
    const { GSI1SK } = this.prepareGSI1PKAndGSI1SKForQuery(ulidId);
    const data = {
      id: ulidId,
      PK: PK,
      SK: SK,
      GSI1PK: this.GSI1PK,
      GSI1SK: GSI1SK,
      createdByUserId: corporateUserId,
      candidateEmail,
      status: InterviewStatusEnum.PENDING,
      totalQuestions: 0,
      currentQuestion: "0",
      requestedBy: [
        {
          corporateUserId: corporateUserId,
          companyId: payload.companyId,
          position: payload.position,
          companyName: payload.companyName,
          requesterUserName: payload.requesterUserName,
          requestedByActor: payload.requestedByActor,
          jobId: payload.jobId,
          requestedAt: dateHelperObj.getISODate(),
        },
      ],
    } as Partial<DbInterviewDto>;

    return InterviewModel.create(data as DbInterviewDto);
  }

  /**
   * initiateUserInterview
   *
   *  Initiates an interview for a candidate by updating its status to IN_PROGRESS.
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
      | "interviewHistory"
      | "typeOfcandidate"
    >
  ): Promise<DbInterviewDto> {
    global.logger.info("Initiate Interview DAO [dao]", {
      methodName: this.initiateUserInterview.name,
      candidateEmail: body.candidateEmail,
    });

    // Proceed to create new interview initiation
    const ulidId: string = UlidService.getUlidId();
    const { PK, SK } = this.preparePKAndSKForQuery(body.candidateEmail, ulidId);
    const { GSI1SK } = this.prepareGSI1PKAndGSI1SKForQuery(ulidId);
    const data = {
      ...body,
      id: ulidId,
      PK:PK, 
      SK: SK,
      GSI1PK: this.GSI1PK,
      GSI1SK: GSI1SK,
      candidateEmail: body.candidateEmail,
      status: InterviewStatusEnum.PENDING,
      typeOfcandidate: body.typeOfcandidate,
    } as Partial<DbInterviewDto>;

    return InterviewModel.create(data as DbInterviewDto);
  }

  /**
   * getInterviewByEmail
   * Retrieves interview items by candidate email.
   */
  async getUserInterviewByEmail(candidateEmail: string): Promise<QueryResponse<DbInterviewDto>> {
    global.logger.info("Get Interview by Email [dao]", {
      methodName: this.getUserInterviewByEmail.name,
      candidateEmail,
    });
    const PK = this.partitianKey.strtr({ "{primaryEmail}": candidateEmail });
    return InterviewModel.query("PK").eq(PK).where("SK").beginsWith("VINT#ID#").exec();
  }

  /**
   * getUserInterviewById
   * Retrieves interview item by id using GSI1.
   */
  async getUserInterviewById(interviewId: string): Promise<QueryResponse<DbInterviewDto>> {
    global.logger.info("Get Interview by Id [dao]", {
      methodName: this.getUserInterviewById.name,
      interviewId,
    });
    const { GSI1PK, GSI1SK } = this.prepareGSI1PKAndGSI1SKForQuery(interviewId);
    return InterviewModel.query("GSI1PK").eq(GSI1PK).where("GSI1SK").eq(GSI1SK).exec();
  }

  /**
   * getUserInterviewByEmailAndId
   *
   * Retrieves interview item by candidate email and interview id using get operation.
   */
  async getUserInterviewByEmailAndId(
    candidateEmail: string,
    interviewId: string
  ): Promise<DbInterviewDto | null> {
    global.logger.info("Get Interview by Email and Id [dao]", {
      methodName: this.getUserInterviewByEmailAndId.name,
      candidateEmail,
      interviewId,
    });
    const { PK, SK } = this.preparePKAndSKForQuery(candidateEmail, interviewId);
    return InterviewModel.get({ PK, SK });
  }

  /**
   * updateUserInterviewByIdAndEmail
   * Updates an interview item via PK/SK constructed from email and id.
   */
  async updateUserInterviewByIdAndEmail(
    interviewId: string,
    email: string,
    updateData: Partial<DbInterviewDto>
  ): Promise<DbInterviewDto> {
    global.logger.info("Update Interview by Id and Email [dao]", {
      methodName: this.updateUserInterviewByIdAndEmail.name,
      interviewId,
      email,
      updateData,
    });

    const { PK, SK } = this.preparePKAndSKForQuery(email, interviewId);
    return InterviewModel.update({ PK, SK }, updateData);
  }

  /**
   * getAllUserInterviewsByFilterOptions
   * Applies filters for listing interviews (email/status/companyId) with pagination.
   */
  async getAllUserInterviewsByFilterOptions(
    filter: InterviewFilterOptions
  ): Promise<PaginatedResultsWithMatchingConditionsResponse<DbInterviewDto>> {
    global.logger.info("Get Interviews by Filter Options [dao]", {
      methodName: this.getAllUserInterviewsByFilterOptions.name,
      filter,
    });

    let query: Query<DbInterviewDto>;

    if (filter.email) {
      query = InterviewModel.query("PK")
        .eq(this.partitianKey.strtr({ "{primaryEmail}": filter.email }))
        .where("SK")
        .beginsWith(this.sortKeys.SK_INIT.strtr({ "{id}": "" }));
    } else {
      query = InterviewModel.query("GSI1PK")
        .eq(this.GSI1PK)
        .where("GSI1SK")
        .beginsWith(this.GSI1SK.strtr({ "{id}": "" }));
    }

    if (filter.status) {
      query = query.and().parenthesis((c) => c.where("status").eq(filter.status!));
    }

    if (filter.companyId) {
      query = query
        .and()
        .parenthesis((c) => c.where("requestedBy[0].companyId").eq(filter.companyId!));
    }

    return getPaginatedResultsWithMatchingConditions<DbInterviewDto, InterviewFilterOptions>(
      query,
      filter
    );
  }
}

const interviewDaoObj = new InterviewDao();
export { interviewDaoObj, InterviewDao };
