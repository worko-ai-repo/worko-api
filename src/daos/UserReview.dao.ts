// Import the daos
import BaseDao from "./Base.dao";

// Import the dtos
import { GetUserReceivedReviewRequestApiDto, UserReviewCreateApiDto, UserReviewCreateDto } from "../dtos/UserReview.dto";

// Import the models
import { DbUserReviewDto, UserReviewModel } from "../db/models/UserReview.model";

// Import the services
import UlidService from "../services/Ulid.service";

// Import the enums
import { UserReviewCandContext, UserReviewEmpContext } from "../enums/User.enum";
import { MasterServiceCode } from "../enums/MasterService.enum";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

/**
 * UserReviewDao
 * 
 * Class responsible for managing user review related operations and communicating with DynamoDb
 */
class UserReviewDao implements BaseDao {
  modelName: string = "UserReview";

  partitianKey: string = "USR#EML#{emailId}";
  sortKeys: { SK_INIT: string } = {
    SK_INIT: "REVIEW#{userType}#ID#{id}"
  };

  GSI1PK: string = "REVIEW";
  GSI1SK = "ID#{id}";

  /**
   * createReview
   *
   * Creates a new user review for the user
   *
   * @param {string} reviewReceiverEmail - Email of the user for whom the review is being created
   * @param {UserReviewCreateDto} userReviewCreateDto - Data for the review
   * @returns {Promise<DbUserReviewDto>} - Promise resolving to the created review object
   */
  async createReview(userEmail: string, userReviewCreateDto: UserReviewCreateDto): Promise<DbUserReviewDto> {
    // Unqiue id of the entry
    let id = UlidService.getUlidId();

    // Prepare the required details to create entry in the database
    const PK = this.partitianKey.strtr({ "{emailId}": userEmail });
    const SK = this.sortKeys.SK_INIT.strtr({
      "{userType}": userReviewCreateDto.ratingForUserType,
      "{id}": id,
    });
    const reviewDbDetails = {
      PK: PK,
      SK: SK,
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{id}": id
      }),
      id: id,
      ...userReviewCreateDto,
    };

    // Logger message
    global.logger.info("Creating review entry (request).", {
      filePath: __filename,
      methodName: this.createReview.name,
      userEmail: userEmail,
      reviewData: userReviewCreateDto,
      reviewDbDetails: reviewDbDetails,
    });

    return UserReviewModel.create(reviewDbDetails);
  }

  /**
  * getUserReceivedReviews
  *
  * Retrieves all reviews received by a user.
  *
  * @param {string} emailId Email of the user
  * @param {GetUserReceivedReviewRequestApiDto} reviewFilters  Filter Options
  * @returns {Promise<QueryResponse<DbUserReviewDto>>}  Promise resolving to the retrieved reviews
  */
  async getUserReceivedReviews(emailId: string, reviewFilters: GetUserReceivedReviewRequestApiDto): Promise<QueryResponse<DbUserReviewDto>> {
    const PK = this.partitianKey.strtr({ "{emailId}": emailId });

    // Query only for reviews using GSI1PK
    let query = UserReviewModel
      .query("PK")
      .eq(PK);

    if (reviewFilters?.ratingForUserType) {
      query = query.where("SK").beginsWith(`REVIEW#${reviewFilters.ratingForUserType}#`);
    } else {
      query = query.where("SK").beginsWith("REVIEW#")
    }

    // Add additional filters if provided
    if (reviewFilters) {
      if (reviewFilters.masterServiceCode) {
        query = query.where("masterServiceCode").eq(reviewFilters.masterServiceCode);
      }

      if (reviewFilters.referalId) {
        query = query.where("referalId").eq(reviewFilters.referalId);
      }

      if (reviewFilters.reviewContext) {
        query = query.where("reviewContext").eq(reviewFilters.reviewContext);
      }

      if (reviewFilters.serviceReqId) {
        query = query.where("serviceReqId").eq(reviewFilters.serviceReqId);
      }
    }

    // Execute the query and return the result
    return query.exec();
  }


}

const userReviewDao = new UserReviewDao();
export default userReviewDao;
